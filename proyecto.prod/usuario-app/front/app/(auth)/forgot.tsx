import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { requestPasswordReset } from "@/services/api/auth";
import { router } from "expo-router";

export default function ForgotScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    if (!email) return Alert.alert("Ingresá tu e-mail");
    try {
      setLoading(true);
      await requestPasswordReset(email.trim().toLowerCase());
      Alert.alert("Listo", "Si el e-mail existe, te enviamos un código.");
      router.push("/(auth)/reset");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No pudimos enviar el código");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input label="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Button title={loading ? "Enviando..." : "Enviar código"} onPress={onSend} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center", gap: 12 },
});
