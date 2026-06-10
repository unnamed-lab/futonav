import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSettingsStore } from "../src/stores/useSettingsStore";
import { syncPois, clearLocalCache, seedBaseline } from "../src/services/syncService";
import { Ionicons } from "@expo/vector-icons";

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
    } catch (error) {
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
            } catch (error) {
              Alert.alert("Error", "Could not clear local database cache.");
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} /> {/* spacer */}
      </View>

      {/* Map Section */}
      <Text style={styles.sectionTitle}>Map Configuration</Text>
      <View style={styles.sectionCard}>
        <Text style={styles.cardDesc}>Select your preferred map rendering style:</Text>
        <View style={styles.mapSelectorContainer}>
          <TouchableOpacity
            style={[styles.mapOption, mapStyle === "standard" && styles.mapOptionActive]}
            onPress={() => setMapStyle("standard")}
          >
            <Ionicons
              name="map"
              size={20}
              color={mapStyle === "standard" ? "#0D9488" : "#64748B"}
            />
            <Text style={[styles.mapOptionText, mapStyle === "standard" && styles.mapOptionTextActive]}>
              Standard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mapOption, mapStyle === "satellite" && styles.mapOptionActive]}
            onPress={() => setMapStyle("satellite")}
          >
            <Ionicons
              name="earth"
              size={20}
              color={mapStyle === "satellite" ? "#0D9488" : "#64748B"}
            />
            <Text style={[styles.mapOptionText, mapStyle === "satellite" && styles.mapOptionTextActive]}>
              Satellite
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cache Section */}
      <Text style={styles.sectionTitle}>Database & Synchronization</Text>
      <View style={styles.sectionCard}>
        <Text style={styles.cardDesc}>
          Ensure campus directories are up-to-date, or clear local storage.
        </Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSync}
          disabled={syncing || clearing}
        >
          {syncing ? (
            <ActivityIndicator size="small" color="#0D9488" style={{ marginRight: 10 }} />
          ) : (
            <Ionicons name="sync-outline" size={20} color="#0D9488" style={{ marginRight: 10 }} />
          )}
          <Text style={[styles.actionButtonText, { color: "#0D9488" }]}>
            {syncing ? "Syncing database..." : "Synchronize Database"}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleClearCache}
          disabled={syncing || clearing}
        >
          {clearing ? (
            <ActivityIndicator size="small" color="#EF4444" style={{ marginRight: 10 }} />
          ) : (
            <Ionicons name="trash-outline" size={20} color="#EF4444" style={{ marginRight: 10 }} />
          )}
          <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>
            {clearing ? "Clearing cache..." : "Reset Local Cache"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <Text style={styles.sectionTitle}>Application Info</Text>
      <View style={[styles.sectionCard, styles.infoCard]}>
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
        <View style={[styles.infoRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <Text style={styles.infoLabel}>Offline Maps</Text>
          <Text style={styles.infoValue}>Enabled</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardDesc: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 20,
  },
  mapSelectorContainer: {
    flexDirection: "row",
    gap: 12,
  },
  mapOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 12,
  },
  mapOptionActive: {
    backgroundColor: "#F0FDFA",
    borderColor: "#0D9488",
  },
  mapOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  mapOptionTextActive: {
    color: "#0D9488",
    fontWeight: "700",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 4,
  },
  infoCard: {
    paddingVertical: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
});
