import { StyleSheet, View, Text } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { FUTO_DEFAULT_REGION } from "@futonav/shared";
import type { Poi } from "@futonav/shared";
import { useNavStore } from "../stores/useNavStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { COLORS, FONTS, SHADOWS, MAP_STYLE_JSON, CATEGORY_THEMES } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";

interface MapCanvasProps {
  pois: Poi[];
  onPoiPress: (poi: Poi) => void;
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

export function MapCanvas({ pois, onPoiPress }: MapCanvasProps) {
  const { route, mode, selectedPoi } = useNavStore();
  const mapStyle = useSettingsStore((s) => s.mapStyle);

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_GOOGLE}
      initialRegion={FUTO_DEFAULT_REGION}
      showsUserLocation
      showsMyLocationButton
      mapType={mapStyle}
      customMapStyle={mapStyle === "standard" ? MAP_STYLE_JSON : undefined}
    >
      {pois.map((poi) => {
        const theme = CATEGORY_THEMES[poi.category] || CATEGORY_THEMES.Other;
        const isSelected = mode === "navigating" && selectedPoi?.id === poi.id;
        const label = getShortName(poi);

        return (
          <Marker
            key={poi.id}
            coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
            onPress={() => onPoiPress(poi)}
            tracksViewChanges={false}
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
              <View style={[styles.markerLabel, isSelected && styles.markerLabelActive]}>
                <Text style={[styles.markerLabelText, isSelected && styles.markerLabelTextActive]}>
                  {label}
                </Text>
              </View>
            </View>
          </Marker>
        );
      })}

      {route && mode === "navigating" && (
        <Polyline
          coordinates={route.polyline}
          strokeColor={COLORS.accent}
          strokeWidth={5}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
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
  markerLabel: {
    marginTop: 3,
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
});

