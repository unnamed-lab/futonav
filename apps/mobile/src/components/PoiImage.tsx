import { useState } from "react";
import { View, Image, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Poi, PoiCategoryType } from "@futonav/shared";
import { COLORS, CATEGORY_THEMES } from "../theme/theme";

interface PoiImageProps {
  poi: Poi;
  height?: number;
  width?: number;
  borderRadius?: number;
  /** Shrinks the placeholder icon; useful for small thumbnails. */
  iconScale?: number;
}

/**
 * Renders an admin-uploaded building image when available, with graceful
 * fallbacks: a loading spinner while it downloads, and a category-themed
 * placeholder when there is no image or the download fails (e.g. offline, or a
 * building with no photo yet). Uses React Native's Image so nothing new needs
 * installing; native platforms cache the bytes for repeat views.
 */
export function PoiImage({
  poi,
  height = 170,
  width,
  borderRadius = 16,
  iconScale = 0.26,
}: PoiImageProps) {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const theme = CATEGORY_THEMES[poi.category as PoiCategoryType] || CATEGORY_THEMES.Other;
  const hasImage = !!poi.imageUrl && !failed;

  return (
    <View
      style={[
        styles.container,
        { height, borderRadius, backgroundColor: theme.color + "12" },
        width !== undefined ? { width } : null,
      ]}
    >
      {hasImage ? (
        <>
          <Image
            source={{ uri: poi.imageUrl as string }}
            style={[styles.image, { borderRadius }]}
            resizeMode="cover"
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setFailed(true);
              setLoading(false);
            }}
          />
          {loading ? (
            <View style={styles.overlay}>
              <ActivityIndicator size="small" color={theme.color} />
            </View>
          ) : null}
        </>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name={theme.icon as never} size={Math.round(height * iconScale)} color={theme.color} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },
});
