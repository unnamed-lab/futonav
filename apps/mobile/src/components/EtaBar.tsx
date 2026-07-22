import { View, Text, StyleSheet } from "react-native";
import { formatDistance, calculateEtaMinutes, haversineMeters, calculateManeuvers } from "@futonav/core";
import { ROAD_DISTANCE_FACTOR } from "@futonav/shared";
import { useLocationStore } from "../stores/useLocationStore";
import { useNavStore } from "../stores/useNavStore";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS } from "../theme/theme";

export function EtaBar() {
  const currentPosition = useLocationStore((s) => s.currentPosition);
  const permissionStatus = useLocationStore((s) => s.permissionStatus);
  const { selectedPoi, transportMode, route } = useNavStore();

  if (!selectedPoi) return null;

  if (!currentPosition) {
    return (
      <View style={styles.container}>
        <View style={styles.navCapsule}>
          <View style={styles.iconWrapper}>
            <Ionicons name="location-outline" size={14} color={COLORS.white} />
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {permissionStatus === "denied"
              ? "Location permission denied"
              : "Acquiring GPS location..."}
          </Text>
        </View>
      </View>
    );
  }

  const straightLineDist = haversineMeters(
    { latitude: currentPosition.latitude, longitude: currentPosition.longitude },
    { latitude: selectedPoi.latitude, longitude: selectedPoi.longitude },
  );
  const estimatedRoadDist = straightLineDist * ROAD_DISTANCE_FACTOR;

  const displayDist = route ? route.distanceMeters : estimatedRoadDist;
  const displayEta = route ? route.etaMinutes : calculateEtaMinutes(estimatedRoadDist, transportMode);
  const isOffline = route?.source === "offline-cache" || route?.source === "offline-graph";

  const maneuvers = route?.polyline && route.polyline.length >= 2 ? calculateManeuvers(route.polyline) : [];
  const nextManeuver = maneuvers.length > 0 ? maneuvers[0] : null;

  const getManeuverIcon = (type: string) => {
    switch (type) {
      case "turn-right":
      case "sharp-right":
        return "arrow-forward";
      case "turn-left":
      case "sharp-left":
        return "arrow-back";
      case "arrive":
        return "location";
      default:
        return "arrow-up";
    }
  };

  return (
    <View style={styles.container}>
      {nextManeuver ? (
        <View style={styles.maneuverCapsule}>
          <View style={styles.maneuverIconWrapper}>
            <Ionicons name={getManeuverIcon(nextManeuver.type) as any} size={16} color={COLORS.white} />
          </View>
          <View style={styles.maneuverInfo}>
            <Text style={styles.maneuverText} numberOfLines={1}>
              {nextManeuver.instruction}
            </Text>
            <Text style={styles.maneuverSubtext}>
              in {formatDistance(nextManeuver.distanceMeters)}
            </Text>
          </View>
        </View>
      ) : null}

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
  maneuverCapsule: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  maneuverIconWrapper: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    padding: 8,
    marginRight: 12,
  },
  maneuverInfo: {
    flex: 1,
  },
  maneuverText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
  maneuverSubtext: {
    fontFamily: FONTS.semibold,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
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

