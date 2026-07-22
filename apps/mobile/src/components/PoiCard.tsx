import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Poi, PoiCategoryType } from "@futonav/shared";
import { formatDistance, calculateEtaMinutes, haversineMeters } from "@futonav/core";
import { useLocationStore } from "../stores/useLocationStore";
import { useNavStore } from "../stores/useNavStore";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS, CATEGORY_THEMES } from "../theme/theme";

import { useFavoritesStore } from "../stores/useFavoritesStore";

interface PoiCardProps {
  poi: Poi;
  onEnd: () => void;
}

export function PoiCard({ poi, onEnd }: PoiCardProps) {
  const currentPosition = useLocationStore((s) => s.currentPosition);
  const { transportMode, setTransportMode, route } = useNavStore();
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFav = useFavoritesStore((s) => s.favoriteIds.includes(poi.id));

  const straightLineDist = currentPosition
    ? haversineMeters(
        { latitude: currentPosition.latitude, longitude: currentPosition.longitude },
        { latitude: poi.latitude, longitude: poi.longitude },
      )
    : 0;

  const displayDist = route ? route.distanceMeters : straightLineDist;
  const displayEta = route ? route.etaMinutes : calculateEtaMinutes(straightLineDist, transportMode);

  const theme = CATEGORY_THEMES[poi.category as PoiCategoryType] || CATEGORY_THEMES.Other;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: theme.color + "12" }]}>
          <Ionicons name={theme.icon as any} size={13} color={theme.color} style={styles.badgeIcon} />
          <Text style={[styles.badgeText, { color: theme.color }]}>{poi.category}</Text>
        </View>

        <TouchableOpacity
          onPress={() => toggleFavorite(poi.id)}
          style={styles.favoriteButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFav ? "star" : "star-outline"}
            size={20}
            color={isFav ? "#F59E0B" : COLORS.textLight}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.name} numberOfLines={1}>{poi.name}</Text>
      {poi.description ? (
        <Text style={styles.description} numberOfLines={2}>{poi.description}</Text>
      ) : null}

      {/* Transit Vehicle Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, transportMode === "walking" && styles.modeButtonActive]}
          onPress={() => setTransportMode("walking")}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="walk" 
            size={15} 
            color={transportMode === "walking" ? COLORS.white : COLORS.textMuted} 
          />
          <Text style={[styles.modeButtonText, transportMode === "walking" && styles.modeButtonTextActive]}>
            Walk
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, transportMode === "bike" && styles.modeButtonActive]}
          onPress={() => setTransportMode("bike")}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="bicycle" 
            size={15} 
            color={transportMode === "bike" ? COLORS.white : COLORS.textMuted} 
          />
          <Text style={[styles.modeButtonText, transportMode === "bike" && styles.modeButtonTextActive]}>
            Bike
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, transportMode === "car" && styles.modeButtonActive]}
          onPress={() => setTransportMode("car")}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="car" 
            size={15} 
            color={transportMode === "car" ? COLORS.white : COLORS.textMuted} 
          />
          <Text style={[styles.modeButtonText, transportMode === "car" && styles.modeButtonTextActive]}>
            Drive
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Ionicons name="location" size={16} color={COLORS.textLight} />
          <Text style={styles.statValue}>{formatDistance(displayDist)}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <Ionicons 
            name={transportMode === "walking" ? "walk" : transportMode === "bike" ? "bicycle" : "car"} 
            size={16} 
            color={COLORS.accent} 
          />
          <Text style={[styles.statValue, { color: COLORS.accent }]}>{displayEta} min</Text>
          <Text style={styles.statLabel}>
            {transportMode === "walking" ? "Walking ETA" : transportMode === "bike" ? "Biking ETA" : "Driving ETA"}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={onEnd} activeOpacity={0.85}>
        <Ionicons name="close-circle" size={18} color={COLORS.white} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>End Navigation</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  favoriteButton: {
    padding: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeIcon: { marginRight: 6 },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    textTransform: "uppercase",
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 4,
  },
  description: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  modeSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  modeButtonText: {
    fontFamily: FONTS.semibold,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  modeButtonTextActive: {
    color: COLORS.white,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.textMain,
    marginTop: 4,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
    textTransform: "uppercase",
  },
  button: {
    backgroundColor: COLORS.error,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  buttonIcon: { marginRight: 6 },
  buttonText: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
    fontSize: 15,
  },
});

