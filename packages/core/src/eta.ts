import { TRANSPORT_PROFILES, type TransportMode } from "@futonav/shared";

/**
 * Computes a door-to-door ETA in minutes for a trip of `distanceMeters`.
 *
 * This is the single ETA model used everywhere (Google routes, the offline
 * Dijkstra fallback, and the live EtaBar) so the number stays consistent as a
 * route resolves instead of jumping between formulas.
 *
 * If `realDurationSeconds` is supplied (e.g. from Google Directions) it is
 * trusted, but clamped to a physically plausible band around the profile-speed
 * estimate. That guards against anomalous API durations without discarding the
 * traffic-aware signal.
 */
export function calculateEtaMinutes(
  distanceMeters: number,
  mode: TransportMode,
  realDurationSeconds?: number,
): number {
  if (distanceMeters < 0) return 0;

  const { speedKmh, setupMinutes } = TRANSPORT_PROFILES[mode];
  const metersPerMin = (speedKmh * 1000) / 60;
  const modelMinutes = distanceMeters / metersPerMin;

  let travelMinutes = modelMinutes;
  if (realDurationSeconds != null && realDurationSeconds > 0) {
    const realMinutes = realDurationSeconds / 60;
    const lower = modelMinutes * 0.5;
    const upper = modelMinutes * 2.5;
    travelMinutes = Math.min(Math.max(realMinutes, lower), upper);
  }

  return Math.max(1, Math.round(travelMinutes + setupMinutes));
}

export function walkingEtaMinutes(distanceMeters: number): number {
  return calculateEtaMinutes(distanceMeters, "walking");
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}
