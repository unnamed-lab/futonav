import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { PoiCategory } from "@futonav/shared";
import type { Poi, PoiCategoryType } from "@futonav/shared";
import { formatDistance } from "@futonav/core";
import { haversineMeters } from "@futonav/core";
import { useLocationStore } from "../stores/useLocationStore";

interface ResultsSheetProps {
  results: Poi[];
  onSelectPoi: (poi: Poi) => void;
}

const CATEGORY_COLORS: Record<PoiCategoryType, string> = {
  Department: "#4A90D9",
  Hostel: "#50C878",
  Admin: "#E67E22",
  Cafeteria: "#F39C12",
  Gate: "#95A5A6",
  Sports: "#27AE60",
  Medical: "#E74C3C",
  Library: "#9B59B6",
  Other: "#7F8C8D",
};

export function ResultsSheet({ results, onSelectPoi }: ResultsSheetProps) {
  const currentPosition = useLocationStore((s) => s.currentPosition);

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const dist = currentPosition
            ? haversineMeters(
                { latitude: currentPosition.latitude, longitude: currentPosition.longitude },
                { latitude: item.latitude, longitude: item.longitude },
              )
            : 0;

          return (
            <TouchableOpacity style={styles.row} onPress={() => onSelectPoi(item)}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: CATEGORY_COLORS[item.category as PoiCategoryType] ?? "#999" },
                ]}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.category}>{item.category}</Text>
              </View>
              <Text style={styles.distance}>{formatDistance(dist)}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 110,
    left: 16,
    right: 16,
    bottom: 100,
    zIndex: 9,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600" },
  category: { fontSize: 13, color: "#666", marginTop: 2 },
  distance: { fontSize: 14, color: "#333", marginLeft: 8 },
});
