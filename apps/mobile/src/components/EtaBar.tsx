import { View, Text, StyleSheet } from "react-native";
import { formatDistance, walkingEtaMinutes } from "@futonav/core";
import { haversineMeters } from "@futonav/core";
import { useLocationStore } from "../stores/useLocationStore";
import { useNavStore } from "../stores/useNavStore";
import { Ionicons } from "@expo/vector-icons";

export function EtaBar() {
  const currentPosition = useLocationStore((s) => s.currentPosition);
  const selectedPoi = useNavStore((s) => s.selectedPoi);

  if (!currentPosition || !selectedPoi) return null;

  const dist = haversineMeters(
    { latitude: currentPosition.latitude, longitude: currentPosition.longitude },
    { latitude: selectedPoi.latitude, longitude: selectedPoi.longitude },
  );

  const eta = walkingEtaMinutes(dist);

  return (
    <View style={styles.container}>
      <View style={styles.navCapsule}>
        <View style={styles.iconWrapper}>
          <Ionicons name="navigate" size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          Navigating to {selectedPoi.name}
        </Text>
      </View>
      <View style={styles.timeCapsule}>
        <Ionicons name="walk-outline" size={16} color="#0D9488" />
        <Text style={styles.etaText}>{eta} min</Text>
        <Text style={styles.divider}>•</Text>
        <Text style={styles.distText}>{formatDistance(dist)}</Text>
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
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  iconWrapper: {
    backgroundColor: "#0D9488",
    borderRadius: 8,
    padding: 4,
    marginRight: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  timeCapsule: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  etaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D9488",
    marginLeft: 6,
  },
  divider: {
    fontSize: 14,
    color: "#94A3B8",
    marginHorizontal: 8,
  },
  distText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
});
