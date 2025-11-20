import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Input } from "../../components/input";
import { PasswordInput } from "../../components/password-inputs";
import { resetPasswordService } from "../../api/services/login-service";
import { navigate } from "../../navigation/refglobal-navigation";
import { Button } from "../../components/button";

export default function ResetScreen() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const onReset = async () => {
    if (!email || !token || pass.length < 6) {
      return Alert.alert("Completá email, código y nueva contraseña (mínimo 6 caracteres)");
    }

    setLoading(true);

    const resp = await resetPasswordService(
      email.trim().toLowerCase(),
      token.trim(),
      pass
    );

    setLoading(false);

    if (!resp.ok) {
      return Alert.alert("Error", resp.mensaje);
    }

    Alert.alert("OK", "Tu contraseña fue actualizada.");
    navigate("Login" as any);
  };

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Input
        label="Código"
        value={token}
        onChangeText={setToken}
        keyboardType="default"
      />

      <PasswordInput
        label="Nueva contraseña"
        value={pass}
        onChangeText={setPass}
      />

      <Button
        title={loading ? "Actualizando..." : "Restablecer"}
        onPress={onReset}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center", gap: 12 },
});
