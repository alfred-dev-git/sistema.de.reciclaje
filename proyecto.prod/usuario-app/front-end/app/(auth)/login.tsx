import { useState } from "react";
import {
  View, StyleSheet, Alert, KeyboardAvoidingView, Platform,
  ScrollView, TouchableWithoutFeedback, Keyboard, Image, Dimensions
} from "react-native";
import { Link, router } from "expo-router";
import { Input } from "@/components/Input";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/Button";
import { ErrorText } from "@/components/ErrorText";
import { login as loginApi } from "@/services/api/auth";

const { height } = Dimensions.get("window");
const HERO = require("../../src/assets/login-hero.png");

type Form = { email: string; password: string };

export default function LoginScreen() {
  const [form, setForm] = useState<Form>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  const setField = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) e.email = "Email inválido";
    if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onLogin = async () => {
    setSubmitError(undefined);
    if (!validate()) return;

    try {
      setLoading(true);
      await loginApi({ email: form.email, password: form.password });
      router.replace("/(app)/home");
    } catch (err: any) {
      const msg = err?.message ?? "No se pudo iniciar sesión.";
      setSubmitError(msg);
      Alert.alert("Error al iniciar sesión", msg);
    } finally {
      setLoading(false);
    }
  };

  // Altura del hero: aprox. mitad superior del área “inputs”
  const heroHeight = Math.max(160, Math.min(260, height * 0.28));

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding", android: "height" })} keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Image source={HERO} style={[styles.hero, { height: heroHeight }]} resizeMode="cover" />

            <Input
              label="Email"
              placeholder="correo@ejemplo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(t) => setField("email", t)}
              error={errors.email}
            />

            <PasswordInput
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChangeText={(t) => setField("password", t)}
              error={errors.password}
            />

            <ErrorText>{submitError}</ErrorText>

            <Button title={loading ? "Ingresando..." : "Ingresar"} onPress={onLogin} loading={loading} disabled={loading} style={{ marginTop: 8 }} />

            <View style={{ height: 12 }} />
            <Link href="/(auth)/register">¿No tenés cuenta? Registrate</Link>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  container: { flex: 1, padding: 20, justifyContent: "center" },
  hero: {
    width: "100%",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#eee",
  },
});
