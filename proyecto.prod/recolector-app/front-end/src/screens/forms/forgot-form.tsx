import { useState } from "react";
import { View, ImageBackground, StyleSheet, Alert } from "react-native";
import { Input } from "../../components/input";
import { Button } from "../../components/button";
import { forgotPasswordService } from "../../api/services/login-service";
import { navigate } from "../../navigation/refglobal-navigation";

export default function ForgotScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    if (!email) return Alert.alert("Ingresá tu e-mail");

    setLoading(true);
    const resp = await forgotPasswordService(email);

    setLoading(false);

    if (!resp.ok) {
      return Alert.alert("Error", resp.mensaje);
    }

    Alert.alert("Listo", "Te enviamos el código si el correo existe.");
    navigate("Reset" as any);
  };

  return (
    <ImageBackground
      source={require("../../../assets/background/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Input
            label="E-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Button
            title={loading ? "Enviando..." : "Enviar código"}
            onPress={onSend}
            disabled={loading}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center", gap: 12 },
  background: { flex: 1 },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 20,
  },
});
