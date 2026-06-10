import Constants from "expo-constants";

export function getGoogleMapsKey(): string | undefined {
  return (
    (Constants.expoConfig?.extra?.googleMapsKey as string) ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY
  );
}
