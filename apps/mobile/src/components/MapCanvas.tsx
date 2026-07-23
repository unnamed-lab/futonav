import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { FUTO_DEFAULT_REGION } from "@futonav/shared";
import type { Poi } from "@futonav/shared";
import { useNavStore } from "../stores/useNavStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { COLORS, FONTS, SHADOWS, MAP_STYLE_JSON, CATEGORY_THEMES } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";

import { getRemainingRoute } from "@futonav/core";
import { useLocationStore } from "../stores/useLocationStore";

interface MapCanvasProps {
  pois: Poi[];
  onPoiPress: (poi: Poi) => void;
  mapRef?: React.RefObject<MapView | null>;
}

const getShortName = (poi: Poi) => {
  const shortTag = poi.tags.find(
    (tag) => tag === tag.toUpperCase() && tag.length >= 2 && tag.length <= 5
  );
  if (shortTag) return shortTag;

  if (poi.name.includes("Library")) return "Library";
  if (poi.name.includes("Senate")) return "Senate";
  if (poi.name.includes("Medical")) return "Medical";
  if (poi.name.includes("Student Affairs")) return "Student";

  return poi.name.split(" ")[0];
};

export function MapCanvas({ pois, onPoiPress, mapRef: externalMapRef }: MapCanvasProps) {
  const { route, mode, selectedPoi, transportMode } = useNavStore();
  const mapStyle = useSettingsStore((s) => s.mapStyle);
  const currentPosition = useLocationStore((s) => s.currentPosition);
  const heading = useLocationStore((s) => s.heading);
  const internalMapRef = useRef<MapView>(null);
  const mapRef = externalMapRef || internalMapRef;
  
  // Turn off continuous native marker redrawing to prevent map type switching lag
  const [tracksView, setTracksView] = useState(true);

  useEffect(() => {
    // Freeze marker view bitmap after initial layout pass (500ms)
    const timer = setTimeout(() => setTracksView(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-framing map camera when a POI is selected
  useEffect(() => {
    if (selectedPoi && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: selectedPoi.latitude,
        longitude: selectedPoi.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 800);
    }
  }, [selectedPoi, mapRef]);

  // Auto-bounding map camera to fit navigation polyline on start
  useEffect(() => {
    if (route && route.polyline.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(route.polyline, {
        edgePadding: { top: 140, right: 50, bottom: 220, left: 50 },
        animated: true,
      });
    }
  }, [route, mapRef]);

  // Dynamic camera follow & heading orientation during active navigation as user moves in transit
  useEffect(() => {
    if (mode === "navigating" && currentPosition && mapRef.current) {
      try {
        mapRef.current.animateCamera(
          {
            center: {
              latitude: currentPosition.latitude,
              longitude: currentPosition.longitude,
            },
            zoom: 18,
            heading: heading ?? 0,
            pitch: 25,
          },
          { duration: 500 },
        );
      } catch {
        mapRef.current.animateToRegion(
          {
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          },
          500,
        );
      }
    }
  }, [mode, currentPosition, heading, mapRef]);

  const navProgress =
    mode === "navigating" && currentPosition && route?.polyline && route.polyline.length >= 2
      ? getRemainingRoute(currentPosition, route.polyline, transportMode)
      : null;

  const activePolyline = navProgress ? navProgress.remainingPolyline : (route?.polyline ?? []);
  const traveledPolyline = navProgress ? navProgress.traveledPolyline : [];

  const activeMapType = mapStyle === "satellite" ? "hybrid" : "standard";

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_GOOGLE}
      initialRegion={FUTO_DEFAULT_REGION}
      showsUserLocation
      showsMyLocationButton={false}
      userLocationUpdateInterval={1000}
      userLocationFastestInterval={1000}
      mapType={activeMapType}
      customMapStyle={mapStyle === "standard" ? MAP_STYLE_JSON : undefined}
    >
      {currentPosition ? (
        <Marker
          coordinate={currentPosition}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          rotation={heading ?? 0}
          zIndex={999}
          tracksViewChanges={false}
        >
          <View style={styles.userLocationMarker}>
            <View style={styles.userLocationPulse} />
            <View style={styles.userLocationDot} />
          </View>
        </Marker>
      ) : null}
      {pois.map((poi) => {
        const theme = CATEGORY_THEMES[poi.category] || CATEGORY_THEMES.Other;
        const isSelected = mode === "navigating" && selectedPoi?.id === poi.id;
        const label = getShortName(poi);

        return (
          <Marker
            key={poi.id}
            coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
            onPress={() => onPoiPress(poi)}
            tracksViewChanges={tracksView || isSelected}
            anchor={{ x: 0.5, y: 0.67 }}
          >
            <View style={styles.markerContainer}>
              <View
                style={[
                  styles.markerBadge,
                  { borderColor: theme.color },
                  isSelected && { backgroundColor: theme.color, borderColor: theme.color },
                ]}
              >
                <Ionicons
                  name={theme.icon as any}
                  size={13}
                  color={isSelected ? COLORS.white : theme.color}
                />
              </View>
              
              {/* Custom Downward Pin Pointer */}
              <View
                style={[
                  styles.markerPointer,
                  { borderTopColor: theme.color },
                ]}
              />

              <View style={[styles.markerLabel, isSelected && styles.markerLabelActive]}>
                <Text 
                  style={[styles.markerLabelText, isSelected && styles.markerLabelTextActive]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </View>
            </View>
          </Marker>
        );
      })}

      {traveledPolyline.length >= 2 && mode === "navigating" ? (
        <Polyline
          coordinates={traveledPolyline}
          strokeColor="rgba(148, 163, 184, 0.5)"
          strokeWidth={3.5}
          lineDashPattern={[6, 4]}
        />
      ) : null}

      {activePolyline.length >= 2 && mode === "navigating" ? (
        <Polyline
          coordinates={activePolyline}
          strokeColor={COLORS.accent}
          strokeWidth={5}
        />
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    padding: 2,
  },
  markerBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  markerPointer: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 0,
    borderTopWidth: 5,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -1.5,
    marginBottom: 1.5,
  },
  markerLabel: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  markerLabelActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  markerLabelText: {
    fontFamily: FONTS.semibold,
    fontSize: 9,
    color: COLORS.textMain,
  },
  markerLabelTextActive: {
    color: COLORS.white,
  },
  userLocationMarker: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  userLocationPulse: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(14, 165, 233, 0.25)",
  },
  userLocationDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#0EA5E9",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    ...SHADOWS.md,
  },
});

