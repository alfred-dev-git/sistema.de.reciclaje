import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { getCurrentUser } from "@/services/api/auth";
import { api } from "@/services/api/http";
import { Button } from "@/components/Button";
import { router } from "expo-router";
import { geocodeAddress } from "./geocodeAdress"; // si el archivo se llama así, dejalo igual

// ----------------------
// VALIDACIONES Y LIMPIEZA
// ----------------------
const cleanLetters = (t: string) => t.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ .-]/g, "");
const cleanNumbers = (t: string) => t.replace(/[^0-9]/g, "");

const validateStreet = (t: string) =>
  /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .-]{2,}$/.test(t);

const validateNumber = (t: string) => /^[0-9]{1,10}$/.test(t);

const validateText = (t: string) =>
  /^[A-Za-zÁÉÍÓÚáéíóúÑñ .-]{2,}$/.test(t);

export default function NewAddressScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [userId, setUserId] = useState<number | null>(null);

  // Campos del formulario
  const [calle, setCalle] = useState<string>("");
  const [numero, setNumero] = useState<string>("");
  const [barrio, setBarrio] = useState<string>("");
  const [referencias, setReferencias] = useState<string>("");
  const [ciudad, setCiudad] = useState<string>("");
  const [provincia, setProvincia] = useState<string>("");

  const [saving, setSaving] = useState(false);

  // Obtener usuario
  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      const uid = Number(u?.id ?? u?.idusuario);

      if (!Number.isFinite(uid)) {
        Alert.alert("Error", "Sesión inválida");
        return;
      }
      setUserId(uid);
    })();
  }, []);

  // ----------------------
  // SUBMIT
  // ----------------------
  const onSubmit = async () => {
    if (!userId) return;

    // Validaciones
    if (!validateStreet(calle)) {
      Alert.alert("Calle inválida", "La calle solo puede tener letras, números, espacios o puntos.");
      return;
    }

    if (!validateNumber(numero)) {
      Alert.alert("Número inválido", "El número debe contener solo dígitos.");
      return;
    }

    if (ciudad && !validateText(ciudad)) {
      Alert.alert("Ciudad inválida", "Ingrese una ciudad válida.");
      return;
    }

    if (provincia && !validateText(provincia)) {
      Alert.alert("Provincia inválida", "Ingrese una provincia válida.");
      return;
    }

    if (barrio && !validateText(barrio)) {
      Alert.alert("Barrio inválido", "Ingrese un barrio válido.");
      return;
    }

    // 🔥 Verificar duplicado ANTES de guardar
    try {
    const exists = await api.get(
      `/addresses/check-duplicate?userId=${userId}&calle=${calle}&numero=${numero}`
    );

      if (exists?.data?.duplicate) {
        Alert.alert("Ya existe", "Ya agregaste esta dirección antes.");
        return;
      }
    } catch (err) {
      console.log("Error verificando duplicado", err);
    }

    try {
      setSaving(true);

      // Obtener coordenadas
      const coords = await geocodeAddress({
        calle,
        numero,
        barrio: barrio || null,
        ciudad: ciudad || null,
        provincia: provincia || null,
        pais: "Argentina",
      });

      if (!coords) {
        Alert.alert("Error", "No se pudieron obtener coordenadas.");
        return;
      }


      // Guardar en backend.
      await api.post("/addresses", {
        usuario_idusuario: userId,
        calle,
        numero,
        barrio,
        referencias: referencias || null,
        latitud: coords.lat,
        longitud: coords.lng,
      });

      Alert.alert("Listo", "Dirección agregada.");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo guardar la dirección.");
    } finally {
      setSaving(false);
    }
  };

  const keyboardOffset = Platform.select({
    ios: headerHeight,
    android: headerHeight + 12,
  }) as number;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: "height" })}
      keyboardVerticalOffset={keyboardOffset}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingBottom: 24 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Agregar dirección</Text>

          <Text style={styles.label}>Ciudad (opcional)</Text>
          <TextInput
            style={styles.input}
            value={ciudad}
            onChangeText={(t) => setCiudad(cleanLetters(t))}
            placeholder="Ciudad"
            maxLength={50}
          />

          <Text style={styles.label}>Provincia</Text>
          <TextInput
            style={styles.input}
            value={provincia}
            onChangeText={(t) => setProvincia(cleanLetters(t))}
            placeholder="Provincia"
            maxLength={50}
          />

          <Text style={styles.label}>Calle</Text>
          <TextInput
            style={styles.input}
            value={calle}
            onChangeText={(t) => setCalle(cleanLetters(t))}
            placeholder="Calle"
            maxLength={50}
          />

          <Text style={styles.label}>Número</Text>
          <TextInput
            style={styles.input}
            value={numero}
            onChangeText={(t) => setNumero(cleanNumbers(t))}
            placeholder="Número"
            keyboardType="numeric"
            maxLength={15}
          />

          <Text style={styles.label}>Barrio (opcional)</Text>
          <TextInput
            style={styles.input}
            value={barrio}
            onChangeText={(t) => setBarrio(cleanLetters(t))}
            placeholder="Barrio"
            maxLength={50}
          />

          <Text style={styles.label}>Referencias(detalle de la vivienda / donde buscar el bolson)</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={referencias}
            onChangeText={setReferencias}
            placeholder="Piso, depto, punto de referencia…"
            multiline
            textAlignVertical="top"
            maxLength={95}
          />

          <Button
            title={saving ? "Guardando..." : "Guardar dirección"}
            onPress={onSubmit}
            disabled={saving}
          />

          <View style={{ height: 80 }} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 16 },
  label: { marginTop: 12, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  multiline: { height: 100 },
});
