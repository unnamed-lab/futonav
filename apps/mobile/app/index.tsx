import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function MapScreen() {
  const router = useRouter();

  useEffect(() => {
    const hasSeenOnboarding = false; // TODO: read from settings store
    if (!hasSeenOnboarding) {
      router.replace("/onboarding");
    }
  }, []);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
