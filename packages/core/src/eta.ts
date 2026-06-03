import { WALKING_SPEED_KMH } from "@futonav/shared";

export function walkingEtaMinutes(distanceMeters: number): number {
  if (distanceMeters < 0) return 0;
  const metersPerMin = (WALKING_SPEED_KMH * 1000) / 60;
  return Math.max(1, Math.round(distanceMeters / metersPerMin));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}
