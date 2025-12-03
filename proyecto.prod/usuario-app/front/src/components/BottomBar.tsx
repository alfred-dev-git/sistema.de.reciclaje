// src/components/BottomBar.tsx
import { View, TouchableOpacity, StyleSheet, Text, Platform } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function BottomBar() {
  const insets = useSafeAreaInsets();
  const goHome = () => router.replace("/(app)/home");

  const padBottom = Math.max(insets.bottom, Platform.OS === "android" ? 6 : 0);

  return (
    <View style={[styles.container, { paddingBottom: padBottom }]}>
      <TouchableOpacity onPress={goHome} style={styles.homeBtn} activeOpacity={0.8}>
        <Text style={styles.homeIcon}>🏠</Text>
      </TouchableOpacity>
    </View>
  );
}

const BAR_HEIGHT = 58;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: BAR_HEIGHT,
    backgroundColor: "#1f7a44", // verde
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  homeBtn: {
    backgroundColor: "#fff",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  homeIcon: { fontSize: 22, color: "#1f7a44", fontWeight: "800" },
});
