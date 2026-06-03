import { View, Text, StyleSheet } from "react-native";
import { formatDistance, walkingEtaMinutes } from "@futonav/core";
import { haversineMeters } from "@futonav/core";
import { useLocationStore } from "../stores/useLocationStore";
import { useNavStore } from "../stores/useNavStore";

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
      <Text style={styles.distance}>{formatDistance(dist)}</Text>
      <Text style={styles.eta}>~{eta} min</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  distance: { fontSize: 16, fontWeight: "600" },
  eta: { fontSize: 16, color: "#0066CC", fontWeight: "600" },
});
