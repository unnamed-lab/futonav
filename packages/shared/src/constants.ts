// Centroid of 18 OpenStreetMap-verified campus buildings (Overpass API, 2026-07-14).
// The previous value (5.3927, 7.0009) had no real buildings within ~1km of it.
export const FUTO_CENTROID = { latitude: 5.3843, longitude: 6.9923 };

export const FUTO_DEFAULT_REGION = {
  ...FUTO_CENTROID,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export const WALKING_SPEED_KMH = 5;
export const BIKE_SPEED_KMH = 15;
export const CAR_SPEED_KMH = 30;
export const EARTH_RADIUS_M = 6_371_000;
export const LOCATION_UPDATE_MS = 2_000;
