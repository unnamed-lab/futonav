import { View, Text, StyleSheet } from "react-native";
import { formatDistance, calculateEtaMinutes, haversineMeters } from "@futonav/core";
import { ROAD_DISTANCE_FACTOR } from "@futonav/shared";
import { useLocationStore } from "../stores/useLocationStore";
import { useNavStore } from "../stores/useNavStore";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS } from "../theme/theme";

export function EtaBar() {
  const currentPosition = useLocationStore((s) => s.currentPosition);
  const { selectedPoi, transportMode, route } = useNavStore();

  if (!currentPosition || !selectedPoi) return null;

  // Before a real route resolves, approximate travel distance from the
  // crow-flies distance scaled by a road factor so the displayed ETA is close
  // to the eventual routed value and doesn't visibly jump when it arrives.
  const straightLineDist = haversineMeters(
    { latitude: currentPosition.latitude, longitude: currentPosition.longitude },
    { latitude: selectedPoi.latitude, longitude: selectedPoi.longitude },
  );
  const estimatedRoadDist = straightLineDist * ROAD_DISTANCE_FACTOR;

  const displayDist = route ? route.distanceMeters : estimatedRoadDist;
  const displayEta = route ? route.etaMinutes : calculateEtaMinutes(estimatedRoadDist, transportMode);
  const isOffline = route?.source === "offline-cache" || route?.source === "offline-graph";

  return (
    <View style={styles.container}>
      <View style={styles.navCapsule}>
        <View style={styles.iconWrapper}>
          <Ionicons name="navigate" size={14} color={COLORS.white} />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          Navigating to {selectedPoi.name}
        </Text>
      </View>
      <View style={styles.timeCapsule}>
        <Ionicons
          name={transportMode === "walking" ? "walk" : transportMode === "bike" ? "bicycle" : "car"}
          size={14}
          color={COLORS.accent}
        />
        <Text style={styles.etaText}>{displayEta} min</Text>
        <Text style={styles.divider}>•</Text>
        <Text style={styles.distText}>{formatDistance(displayDist)}</Text>
        {isOffline ? (
          <>
            <Text style={styles.divider}>•</Text>
            <Ionicons name="cloud-offline-outline" size={12} color={COLORS.textLight} />
            <Text style={styles.offlineText}>Offline</Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: "column",
    gap: 8,
  },
  navCapsule: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.md,
  },
  iconWrapper: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    padding: 5,
    marginRight: 10,
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 13,
    flex: 1,
  },
  timeCapsule: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  etaText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.accent,
    marginLeft: 4,
  },
  divider: {
    fontSize: 13,
    color: COLORS.textLight,
    marginHorizontal: 6,
  },
  distText: {
    fontFamily: FONTS.semibold,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  offlineText: {
    fontFamily: FONTS.semibold,
    fontSize: 11,
    color: COLORS.textLight,
    marginLeft: 3,
  },
});

