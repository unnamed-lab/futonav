import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSettingsStore } from "../src/stores/useSettingsStore";
import { requestPermission } from "../src/services/locationService";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS } from "../src/theme/theme";

const { height } = Dimensions.get("window");
const isSmallScreen = height < 700;

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
      <View style={styles.heroSection}>
        <View style={styles.logoOuterRing}>
          <View style={styles.logoInnerRing}>
            <Ionicons name="navigate" size={32} color={COLORS.accent} />
          </View>
        </View>
        <Text style={styles.title}>FutoNav</Text>
        <Text style={styles.subtitle}>
          Premium offline campus navigation for FUTO students & visitors.
        </Text>
      </View>

      <View style={styles.featuresSection}>
        <View style={styles.featureCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="map" size={18} color={COLORS.accent} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Zero-Data Map</Text>
            <Text style={styles.featureDesc}>
              Navigate and search the entire campus completely offline. No network required.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="locate" size={18} color={COLORS.accent} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Accurate Coordinates</Text>
            <Text style={styles.featureDesc}>
              Track your real-time position across 54+ verified landmarks and schools.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="search" size={18} color={COLORS.accent} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Abbreviation Search</Text>
            <Text style={styles.featureDesc}>
              Instant search using common building acronyms (e.g. SEET, SST, Senate).
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={styles.buttonIcon} />
        </TouchableOpacity>
        <Text style={styles.footerText}>Designed for Federal University of Technology, Owerri</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: isSmallScreen ? 50 : 80,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    marginTop: isSmallScreen ? 10 : 20,
  },
  logoOuterRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(13, 148, 136, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoInnerRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(13, 148, 136, 0.15)",
    ...SHADOWS.sm,
  },
  title: {
    fontFamily: FONTS.extrabold,
    fontSize: 32,
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  featuresSection: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
    marginVertical: isSmallScreen ? 20 : 35,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: "flex-start",
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.accentSurface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.primary,
  },
  featureDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: COLORS.textMuted,
    marginTop: 3,
    lineHeight: 17,
  },
  actionSection: {
    gap: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  buttonText: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 6,
  },
  footerText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

