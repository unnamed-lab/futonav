import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { PoiCategory } from "@futonav/shared";
import type { Poi, PoiCategoryType } from "@futonav/shared";
import { formatDistance } from "@futonav/core";
import { haversineMeters } from "@futonav/core";
import { useLocationStore } from "../stores/useLocationStore";
import { Ionicons } from "@expo/vector-icons";

interface ResultsSheetProps {
  results: Poi[];
  onSelectPoi: (poi: Poi) => void;
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

export function ResultsSheet({ results, onSelectPoi }: ResultsSheetProps) {
  const currentPosition = useLocationStore((s) => s.currentPosition);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Search Results ({results.length})</Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const dist = currentPosition
            ? haversineMeters(
                { latitude: currentPosition.latitude, longitude: currentPosition.longitude },
                { latitude: item.latitude, longitude: item.longitude },
              )
            : 0;

          const theme = CATEGORY_THEMES[item.category as PoiCategoryType] || CATEGORY_THEMES.Other;

          return (
            <TouchableOpacity style={styles.row} onPress={() => onSelectPoi(item)}>
              <View style={[styles.iconContainer, { backgroundColor: theme.color + "15" }]}>
                <Ionicons name={theme.icon} size={20} color={theme.color} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.badgeContainer}>
                  <View style={[styles.badge, { backgroundColor: theme.color + "10" }]}>
                    <Text style={[styles.badgeText, { color: theme.color }]}>{item.category}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.rightContainer}>
                <Ionicons name="walk-outline" size={14} color="#64748B" />
                <Text style={styles.distance}>{formatDistance(dist)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 130,
    left: 16,
    right: 16,
    bottom: 110,
    zIndex: 9,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    paddingHorizontal: 20,
    paddingBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  badgeContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distance: { fontSize: 13, color: "#64748B", fontWeight: "600" },
  separator: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 70,
    marginRight: 16,
  },
});
