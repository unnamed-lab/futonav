export const CATEGORY_THEMES: Record<string, { color: string; icon: string }> = {
  Department: { color: "#0284C7", icon: "business" },
  Hostel: { color: "#0D9488", icon: "bed" },
  Admin: { color: "#4F46E5", icon: "ribbon" },
  Cafeteria: { color: "#D97706", icon: "cafe" },
  Gate: { color: "#475569", icon: "enter" },
  Sports: { color: "#16A34A", icon: "football" },
  Medical: { color: "#DC2626", icon: "medical" },
  Library: { color: "#7C3AED", icon: "book" },
  Other: { color: "#64748B", icon: "map" },
};

export const COLORS = {
  // Brand Colors
  primary: "#0F172A",      // Dark Slate Navy
  primaryLight: "#1E293B", // Lighter Slate
  accent: "#0D9488",       // Deep Emerald Teal
  accentLight: "#0F766E",  // Darker Teal for high contrast
  accentSurface: "#F0FDFA", // Teal Tint background

  // Neutral Colors
  background: "#F8FAFC",   // Clean warm light background
  surface: "#FFFFFF",      // Card and sheets surface
  border: "#E2E8F0",       // Thin borders
  borderLight: "#F1F5F9",  // Subtle divider borders
  textMain: "#0F172A",     // Primary text
  textMuted: "#475569",    // Secondary/body text
  textLight: "#94A3B8",    // Placeholder/caption text
  white: "#FFFFFF",

  // Status Colors
  success: "#10B981",      // Success Green
  error: "#EF4444",        // Error Red
  warning: "#F59E0B",      // Warning Orange
};

export const SHADOWS = {
  // Ultra-subtle, organic shadows to avoid 'AI slop' look
  sm: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const FONTS = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
};

// Premium minimal map style to clean up standard Google Maps
export const MAP_STYLE_JSON = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f8fafc" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#f1f5f9" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#e2e8f0" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#f1f5f9" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#e0f2fe" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0284c7" }],
  },
];
