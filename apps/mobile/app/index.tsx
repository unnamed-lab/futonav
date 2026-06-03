import { useEffect, useState, useCallback } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { searchPois } from "@futonav/core";
import { MapCanvas } from "../src/components/MapCanvas";
import { SearchBar } from "../src/components/SearchBar";
import { ResultsSheet } from "../src/components/ResultsSheet";
import { PoiCard } from "../src/components/PoiCard";
import { EtaBar } from "../src/components/EtaBar";
import { useLocationStore } from "../src/stores/useLocationStore";
import { useNavStore } from "../src/stores/useNavStore";
import { useSettingsStore } from "../src/stores/useSettingsStore";
import { requestPermission, startWatching } from "../src/services/locationService";
import type { Poi } from "@futonav/shared";

const PLACEHOLDER_POIS: Poi[] = [
  { id: "1", name: "School of Engineering and Engineering Technology", category: "Department", latitude: 5.3915, longitude: 7.0025, description: "SEET administrative building", tags: ["SEET", "engineering"], imageUrl: null, updatedAt: "2024-01-01T00:00:00Z" },
  { id: "2", name: "School of Science and Technology", category: "Department", latitude: 5.3930, longitude: 7.0010, description: "SST main building", tags: ["SST", "science"], imageUrl: null, updatedAt: "2024-01-01T00:00:00Z" },
  { id: "3", name: "School of Agriculture and Agricultural Technology", category: "Department", latitude: 5.3945, longitude: 7.0035, description: "SAAT building", tags: ["SAAT", "agriculture"], imageUrl: null, updatedAt: "2024-01-01T00:00:00Z" },
  { id: "4", name: "School of Management Technology", category: "Department", latitude: 5.3905, longitude: 7.0005, description: "SMAT building", tags: ["SMAT", "management"], imageUrl: null, updatedAt: "2024-01-01T00:00:00Z" },
  { id: "5", name: "School of Health Technology", category: "Department", latitude: 5.3920, longitude: 7.0040, description: "SHT building", tags: ["SHT", "health"], imageUrl: null, updatedAt: "2024-01-01T00:00:00Z" },
  { id: "6", name: "School of Postgraduate Studies", category: "Admin", latitude: 5.3950, longitude: 7.0020, description: "SPGS building", tags: ["SPGS", "postgraduate"], imageUrl: null, updatedAt: "2024-01-01T00:00:00Z" },
  { id: "7", name: "University Library", category: "Library", latitude: 5.3935, longitude: 7.0015, description: "Main library", tags: ["library", "books"], imageUrl: null, updatedAt: "2024-01-01T00:00:00Z" },
  { id: "8", name: "Student Affairs Building", category: "Admin", latitude: 5.3910, longitude: 7.0030, description: "Dean of Students office", tags: ["student", "affairs"], imageUrl: null, updatedAt: "2024-01-01T00:00:00Z" },
  { id: "9", name: "Senate Building", category: "Admin", latitude: 5.3925, longitude: 7.0020, description: "University Senate and VC office", tags: ["school", "administration"], imageUrl: null, updatedAt: "2024-01-01T00:00:00Z" },
  { id: "10", name: "Medical Centre", category: "Medical", latitude: 5.3940, longitude: 7.0045, description: "Campus health services", tags: ["hospital", "clinic", "health"], imageUrl: null, updatedAt: "2024-01-01T00:00:00Z" },
];

export default function MapScreen() {
  const router = useRouter();
  const onboardingSeen = useSettingsStore((s) => s.onboardingSeen);
  const { mode, selectedPoi, selectPoi, endNavigation } = useNavStore();
  const currentPosition = useLocationStore((s) => s.currentPosition);

  const [query, setQuery] = useState("");
  const [filteredPois, setFilteredPois] = useState<Poi[]>(PLACEHOLDER_POIS);

  useEffect(() => {
    if (!onboardingSeen) {
      router.replace("/onboarding");
    }
  }, [onboardingSeen]);

  useEffect(() => {
    requestPermission().then((granted) => {
      if (granted) startWatching();
    });
  }, []);

  useEffect(() => {
    const results = searchPois(query, PLACEHOLDER_POIS as Poi[]);
    setFilteredPois(results);
  }, [query]);

  const handlePoiSelect = useCallback(
    (poi: Poi) => {
      selectPoi(poi);
      setQuery("");
    },
    [selectPoi],
  );

  const handleEndNavigation = useCallback(() => {
    endNavigation();
  }, [endNavigation]);

  return (
    <View style={styles.container}>
      <MapCanvas pois={PLACEHOLDER_POIS as Poi[]} onPoiPress={handlePoiSelect} />

      {mode === "browse" && (
        <>
          <SearchBar onQueryChange={setQuery} />
          {query.length > 0 && filteredPois.length > 0 && (
            <ResultsSheet results={filteredPois} onSelectPoi={handlePoiSelect} />
          )}
        </>
      )}

      {mode === "navigating" && selectedPoi && (
        <>
          <EtaBar />
          <PoiCard poi={selectedPoi} onEnd={handleEndNavigation} />
        </>
      )}

      <TouchableOpacity style={styles.settingsButton} onPress={() => router.push("/settings")}>
        <Text style={styles.settingsIcon}>⚙</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  settingsButton: {
    position: "absolute",
    bottom: 40,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 30,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  settingsIcon: { fontSize: 22 },
});
