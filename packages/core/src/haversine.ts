import { EARTH_RADIUS_M } from "@futonav/shared";

export interface LatLng {
  latitude: number;
  longitude: number;
}

const toRad = (d: number) => (d * Math.PI) / 180;

export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function projectPointOntoSegment(p: LatLng, a: LatLng, b: LatLng): LatLng {
  const vx = b.longitude - a.longitude;
  const vy = b.latitude - a.latitude;
  const wx = p.longitude - a.longitude;
  const wy = p.latitude - a.latitude;

  const c1 = wx * vx + wy * vy;
  if (c1 <= 0) return a;

  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) return b;

  const t = c1 / c2;
  return {
    latitude: a.latitude + t * vy,
    longitude: a.longitude + t * vx,
  };
}

export function distanceToSegment(p: LatLng, a: LatLng, b: LatLng): number {
  const proj = projectPointOntoSegment(p, a, b);
  return haversineMeters(p, proj);
}
