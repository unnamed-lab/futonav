import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, PanResponder, Animated } from "react-native";
import { useRouter } from "expo-router";
import { searchPois, haversineMeters } from "@futonav/core";
import { MapCanvas } from "../src/components/MapCanvas";
import { SearchBar } from "../src/components/SearchBar";
import { ResultsSheet } from "../src/components/ResultsSheet";
import { PoiCard } from "../src/components/PoiCard";
import { EtaBar } from "../src/components/EtaBar";
import { useNavStore } from "../src/stores/useNavStore";
import { useLocationStore } from "../src/stores/useLocationStore";
import { useSettingsStore } from "../src/stores/useSettingsStore";
import { requestPermission, startWatching } from "../src/services/locationService";
import { seedBaseline, getCachedPois, syncPois } from "../src/services/syncService";
import { resolveRoute } from "../src/services/routeService";
import type { Poi } from "@futonav/shared";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../src/theme/theme";

export default function MapScreen() {
  const router = useRouter();
  const onboardingSeen = useSettingsStore((s) => s.onboardingSeen);
  const { mode, selectedPoi, selectPoi, endNavigation, transportMode, setRoute } = useNavStore();
  const currentPosition = useLocationStore((s) => s.currentPosition);
  const mapRef = useRef<any>(null);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [pois, setPois] = useState<Poi[]>([]);

  const filteredPois = useMemo(() => {
    let result = searchPois(query, pois);
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    return result;
  }, [query, selectedCategory, pois]);

  // Tracks the context of the last route we computed so we can skip redundant
  // recomputes on every GPS tick (location updates ~every 2s). Without this,
  // navigation fires a routing request every couple of seconds.
  const lastRouteRef = useRef<{ poiId: string; mode: string; lat: number; lng: number } | null>(null);
  // Only re-route once the user has moved at least this far from the last route
  // origin (target/mode changes always re-route immediately).
  const REROUTE_THRESHOLD_M = 30;

  useEffect(() => {
    let active = true;

    async function computeRoute() {
      if (mode === "navigating" && selectedPoi && currentPosition) {
        const last = lastRouteRef.current;
        const sameTarget =
          last && last.poiId === selectedPoi.id && last.mode === transportMode;
        if (sameTarget) {
          const moved = haversineMeters(
            { latitude: last.lat, longitude: last.lng },
            { latitude: currentPosition.latitude, longitude: currentPosition.longitude },
          );
          if (moved < REROUTE_THRESHOLD_M) return; // keep existing route
        }

        const start = currentPosition;
        const end = {
          latitude: selectedPoi.latitude,
          longitude: selectedPoi.longitude,
        };

        // Record this attempt up front so failures (e.g. offline) also throttle
        // and don't retry on every tick.
        lastRouteRef.current = {
          poiId: selectedPoi.id,
          mode: transportMode,
          lat: currentPosition.latitude,
          lng: currentPosition.longitude,
        };

        // resolveRoute handles cache-first lookup, the Google Routes API,
        // offline cache replay, and the offline OSM graph fallback. It returns
        // null only when no trustworthy road-following route is available, in
        // which case we draw no polyline (EtaBar still shows an estimate).
        const resolved = await resolveRoute(start, end, transportMode);

        if (!active) return;

        setRoute(
          resolved
            ? {
                polyline: resolved.polyline,
                distanceMeters: resolved.distanceMeters,
                etaMinutes: resolved.etaMinutes,
                source: resolved.source,
              }
            : null,
        );
      } else {
        lastRouteRef.current = null;
        setRoute(null);
      }
    }

    computeRoute();

    return () => {
      active = false;
    };
  }, [mode, selectedPoi, currentPosition, transportMode, setRoute]);

  useEffect(() => {
    if (!onboardingSeen) {
      router.replace("/onboarding");
    }
  }, [onboardingSeen, router]);

  useEffect(() => {
    seedBaseline()
      .then(() => getCachedPois())
      .then((cached) => {
        setPois(cached);
        // Perform background delta sync from Supabase DB
        return syncPois();
      })
      .then((res) => {
        if (res && !res.offline && res.synced > 0) {
          getCachedPois().then(setPois);
        }
      })
      .catch(() => {
        // Silently preserve offline cached POIs
      });

    requestPermission().then((granted) => {
      if (granted) startWatching();
    });
  }, []);

  const handlePoiSelect = useCallback(
    (poi: Poi) => {
      selectPoi(poi);
      setQuery("");
      setSelectedCategory(null);
    },
    [selectPoi],
  );

  const handleEndNavigation = useCallback(() => {
    endNavigation();
  }, [endNavigation]);

  const handleRecenter = useCallback(() => {
    if (currentPosition && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentPosition.latitude,
          longitude: currentPosition.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        800,
      );
    }
  }, [currentPosition]);

  const handleResetFilters = useCallback(() => {
    setQuery("");
    setSelectedCategory(null);
  }, []);

  const isSearching = query.length > 0 || selectedCategory !== null;

  return (
    <View style={styles.container}>
      <MapCanvas pois={pois as Poi[]} onPoiPress={handlePoiSelect} mapRef={mapRef} />

      {mode === "browse" ? (
        <>
          <SearchBar
            onQueryChange={setQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          {isSearching ? (
            <ResultsSheet
              results={filteredPois}
              onSelectPoi={handlePoiSelect}
              query={query}
              onClearQuery={handleResetFilters}
            />
          ) : null}
        </>
      ) : null}

      {mode === "navigating" && selectedPoi ? (
        <>
          <EtaBar />
          <PoiCard poi={selectedPoi} onEnd={handleEndNavigation} />
        </>
      ) : null}

      {/* Floating Action Button Controls Stack */}
      <View style={styles.fabStack}>
        {currentPosition ? (
          <TouchableOpacity
            style={styles.fabButton}
            onPress={handleRecenter}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => router.push("/settings")}
          activeOpacity={0.8}
        >
          <Ionicons name="settings" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fabStack: {
    position: "absolute",
    bottom: 40,
    right: 16,
    gap: 12,
    zIndex: 11,
  },
  fabButton: {
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
