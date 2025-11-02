import { useState } from "react";
import {
  View, StyleSheet, Alert, KeyboardAvoidingView, Platform,
  ScrollView, TouchableWithoutFeedback, Keyboard, Text, ImageBackground
} from "react-native";
import { Link, router } from "expo-router";
import { Input } from "@/components/Input";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/Button";
import { ErrorText } from "@/components/ErrorText";
import { register as registerApi } from "@/services/api/auth";
import { Picker } from "@react-native-picker/picker";

type Form = {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  fecha_nacimiento: string; // "YYYY-MM-DD"
  sexo: "M" | "F" | "O";
};

export default function RegisterScreen() {
  const [form, setForm] = useState<Form>({
    dni: "",
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
    fecha_nacimiento: "",
    sexo: "O",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  const setField = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!form.dni) e.dni = "Requerido";
    if (!/^\d+$/.test(form.dni)) e.dni = "Solo números (sin puntos)";
    if (!form.nombre) e.nombre = "Requerido";
    if (!form.apellido) e.apellido = "Requerido";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) e.email = "Email inválido";
    if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (!form.telefono) e.telefono = "Requerido";
    const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(form.fecha_nacimiento);
    if (!dateOk) e.fecha_nacimiento = "Formato YYYY-MM-DD";
    if (!["M", "F", "O"].includes(form.sexo)) e.sexo = "Seleccioná una opción";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onRegister = async () => {
    setSubmitError(undefined);
    if (!validate()) return;

    try {
      setLoading(true);

      await registerApi({
        dni: form.dni.trim(), // <<--- NUEVO
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        telefono: form.telefono,
        fecha_nacimiento: form.fecha_nacimiento,
        sexo: form.sexo,
        // Si querés enviar explícitos:
        // rol_idrol: 2,
        // municipio_idmunicipio: 1,
        // puntos: 0,
      });

      router.replace("/(app)/home");
    } catch (err: any) {
      const msg = err?.message ?? "No se pudo registrar.";
      setSubmitError(msg);
      Alert.alert("Error", msg);
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: "height" })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
              <View style={styles.formContainer}>
                <Input
                  label="DNI"
                  placeholder="dni sin puntos"
                  keyboardType="number-pad"
                  value={form.dni}
                  onChangeText={(t) => setField("dni", t.replace(/\D+/g, ""))}
                  error={errors.dni}
                />

                <Input label="Nombre" value={form.nombre} onChangeText={(t) => setField("nombre", t)} error={errors.nombre} />
                <Input label="Apellido" value={form.apellido} onChangeText={(t) => setField("apellido", t)} error={errors.apellido} />
                <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={(t) => setField("email", t)} error={errors.email} />
                <PasswordInput label="Contraseña" value={form.password} onChangeText={(t) => setField("password", t)} error={errors.password} />

                <Input label="Teléfono" keyboardType="phone-pad" value={form.telefono} onChangeText={(t) => setField("telefono", t)} error={errors.telefono} />
                <Input label="Fecha de nacimiento (YYYY-MM-DD)" placeholder="1990-05-10" value={form.fecha_nacimiento} onChangeText={(t) => setField("fecha_nacimiento", t)} error={errors.fecha_nacimiento} />

                <Text style={{ fontWeight: "700", marginTop: 8 }}>Sexo</Text>
                <Picker
                  selectedValue={form.sexo}
                  onValueChange={(v) => setField("sexo", v as Form["sexo"])}
                >
                  <Picker.Item label="Masculino" value="M" />
                  <Picker.Item label="Femenino" value="F" />
                  <Picker.Item label="Otro / Prefiero no decir" value="O" />
                </Picker>
                {errors.sexo ? <ErrorText>{errors.sexo}</ErrorText> : null}

                <ErrorText>{submitError}</ErrorText>
                <Button title={loading ? "Creando..." : "Crear cuenta"} onPress={onRegister} loading={loading} disabled={loading} />

                <View style={{ height: 12 }} />
                <Link href="/(auth)/login">¿Ya tenés cuenta? Iniciá sesión</Link>
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
  container: {
    flex: 1,
    justifyContent: 'center',
    margin: 10,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 20,
  },
  background: {
    flex: 1,
  }
});
