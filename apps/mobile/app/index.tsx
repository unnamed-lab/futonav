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
import { seedBaseline, getCachedPois } from "../src/services/syncService";
import type { Poi } from "@futonav/shared";

export default function MapScreen() {
  const router = useRouter();
  const onboardingSeen = useSettingsStore((s) => s.onboardingSeen);
  const { mode, selectedPoi, selectPoi, endNavigation } = useNavStore();
  const currentPosition = useLocationStore((s) => s.currentPosition);

  const [query, setQuery] = useState("");
  const [pois, setPois] = useState<Poi[]>([]);
  const [filteredPois, setFilteredPois] = useState<Poi[]>([]);

  useEffect(() => {
    if (!onboardingSeen) {
      router.replace("/onboarding");
    }
  }, [onboardingSeen]);

  useEffect(() => {
    seedBaseline().then(() =>
      getCachedPois().then(setPois),
    );
    requestPermission().then((granted) => {
      if (granted) startWatching();
    });
  }, []);

  useEffect(() => {
    const results = searchPois(query, pois);
    setFilteredPois(results);
  }, [query, pois]);

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
      <MapCanvas pois={pois as Poi[]} onPoiPress={handlePoiSelect} />

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
