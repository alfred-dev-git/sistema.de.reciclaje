import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { router } from "expo-router";


export default function HomeScreen() {
  return (
    <ImageBackground
      source={require('../../src/assets/background/bg-dashboard.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >

      <View style={styles.container}>
        <Text style={styles.title}>¡Hola!</Text>
        <TouchableOpacity style={styles.cta} onPress={() => router.push("/(app)/request/new")}>
          <Text style={styles.ctaText}>Solicitar recolección</Text>
        </TouchableOpacity>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center", paddingBottom: 90 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  cta: { backgroundColor: "#0a7", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10 },
  ctaText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
