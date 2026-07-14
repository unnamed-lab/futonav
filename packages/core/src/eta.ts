import { WALKING_SPEED_KMH, BIKE_SPEED_KMH, CAR_SPEED_KMH } from "@futonav/shared";

export function calculateEtaMinutes(
  distanceMeters: number,
  mode: "walking" | "bike" | "car",
): number {
  if (distanceMeters < 0) return 0;

  let speedKmh = WALKING_SPEED_KMH;
  let bufferMinutes = 0;

  if (mode === "bike") {
    speedKmh = BIKE_SPEED_KMH;
    bufferMinutes = 1; // account for unlocking/locking/mounting
  } else if (mode === "car") {
    speedKmh = CAR_SPEED_KMH;
    bufferMinutes = 2; // account for startup/parking/walking from lot
  }

  const metersPerMin = (speedKmh * 1000) / 60;
  const baseMinutes = Math.round(distanceMeters / metersPerMin);
  return Math.max(1 + bufferMinutes, baseMinutes + bufferMinutes);
}

export function walkingEtaMinutes(distanceMeters: number): number {
  return calculateEtaMinutes(distanceMeters, "walking");
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}
