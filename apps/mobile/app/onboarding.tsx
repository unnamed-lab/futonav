import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSettingsStore } from "../src/stores/useSettingsStore";
import { requestPermission } from "../src/services/locationService";

export default function OnboardingScreen() {
  const router = useRouter();
  const setOnboardingSeen = useSettingsStore((s) => s.setOnboardingSeen);

  const handleGetStarted = async () => {
    setOnboardingSeen(true);
    await requestPermission();
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FutoNav</Text>
      <Text style={styles.subtitle}>
        Navigate FUTO campus with offline maps and walking directions to every building.
      </Text>
      <Text style={styles.feature}>🗺️ Offline campus map</Text>
      <Text style={styles.feature}>📍 Real-time location tracking</Text>
      <Text style={styles.feature}>🔍 Search buildings by name or abbreviation</Text>
      <Text style={styles.feature}>🚶 Walking distance and ETA</Text>

      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 12 },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 32,
    lineHeight: 22,
  },
  feature: { fontSize: 15, marginBottom: 8, alignSelf: "flex-start" },
  button: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
