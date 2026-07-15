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
 * Fetches a route from the Google Routes API (routes.googleapis.com). This is
 * the current API — the legacy Directions API is retired and returns
 * REQUEST_DENIED ("calling a legacy API") on new projects.
 *
 * Requires the "Routes API" to be enabled on the Google Cloud project and the
 * key to permit it (a key restricted to the Maps SDK alone will be rejected).
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

  const travelMode = mode === "car" ? "DRIVE" : mode === "bike" ? "BICYCLE" : "WALK";

  const body: Record<string, unknown> = {
    origin: { location: { latLng: { latitude: start.latitude, longitude: start.longitude } } },
    destination: { location: { latLng: { latitude: end.latitude, longitude: end.longitude } } },
    travelMode,
    polylineQuality: "HIGH_QUALITY",
    computeAlternativeRoutes: false,
  };
  // routingPreference is only valid for DRIVE/TWO_WHEELER; sending it for
  // WALK/BICYCLE makes the Routes API reject the request.
  if (travelMode === "DRIVE") {
    body.routingPreference = "TRAFFIC_AWARE";
  }

  try {
    const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // Field mask is required; only the fields we consume are requested.
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || !data.routes || data.routes.length === 0) {
      console.warn(
        "Google Routes API error:",
        res.status,
        JSON.stringify(data.error ?? data).slice(0, 300),
      );
      return null;
    }

    const route = data.routes[0];
    const polyline = decodePolyline(route.polyline?.encodedPolyline ?? "");
    const distanceMeters = route.distanceMeters ?? 0;
    // duration arrives as a string like "780s".
    const durationSeconds = parseInt(String(route.duration ?? "0").replace("s", ""), 10) || 0;

    if (polyline.length === 0 || distanceMeters === 0) {
      return null;
    }

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
    const etaMinutes = calculateEtaMinutes(distanceMeters, mode, durationSeconds);

    return {
      polyline,
      distanceMeters,
      etaMinutes,
    };
  } catch (err) {
    console.error("Google Routes fetch failed:", err);
    return null;
  }
}
