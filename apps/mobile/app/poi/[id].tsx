import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavStore } from "../../src/stores/useNavStore";
import { PoiImage } from "../../src/components/PoiImage";
import { formatDistance, walkingEtaMinutes, haversineMeters } from "@futonav/core";
import { useLocationStore } from "../../src/stores/useLocationStore";
import { COLORS, FONTS, SHADOWS, CATEGORY_THEMES } from "../../src/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import type { PoiCategoryType } from "@futonav/shared";

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
  const theme = poi ? (CATEGORY_THEMES[poi.category as PoiCategoryType] || CATEGORY_THEMES.Other) : CATEGORY_THEMES.Other;

  const handleNavigate = () => {
    if (poi) {
      selectPoi(poi);
      router.back();
    }
  };

  if (!poi) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>POI not found</Text>
          <Text style={styles.errorSubtext}>ID: {id}</Text>
          <TouchableOpacity style={styles.outlineButton} onPress={() => router.back()}>
            <Text style={styles.outlineButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Indicator / Category Badge */}
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: theme.color + "12" }]}>
            <Ionicons name={theme.icon as any} size={14} color={theme.color} style={styles.badgeIcon} />
            <Text style={[styles.badgeText, { color: theme.color }]}>{poi.category}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Building image (admin-uploaded) with graceful fallback */}
        <PoiImage poi={poi} height={170} />

        {/* Title & Desc */}
        <View style={[styles.contentSection, styles.contentSpacing]}>
          <Text style={styles.name}>{poi.name}</Text>
          {!!poi.description ? (
            <Text style={styles.description}>{poi.description}</Text>
          ) : (
            <Text style={styles.descriptionMuted}>No description available for this campus location.</Text>
          )}
        </View>

        {/* Metrics Section */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="location" size={16} color={COLORS.textMuted} />
            </View>
            <Text style={styles.metricValue}>{formatDistance(dist)}</Text>
            <Text style={styles.metricLabel}>Distance</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: "rgba(13, 148, 136, 0.08)" }]}>
              <Ionicons name="walk" size={16} color={COLORS.accent} />
            </View>
            <Text style={[styles.metricValue, { color: COLORS.accent }]}>~{eta} min</Text>
            <Text style={styles.metricLabel}>Walking ETA</Text>
          </View>
        </View>

        {/* Buttons Section */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate} activeOpacity={0.9}>
            <Ionicons name="navigate" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
            <Text style={styles.navigateButtonText}>Start Navigation</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineButton} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.outlineButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  contentSection: {
    marginBottom: 28,
  },
  contentSpacing: {
    marginTop: 20,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.primary,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  description: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 12,
    lineHeight: 22,
  },
  descriptionMuted: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 12,
    fontStyle: "italic",
  },
  metricsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 36,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  metricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  metricValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textMain,
  },
  metricLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
    textTransform: "uppercase",
  },
  actionContainer: {
    gap: 12,
  },
  navigateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  navigateButtonText: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
    fontSize: 16,
  },
  outlineButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.textMuted,
  },
  errorText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.error,
    textAlign: "center",
    marginTop: 40,
  },
  errorSubtext: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
});

