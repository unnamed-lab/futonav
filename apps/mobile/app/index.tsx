import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, PanResponder, Animated } from "react-native";
import { useRouter } from "expo-router";
import { searchPois, findRoute, calculateEtaMinutes } from "@futonav/core";
import { MapCanvas } from "../src/components/MapCanvas";
import { SearchBar } from "../src/components/SearchBar";
import { ResultsSheet } from "../src/components/ResultsSheet";
import { PoiCard } from "../src/components/PoiCard";
import { EtaBar } from "../src/components/EtaBar";
import { useNavStore } from "../src/stores/useNavStore";
import { useLocationStore } from "../src/stores/useLocationStore";
import { useSettingsStore } from "../src/stores/useSettingsStore";
import { requestPermission, startWatching } from "../src/services/locationService";
import { seedBaseline, getCachedPois } from "../src/services/syncService";
import type { Poi } from "@futonav/shared";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../src/theme/theme";

export default function MapScreen() {
  const router = useRouter();
  const onboardingSeen = useSettingsStore((s) => s.onboardingSeen);
  const { mode, selectedPoi, selectPoi, endNavigation, transportMode, setRoute } = useNavStore();
  const currentPosition = useLocationStore((s) => s.currentPosition);

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only trigger movement if dragged beyond small threshold
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value || 0,
          y: (pan.y as any)._value || 0,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        // If gesture was a minor nudge or tap, treat as click and open Settings
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          router.push("/settings");
        }
      },
    })
  ).current;

  const [query, setQuery] = useState("");
  const [pois, setPois] = useState<Poi[]>([]);
  const filteredPois = useMemo(() => searchPois(query, pois), [query, pois]);

  useEffect(() => {
    if (mode === "navigating" && selectedPoi && currentPosition) {
      const routeResult = findRoute(currentPosition, {
        latitude: selectedPoi.latitude,
        longitude: selectedPoi.longitude,
      });

      const etaMinutes = calculateEtaMinutes(routeResult.distanceMeters, transportMode);

      setRoute({
        polyline: routeResult.polyline,
        distanceMeters: routeResult.distanceMeters,
        etaMinutes,
      });
    } else {
      setRoute(null);
    }
  }, [mode, selectedPoi, currentPosition, transportMode, setRoute]);

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

      {mode === "browse" ? (
        <>
          <SearchBar onQueryChange={setQuery} />
          {query.length > 0 && filteredPois.length > 0 ? (
            <ResultsSheet results={filteredPois} onSelectPoi={handlePoiSelect} />
          ) : null}
        </>
      ) : null}

      {mode === "navigating" && selectedPoi ? (
        <>
          <EtaBar />
          <PoiCard poi={selectedPoi} onEnd={handleEndNavigation} />
        </>
      ) : null}

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.settingsButton,
          {
            transform: pan.getTranslateTransform(),
          },
        ]}
      >
        <Ionicons name="settings" size={20} color={COLORS.primary} />
      </Animated.View>
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
