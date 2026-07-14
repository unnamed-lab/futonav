import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import type { Poi, PoiCategoryType } from "@futonav/shared";
import { formatDistance, haversineMeters } from "@futonav/core";
import { useLocationStore } from "../stores/useLocationStore";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS, CATEGORY_THEMES } from "../theme/theme";

interface ResultsSheetProps {
  results: Poi[];
  onSelectPoi: (poi: Poi) => void;
}

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
            <TouchableOpacity style={styles.row} onPress={() => onSelectPoi(item)} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: theme.color + "12" }]}>
                <Ionicons name={theme.icon as any} size={16} color={theme.color} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <View style={styles.badgeContainer}>
                  <View style={[styles.badge, { backgroundColor: theme.color + "08" }]}>
                    <Text style={[styles.badgeText, { color: theme.color }]}>{item.category}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.rightContainer}>
                <Ionicons name="walk" size={13} color={COLORS.textLight} />
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
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.textMuted,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: { flex: 1 },
  name: {
    fontFamily: FONTS.semibold,
    fontSize: 14,
    color: COLORS.textMain,
  },
  badgeContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: FONTS.semibold,
    fontSize: 10,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distance: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: 64,
    marginRight: 16,
  },
});

