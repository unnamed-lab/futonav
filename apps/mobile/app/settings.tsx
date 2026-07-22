import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSettingsStore } from "../src/stores/useSettingsStore";
import { syncPois, clearLocalCache, seedBaseline } from "../src/services/syncService";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS } from "../src/theme/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const { mapStyle, setMapStyle } = useSettingsStore();
  const [syncing, setSyncing] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncPois();
      if (result.offline) {
        Alert.alert("Offline Mode", "Could not connect to the server. Working with offline cached data.");
      } else {
        Alert.alert("Sync Successful", `Successfully updated database. Synced ${result.synced} locations.`);
      }
    } catch {
      Alert.alert("Error", "An unexpected error occurred during database synchronization.");
    } finally {
      setSyncing(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Confirm Reset",
      "Are you sure you want to reset the local database? This will clear all cache and reload original seed locations.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setClearing(true);
            try {
              await clearLocalCache();
              await seedBaseline();
              Alert.alert("Reset Complete", "The local database cache was successfully reset.");
            } catch {
              Alert.alert("Error", "Could not clear local database cache.");
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          {/* spacer to balance the back button */}
          <View style={{ width: 36 }} />
        </View>

        {/* Map Section */}
        <Text style={styles.sectionTitle}>Map Configuration</Text>
        <View style={styles.sectionCard}>
          <Text style={styles.cardDesc}>Select your preferred map rendering style:</Text>
          
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[styles.segmentOption, mapStyle === "standard" && styles.segmentOptionActive]}
              onPress={() => setMapStyle("standard")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="map"
                size={16}
                color={mapStyle === "standard" ? COLORS.white : COLORS.textMuted}
              />
              <Text style={[styles.segmentOptionText, mapStyle === "standard" && styles.segmentOptionTextActive]}>
                Standard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentOption, mapStyle === "satellite" && styles.segmentOptionActive]}
              onPress={() => setMapStyle("satellite")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="earth"
                size={16}
                color={mapStyle === "satellite" ? COLORS.white : COLORS.textMuted}
              />
              <Text style={[styles.segmentOptionText, mapStyle === "satellite" && styles.segmentOptionTextActive]}>
                Satellite
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cache Section */}
        <Text style={styles.sectionTitle}>Database & Sync</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={handleSync}
            disabled={syncing || clearing}
            activeOpacity={0.7}
          >
            <View style={styles.settingsRowLeft}>
              <View style={[styles.rowIconContainer, { backgroundColor: "rgba(13, 148, 136, 0.08)" }]}>
                {syncing ? (
                  <ActivityIndicator size="small" color={COLORS.accent} />
                ) : (
                  <Ionicons name="sync" size={18} color={COLORS.accent} />
                )}
              </View>
              <Text style={styles.settingsRowText}>Synchronize Database</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={handleClearCache}
            disabled={syncing || clearing}
            activeOpacity={0.7}
          >
            <View style={styles.settingsRowLeft}>
              <View style={[styles.rowIconContainer, { backgroundColor: "rgba(239, 68, 68, 0.08)" }]}>
                {clearing ? (
                  <ActivityIndicator size="small" color={COLORS.error} />
                ) : (
                  <Ionicons name="trash" size={18} color={COLORS.error} />
                )}
              </View>
              <Text style={[styles.settingsRowText, { color: COLORS.error }]}>Reset Local Cache</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <Text style={styles.sectionTitle}>Application Info</Text>
        <View style={[styles.sectionCard, { paddingVertical: 8 }]}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Name</Text>
            <Text style={styles.infoValue}>FutoNav</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0 (v1-Stable)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Campus</Text>
            <Text style={styles.infoValue}>FUTO Main Campus</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Offline Maps</Text>
            <Text style={styles.infoValue}>Enabled</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.primary,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  cardDesc: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segmentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  segmentOptionActive: {
    backgroundColor: COLORS.primary,
  },
  segmentOptionText: {
    fontFamily: FONTS.semibold,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  segmentOptionTextActive: {
    color: COLORS.white,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingsRowText: {
    fontFamily: FONTS.semibold,
    fontSize: 14,
    color: COLORS.textMain,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: COLORS.textMain,
  },
});

