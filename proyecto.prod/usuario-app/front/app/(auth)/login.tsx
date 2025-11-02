import { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  Image,
  Text,
} from "react-native";
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
    <ImageBackground
      source={require('../../src/assets/background/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding", android: "height" })} keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={require('../../src/assets/logos/logo.png')}
                  style={styles.logo}
                />
              </View>
              <View style={styles.formContainer}>
                <Text style={styles.title}>Iniciar Sesión</Text>
                <Input
                  label="E-mail"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                />
                <PasswordInput label="Contraseña" value={pass} onChangeText={setPass} style={styles.input} />
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
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  // container: { flex: 1, padding: 20, justifyContent: "center", gap: 12 },
  link: { color: "#0a7", fontWeight: "600", textAlign: "center" },
  background: {
    flex: 1,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 40,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    margin: 10,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 20,
  }
  ,
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#005C41',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  botonSecundario: {
    backgroundColor: '#137ce4ff',
    marginTop: 0,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  registerText: {
    color: '#333',
    fontSize: 15,
  },

  registerLink: {
    color: '#2e7040',
    fontWeight: 'bold',
    fontSize: 15,
  },

});
