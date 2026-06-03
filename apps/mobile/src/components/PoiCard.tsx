import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Poi } from "@futonav/shared";
import { formatDistance, walkingEtaMinutes } from "@futonav/core";
import { haversineMeters } from "@futonav/core";
import { useLocationStore } from "../stores/useLocationStore";

interface PoiCardProps {
  poi: Poi;
  onEnd: () => void;
}

export function PoiCard({ poi, onEnd }: PoiCardProps) {
  const currentPosition = useLocationStore((s) => s.currentPosition);

  const dist = currentPosition
    ? haversineMeters(
        { latitude: currentPosition.latitude, longitude: currentPosition.longitude },
        { latitude: poi.latitude, longitude: poi.longitude },
      )
    : 0;

  const eta = walkingEtaMinutes(dist);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{poi.name}</Text>
      <Text style={styles.category}>{poi.category}</Text>
      {poi.description && <Text style={styles.description}>{poi.description}</Text>}
      <View style={styles.stats}>
        <Text style={styles.stat}>{formatDistance(dist)}</Text>
        <Text style={styles.stat}>~{eta} min walk</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onEnd}>
        <Text style={styles.buttonText}>End Navigation</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  name: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  category: { fontSize: 14, color: "#666", marginBottom: 8 },
  description: { fontSize: 14, color: "#444", marginBottom: 12 },
  stats: { flexDirection: "row", gap: 24, marginBottom: 16 },
  stat: { fontSize: 16, fontWeight: "600", color: "#0066CC" },
  button: {
    backgroundColor: "#E74C3C",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
