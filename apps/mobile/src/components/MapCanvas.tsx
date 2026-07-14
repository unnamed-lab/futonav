import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { FUTO_DEFAULT_REGION } from "@futonav/shared";
import type { Poi } from "@futonav/shared";
import { useNavStore } from "../stores/useNavStore";
import { useSettingsStore } from "../stores/useSettingsStore";

interface MapCanvasProps {
  pois: Poi[];
  onPoiPress: (poi: Poi) => void;
}

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
    >
      {pois.map((poi) => (
        <Marker
          key={poi.id}
          coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
          title={poi.name}
          description={poi.description ?? undefined}
          onPress={() => onPoiPress(poi)}
          pinColor={mode === "navigating" && selectedPoi?.id === poi.id ? "blue" : "red"}
        />
      ))}

      {route && mode === "navigating" && (
        <Polyline
          coordinates={route.polyline}
          strokeColor="#0D9488"
          strokeWidth={4}
        />
      )}
    </MapView>
  );
}
