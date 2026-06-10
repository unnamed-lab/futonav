import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSettingsStore } from "../src/stores/useSettingsStore";
import { requestPermission } from "../src/services/locationService";
import { Ionicons } from "@expo/vector-icons";

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
      <View style={styles.logoContainer}>
        <View style={styles.logoBadge}>
          <Ionicons name="navigate" size={36} color="#0D9488" />
        </View>
        <Text style={styles.title}>FutoNav</Text>
        <Text style={styles.subtitle}>Smart offline campus navigation for FUTO</Text>
      </View>

      <View style={styles.featuresContainer}>
        <View style={styles.featureRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="map-outline" size={20} color="#0D9488" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Offline Campus Map</Text>
            <Text style={styles.featureDesc}>Full map and navigation works without any network connection.</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="locate-outline" size={20} color="#0D9488" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Real-time Location</Text>
            <Text style={styles.featureDesc}>Track your position precisely across 54+ surveyed points on campus.</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="search-outline" size={20} color="#0D9488" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Futo Search</Text>
            <Text style={styles.featureDesc}>Search buildings using abbreviation codes (e.g. SEET, SST, SMAT).</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="walk-outline" size={20} color="#0D9488" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Walking Distance & ETA</Text>
            <Text style={styles.featureDesc}>Get exact distances and estimated time of arrivals on foot.</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGetStarted} activeOpacity={0.85}>
        <Text style={styles.buttonText}>Get Started</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 50,
    backgroundColor: "#FFFFFF",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  title: { fontSize: 32, fontWeight: "800", color: "#0F172A" },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#64748B",
    marginTop: 8,
    lineHeight: 20,
    fontWeight: "500",
  },
  featuresContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 24,
    marginVertical: 40,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  featureDesc: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 18,
  },
  button: {
    backgroundColor: "#0F172A",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  buttonIcon: { marginLeft: 8 },
});
