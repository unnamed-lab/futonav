import type { ExpoConfig } from "expo/config";

export default (): ExpoConfig => ({
  name: "FutoNav",
  slug: "futonav",
  scheme: "futonav",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  icon: "./assets/icon.png",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.unnamedcodes.futonav",
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "FutoNav uses your location to show you on the campus map and calculate walking distances.",
    },
  },
  android: {
    package: "com.unnamedcodes.futonav",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_ANDROID_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
      },
    },
    permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-dev-client",
    "expo-font",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Allow FutoNav to use your location to show your position on campus.",
        locationWhenInUsePermission:
          "Allow FutoNav to use your location to show your position on campus.",
      },
    ],
    "expo-sqlite",
  ],
  owner: "unnamedcodes",
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    googleMapsKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || process.env.GOOGLE_MAPS_ANDROID_KEY,
    eas: {
      projectId: "935a43a7-aa4c-4af9-9d0a-c1bee9c8b4de",
    },
  },
});
