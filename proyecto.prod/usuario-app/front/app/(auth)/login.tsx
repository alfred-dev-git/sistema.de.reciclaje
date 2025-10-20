import { useState } from "react";
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Link, router } from "expo-router";
import { Input } from "@/components/Input";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/Button";
import { login } from "@/services/api/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !pass) return Alert.alert("Completá email y contraseña");
    try {
      setLoading(true);
      await login({ email: email.trim().toLowerCase(), password: pass });
      router.replace("/(app)/home");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding", android: "height" })} keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Input label="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <PasswordInput label="Contraseña" value={pass} onChangeText={setPass} />

            <Button title={loading ? "Ingresando..." : "Ingresar"} onPress={onLogin} disabled={loading} />

            <View style={{ height: 12 }} />

            {/* ✅ Link de recuperación */}
            <Link href="/(auth)/forgot" style={styles.link}>
              ¿Olvidaste tu contraseña?
            </Link>

            <View style={{ height: 8 }} />

            <Link href="/(auth)/register" style={styles.link}>
              Crear cuenta
            </Link>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  container: { flex: 1, padding: 20, justifyContent: "center", gap: 12 },
  link: { color: "#0a7", fontWeight: "600", textAlign: "center" },
});
