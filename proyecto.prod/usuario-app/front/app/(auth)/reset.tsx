import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Input } from "@/components/Input";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/Button";
import { resetPassword } from "@/services/api/auth";
import { router } from "expo-router";

export default function ResetScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const onReset = async () => {
    if (!email || !code || pass.length < 6) {
      return Alert.alert("Completá email, código y nueva contraseña (min. 6).");
    }
    try {
      setLoading(true);
      await resetPassword({ email: email.trim().toLowerCase(), code: code.trim(), new_password: pass });
      Alert.alert("OK", "Tu contraseña fue actualizada.");
      router.replace("/(auth)/login");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo restablecer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input label="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Input label="Código" value={code} onChangeText={setCode} keyboardType="number-pad" />
      <PasswordInput label="Nueva contraseña" value={pass} onChangeText={setPass} />
      <Button title={loading ? "Actualizando..." : "Restablecer"} onPress={onReset} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center", gap: 12 },
});
