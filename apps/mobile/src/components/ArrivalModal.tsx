import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Poi } from "@futonav/shared";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS } from "../theme/theme";

interface ArrivalModalProps {
  visible: boolean;
  poi: Poi | null;
  onDismiss: () => void;
}

export function ArrivalModal({ visible, poi, onDismiss }: ArrivalModalProps) {
  if (!poi) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconBadge}>
            <Ionicons name="checkmark-circle" size={48} color={COLORS.accent} />
          </View>

          <Text style={styles.title}>You Have Arrived!</Text>
          <Text style={styles.subtitle}>You are now at {poi.name}.</Text>

          {poi.description ? (
            <Text style={styles.desc} numberOfLines={2}>
              {poi.description}
            </Text>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={onDismiss} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Finish Navigation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(13, 148, 136, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.primary,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 12,
  },
  desc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  button: {
    width: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  buttonText: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
    fontSize: 15,
  },
});
