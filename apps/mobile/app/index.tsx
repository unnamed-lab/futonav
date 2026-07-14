import { useEffect, useState, useMemo, useCallback } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { searchPois } from "@futonav/core";
import { MapCanvas } from "../src/components/MapCanvas";
import { SearchBar } from "../src/components/SearchBar";
import { ResultsSheet } from "../src/components/ResultsSheet";
import { PoiCard } from "../src/components/PoiCard";
import { EtaBar } from "../src/components/EtaBar";
import { useNavStore } from "../src/stores/useNavStore";
import { useSettingsStore } from "../src/stores/useSettingsStore";
import { requestPermission, startWatching } from "../src/services/locationService";
import { seedBaseline, getCachedPois } from "../src/services/syncService";
import type { Poi } from "@futonav/shared";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../src/theme/theme";

export default function MapScreen() {
  const router = useRouter();
  const onboardingSeen = useSettingsStore((s) => s.onboardingSeen);
  const { mode, selectedPoi, selectPoi, endNavigation } = useNavStore();

  const [query, setQuery] = useState("");
  const [pois, setPois] = useState<Poi[]>([]);
  const filteredPois = useMemo(() => searchPois(query, pois), [query, pois]);

  useEffect(() => {
    if (!onboardingSeen) {
      router.replace("/onboarding");
    }
  }, [onboardingSeen, router]);

  useEffect(() => {
    seedBaseline().then(() =>
      getCachedPois().then(setPois),
    );
    requestPermission().then((granted) => {
      if (granted) startWatching();
    });
  }, []);

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

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push("/settings")}
        activeOpacity={0.8}
      >
        <Ionicons name="settings" size={20} color={COLORS.primary} />
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
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
});
