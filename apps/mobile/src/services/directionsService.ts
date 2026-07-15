import { calculateEtaMinutes, haversineMeters } from "@futonav/core";
import { MAX_DETOUR_FACTOR, type TransportMode } from "@futonav/shared";
import { getGoogleMapsKey } from "./mapKeyProvider";

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface GoogleRouteResult {
  polyline: LatLng[];
  distanceMeters: number;
  etaMinutes: number;
}

/**
 * Decodes Google's encoded polyline format into an array of LatLng coordinates.
 */
function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
}

/**
 * Fetches directions from Google Directions API.
 */
export async function fetchGoogleRoute(
  start: LatLng,
  end: LatLng,
  mode: TransportMode,
): Promise<GoogleRouteResult | null> {
  const apiKey = getGoogleMapsKey();
  if (!apiKey) {
    console.warn("Google Maps API Key not available.");
    return null;
  }

  let googleMode = "walking";
  if (mode === "bike") {
    googleMode = "bicycling";
  } else if (mode === "car") {
    googleMode = "driving";
  }

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=${googleMode}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" || !data.routes || data.routes.length === 0) {
      // error_message surfaces the real cause, e.g. REQUEST_DENIED when the key
      // isn't authorized for the Directions API (distinct from the Maps SDK) or
      // ZERO_RESULTS when the mode has no path on campus.
      console.warn(
        "Google Directions API status is not OK:",
        data.status,
        data.error_message ?? "",
      );
      return null;
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Prefer the high-fidelity per-step geometry, which hugs the actual road,
    // over route.overview_polyline (a decimated path that visibly cuts corners
    // and slices across buildings). Fall back to the overview if steps are absent.
    const steps = leg.steps as { polyline?: { points: string } }[] | undefined;
    let polyline: LatLng[];
    if (steps && steps.length > 0) {
      polyline = [];
      for (const step of steps) {
        if (!step.polyline?.points) continue;
        const segment = decodePolyline(step.polyline.points);
        // Skip the first point of each subsequent step to avoid duplicates.
        polyline.push(...(polyline.length > 0 ? segment.slice(1) : segment));
      }
    } else {
      polyline = decodePolyline(route.overview_polyline.points);
    }

    const distanceMeters = leg.distance.value;

    // Reject obvious off-campus detours: FUTO's internal roads are frequently
    // missing from Google's driving/bicycling graph, so the router loops out to
    // the public highway and back. When that happens, defer to the on-campus
    // Dijkstra fallback instead of showing an inflated distance/ETA.
    const crowFliesMeters = haversineMeters(start, end);
    if (crowFliesMeters > 0 && distanceMeters > crowFliesMeters * MAX_DETOUR_FACTOR) {
      console.warn("Google route rejected as an off-campus detour.");
      return null;
    }

    // Single shared ETA model: trust Google's traffic-aware duration but clamp
    // it to a physically plausible band (see calculateEtaMinutes).
    const etaMinutes = calculateEtaMinutes(distanceMeters, mode, leg.duration.value);

    return {
      polyline,
      distanceMeters,
      etaMinutes,
    };
  } catch (err) {
    console.error("Google Directions fetch failed:", err);
    return null;
  }
}
