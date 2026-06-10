import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavStore } from "../../src/stores/useNavStore";
import { formatDistance, walkingEtaMinutes, haversineMeters } from "@futonav/core";
import { useLocationStore } from "../../src/stores/useLocationStore";

export default function PoiDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const selectedPoi = useNavStore((s) => s.selectedPoi);
  const selectPoi = useNavStore((s) => s.selectPoi);
  const currentPosition = useLocationStore((s) => s.currentPosition);

  const poi = selectedPoi;

  const dist =
    currentPosition && poi
      ? haversineMeters(
          { latitude: currentPosition.latitude, longitude: currentPosition.longitude },
          { latitude: poi.latitude, longitude: poi.longitude },
        )
      : 0;

  const eta = walkingEtaMinutes(dist);

  const handleNavigate = () => {
    if (poi) {
      selectPoi(poi);
      router.back();
    }
  };

  if (!poi) {
    return (
      <View style={styles.container}>
        <Text style={styles.name}>POI not found</Text>
        <Text>ID: {id}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{poi.name}</Text>
      <Text style={styles.category}>{poi.category}</Text>
      {!!poi.description && <Text style={styles.description}>{poi.description}</Text>}
      <View style={styles.stats}>
        <Text style={styles.stat}>{formatDistance(dist)} away</Text>
        <Text style={styles.stat}>~{eta} min walk</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleNavigate}>
        <Text style={styles.buttonText}>Navigate</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  name: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  category: { fontSize: 14, color: "#666", marginBottom: 12, textTransform: "uppercase" },
  description: { fontSize: 15, color: "#444", marginBottom: 20, lineHeight: 22 },
  stats: { flexDirection: "row", gap: 24, marginBottom: 32 },
  stat: { fontSize: 18, fontWeight: "600", color: "#0066CC" },
  button: {
    backgroundColor: "#0066CC",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  backButton: { alignItems: "center", paddingVertical: 8 },
  backText: { fontSize: 16, color: "#666" },
});
