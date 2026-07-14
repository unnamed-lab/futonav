import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Poi, PoiCategoryType } from "@futonav/shared";
import { formatDistance, walkingEtaMinutes, haversineMeters } from "@futonav/core";
import { useLocationStore } from "../stores/useLocationStore";
import { Ionicons } from "@expo/vector-icons";

interface PoiCardProps {
  poi: Poi;
  onEnd: () => void;
}

const CATEGORY_THEMES: Record<PoiCategoryType, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Department: { color: "#0284C7", icon: "business-outline" },
  Hostel: { color: "#0D9488", icon: "bed-outline" },
  Admin: { color: "#4F46E5", icon: "ribbon-outline" },
  Cafeteria: { color: "#D97706", icon: "cafe-outline" },
  Gate: { color: "#475569", icon: "enter-outline" },
  Sports: { color: "#16A34A", icon: "football-outline" },
  Medical: { color: "#DC2626", icon: "medical-outline" },
  Library: { color: "#7C3AED", icon: "book-outline" },
  Other: { color: "#64748B", icon: "map-outline" },
};

export function PoiCard({ poi, onEnd }: PoiCardProps) {
  const currentPosition = useLocationStore((s) => s.currentPosition);

  const dist = currentPosition
    ? haversineMeters(
        { latitude: currentPosition.latitude, longitude: currentPosition.longitude },
        { latitude: poi.latitude, longitude: poi.longitude },
      )
    : 0;

  const eta = walkingEtaMinutes(dist);
  const theme = CATEGORY_THEMES[poi.category as PoiCategoryType] || CATEGORY_THEMES.Other;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: theme.color + "10" }]}>
          <Ionicons name={theme.icon} size={14} color={theme.color} style={styles.badgeIcon} />
          <Text style={[styles.badgeText, { color: theme.color }]}>{poi.category}</Text>
        </View>
      </View>

      <Text style={styles.name}>{poi.name}</Text>
      {!!poi.description && <Text style={styles.description}>{poi.description}</Text>}

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Ionicons name="map-outline" size={18} color="#64748B" />
          <Text style={styles.statValue}>{formatDistance(dist)}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <Ionicons name="walk-outline" size={18} color="#0D9488" />
          <Text style={[styles.statValue, { color: "#0D9488" }]}>{eta} min</Text>
          <Text style={styles.statLabel}>Walking ETA</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={onEnd} activeOpacity={0.8}>
        <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
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
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  header: {
    flexDirection: "row",
    marginBottom: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeIcon: { marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  name: { fontSize: 20, fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  description: { fontSize: 14, color: "#475569", marginBottom: 20, lineHeight: 20 },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#E2E8F0",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  button: {
    backgroundColor: "#F43F5E",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F43F5E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: { marginRight: 8 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
