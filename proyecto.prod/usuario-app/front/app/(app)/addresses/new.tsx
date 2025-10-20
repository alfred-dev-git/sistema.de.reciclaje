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
import MapAddressPicker from "@/components/MapAddressPicker";
import { Button } from "@/components/Button";
import { router } from "expo-router";

export default function NewAddressScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [userId, setUserId] = useState<number | null>(null);

  // Campos del formulario (incluye REFERENCIAS)
  const [calle, setCalle] = useState<string>("");
  const [numero, setNumero] = useState<string>("");
  const [barrio, setBarrio] = useState<string>("");
  const [referencias, setReferencias] = useState<string>("");

  // Coordenadas (obligatorias)
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);

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

  const onMapChange = (data: {
    lat: number;
    lng: number;
    calle?: string | null;
    numero?: string | null;
    barrio?: string | null;
    formattedAddress?: string | null;
  }) => {
    setLat(data.lat);
    setLng(data.lng);

    // ✅ SIEMPRE sobrescribimos si el map nos provee el dato (aunque ya haya texto)
    if (data.calle !== undefined) setCalle(data.calle ?? "");
    if (data.numero !== undefined) setNumero(data.numero ? String(data.numero) : "");
    if (data.barrio !== undefined) setBarrio(data.barrio ?? "");
  };

  const onSubmit = async () => {
    if (!userId) return;
    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
      Alert.alert("Faltan datos", "Seleccioná una ubicación en el mapa o buscá por texto.");
      return;
    }
    try {
      setSaving(true);
      await api.post("/addresses", {
        usuario_idusuario: userId,
        calle: calle || null,
        numero: numero || null,
        barrio: barrio || null,
        referencias: referencias || null,
        latitud: Number(lat),
        longitud: Number(lng),
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
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        >
          <Text style={styles.title}>Agregar dirección</Text>

          <MapAddressPicker onChange={onMapChange} />

          <Text style={styles.label}>Calle</Text>
          <TextInput
            style={styles.input}
            value={calle}
            onChangeText={setCalle}
            placeholder="Calle"
            returnKeyType="next"
            blurOnSubmit={false}
          />

          <Text style={styles.label}>Número</Text>
          <TextInput
            style={styles.input}
            value={numero}
            onChangeText={setNumero}
            placeholder="Número"
            keyboardType="numeric"
            returnKeyType="next"
            blurOnSubmit={false}
          />

          <Text style={styles.label}>Barrio</Text>
          <TextInput
            style={styles.input}
            value={barrio}
            onChangeText={setBarrio}
            placeholder="Barrio"
            returnKeyType="next"
            blurOnSubmit={false}
          />

          <Text style={styles.label}>Referencias</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={referencias}
            onChangeText={setReferencias}
            placeholder="Punto de referencia, piso/depto, etc."
            multiline
            textAlignVertical="top"
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
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  label: { fontWeight: "600", marginTop: 12, marginBottom: 6 },
  input: {
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  multiline: {
    height: 100,
    paddingTop: 10,
  },
});
