// Centroid of 18 OpenStreetMap-verified campus buildings (Overpass API, 2026-07-14).
// The previous value (5.3927, 7.0009) had no real buildings within ~1km of it.
export const FUTO_CENTROID = { latitude: 5.3843, longitude: 6.9923 };

export const FUTO_DEFAULT_REGION = {
  ...FUTO_CENTROID,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export type TransportMode = "walking" | "bike" | "car";

/**
 * Single source of truth for every mode's travel model. Tune these values
 * here — nothing downstream should hardcode speeds or time buffers.
 *
 *  - speedKmh:      realistic *average* moving speed on FUTO's internal roads,
 *                   not free-flow max. Campus roads have speed bumps, pedestrian
 *                   traffic and junctions, so cars average far below 30 km/h.
 *  - setupMinutes:  fixed door-to-door overhead independent of distance
 *                   (unlocking/mounting a bike, starting a car + parking +
 *                   walking from the lot). Applied once per trip.
 */
export interface TransportProfile {
  speedKmh: number;
  setupMinutes: number;
}

export const TRANSPORT_PROFILES: Record<TransportMode, TransportProfile> = {
  walking: { speedKmh: 4.8, setupMinutes: 0 },
  bike: { speedKmh: 13, setupMinutes: 1 },
  car: { speedKmh: 22, setupMinutes: 2 },
};

// Real footpaths/roads curve; straight-line (crow-flies) distance underestimates
// actual travel distance. Used to estimate an ETA before a real route is loaded.
export const ROAD_DISTANCE_FACTOR = 1.3;

// A real routing distance more than this multiple of the crow-flies distance
// almost always means the router detoured off-campus (FUTO's internal roads are
// often missing from driving graphs). Such results are rejected as unreliable.
export const MAX_DETOUR_FACTOR = 3.5;

// Legacy aliases retained for backward compatibility; derived from the profiles
// above so there is still a single source of truth.
export const WALKING_SPEED_KMH = TRANSPORT_PROFILES.walking.speedKmh;
export const BIKE_SPEED_KMH = TRANSPORT_PROFILES.bike.speedKmh;
export const CAR_SPEED_KMH = TRANSPORT_PROFILES.car.speedKmh;

export const EARTH_RADIUS_M = 6_371_000;
export const LOCATION_UPDATE_MS = 2_000;
