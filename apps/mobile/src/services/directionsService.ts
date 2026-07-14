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
  mode: "walking" | "bike" | "car",
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
      console.warn("Google Directions API status is not OK:", data.status);
      return null;
    }

    const route = data.routes[0];
    const leg = route.legs[0];
    const encodedPolyline = route.overview_polyline.points;
    const polyline = decodePolyline(encodedPolyline);
    const distanceMeters = leg.distance.value;
    
    let etaMinutes = Math.max(1, Math.round(leg.duration.value / 60));

    // Add realistic campus buffer overheads
    if (mode === "bike") {
      etaMinutes += 1; // account for unlocking/locking/mounting
    } else if (mode === "car") {
      etaMinutes += 2; // account for startup/parking/walking from lot
    }

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
