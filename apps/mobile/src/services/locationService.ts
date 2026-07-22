import * as Location from "expo-location";
import { LOCATION_UPDATE_MS } from "@futonav/shared";
import { useLocationStore } from "../stores/useLocationStore";

let subscription: Location.LocationSubscription | null = null;
let headingSubscription: Location.LocationSubscription | null = null;

export async function requestPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  const granted = status === "granted";
  useLocationStore.getState().setPermissionStatus(granted ? "granted" : "denied");
  return granted;
}

export async function startWatching() {
  if (subscription) return;

  const granted = await requestPermission();
  if (!granted) return;

  // Immediately query highest accuracy GPS position on start
  try {
    
    const initialLoc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });
    if (initialLoc?.coords) {
      useLocationStore.getState().setCurrentPosition(
        { latitude: initialLoc.coords.latitude, longitude: initialLoc.coords.longitude },
        initialLoc.coords.accuracy ?? 0,
      );
    }
  } catch {
    // Fall back to stream listener
  }

  subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: LOCATION_UPDATE_MS,
      distanceInterval: 0,
    },
    (loc) => {
      const { latitude, longitude } = loc.coords;
      useLocationStore.getState().setCurrentPosition(
        { latitude, longitude },
        loc.coords.accuracy ?? 0,
      );
    },
  );

  // Defer heading sensor listener to prevent Expo Android LocationModule Kotlin init crash
  setTimeout(async () => {
    try {
      if (!subscription) return;
      headingSubscription = await Location.watchHeadingAsync((data) => {
        if (data.trueHeading >= 0) {
          useLocationStore.getState().setHeading(data.trueHeading);
        } else if (data.magHeading >= 0) {
          useLocationStore.getState().setHeading(data.magHeading);
        }
      });
    } catch {
      // Compass hardware sensors unavailable on simulator or device
    }
  }, 1000);
}

export function stopWatching() {
  subscription?.remove();
  subscription = null;
  headingSubscription?.remove();
  headingSubscription = null;
}

export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    return await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  } catch {
    return null;
  }
}
