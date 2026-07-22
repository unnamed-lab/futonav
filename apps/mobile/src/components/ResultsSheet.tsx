import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import type { Poi, PoiCategoryType } from "@futonav/shared";
import { formatDistance, haversineMeters } from "@futonav/core";
import { useLocationStore } from "../stores/useLocationStore";
import { PoiImage } from "./PoiImage";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS, CATEGORY_THEMES } from "../theme/theme";

interface ResultsSheetProps {
  results: Poi[];
  onSelectPoi: (poi: Poi) => void;
  query?: string;
  onClearQuery?: () => void;
  onClose?: () => void;
}

export function ResultsSheet({ results, onSelectPoi, query, onClearQuery, onClose }: ResultsSheetProps) {
  const currentPosition = useLocationStore((s) => s.currentPosition);

  if (results.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        {onClose ? (
          <TouchableOpacity style={styles.closeSheetBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.emptyIconBadge}>
          <Ionicons name="search-outline" size={32} color={COLORS.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>No Locations Found</Text>
        <Text style={styles.emptySubtitle}>
          {query ? `No campus buildings or POIs match "${query}"` : "No locations found in this category."}
        </Text>
        {onClearQuery ? (
          <TouchableOpacity style={styles.clearBtn} onPress={onClearQuery} activeOpacity={0.8}>
            <Text style={styles.clearBtnText}>Reset Filter</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Search Results ({results.length})</Text>
        {onClose ? (
          <TouchableOpacity style={styles.closeSheetBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
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
              <View style={styles.thumb}>
                <PoiImage poi={item} width={44} height={44} borderRadius={12} iconScale={0.42} />
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  closeSheetBtn: {
    padding: 2,
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
  thumb: {
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
    marginLeft: 72,
    marginRight: 16,
  },
  emptyContainer: {
    bottom: "auto",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  emptyIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textMain,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  clearBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  clearBtnText: {
    fontFamily: FONTS.semibold,
    fontSize: 12,
    color: COLORS.white,
  },
});

