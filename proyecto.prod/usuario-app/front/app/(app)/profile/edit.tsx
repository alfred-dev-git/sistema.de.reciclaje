import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { router } from "expo-router";

import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ErrorText } from "@/components/ErrorText";

import * as SecureStore from "expo-secure-store";
import { getCurrentUser } from "@/services/api/auth";
import { api } from "@/services/api/http";
import {
  getUserPhotoUrl,
  uploadUserPhoto,
  pickImageFromLibrary,
} from "@/services/api/user";
import { Picker } from "@react-native-picker/picker";

type Sex = "M" | "F" | "O";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [userId, setUserId] = useState<number | null>(null);

  // Estado del formulario
  const [dni, setDni] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [apellido, setApellido] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [fechaNacimiento, setFechaNacimiento] = useState<string>(""); // YYYY-MM-DD
  const [municipioId, setMunicipioId] = useState<string>(""); // numérico en string
  const [sexo, setSexo] = useState<Sex>("O");

  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const me = await getCurrentUser();
        if (!me?.id && !me?.idusuario) throw new Error("Sesión inválida");
        const id = Number(me.id ?? me.idusuario);
        setUserId(id);

        // Pre-cargar foto si tenés endpoint de lectura por URL
        setAvatarUri(getUserPhotoUrl ? getUserPhotoUrl(id) : undefined);

        // Prellenar
        setDni(me.dni ? String(me.dni) : "");
        setNombre(me.nombre ?? "");
        setApellido(me.apellido ?? "");
        setTelefono(me.telefono ? String(me.telefono) : "");
        setFechaNacimiento(me.fecha_nacimiento ?? "");
        setMunicipioId(
          Number.isFinite(Number(me.municipio_idmunicipio))
            ? String(me.municipio_idmunicipio)
            : ""
        );
        setSexo((me.sexo as Sex) ?? "O");
      } catch (e: any) {
        setErrorMsg(e?.message ?? "No se pudieron cargar tus datos.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    if (!userId) return;

    setErrorMsg(undefined);

    // Validaciones mínimas
    if (!nombre || !apellido) {
      setErrorMsg("Nombre y apellido son requeridos.");
      return;
    }
    if (fechaNacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
      setErrorMsg("Fecha de nacimiento debe ser YYYY-MM-DD.");
      return;
    }
    if (sexo && !["M", "F", "O"].includes(sexo)) {
      setErrorMsg("Sexo inválido.");
      return;
    }

    try {
      setSaving(true);

      // Armamos body con solo lo que queremos actualizar
      const body: Record<string, any> = {
        dni: dni ? String(dni).replace(/\D+/g, "") : undefined,
        nombre: nombre || undefined,
        apellido: apellido || undefined,
        telefono: telefono || undefined,
        fecha_nacimiento: fechaNacimiento || undefined,
        municipio_idmunicipio: municipioId ? Number(municipioId) : undefined,
        sexo: sexo || undefined,
      };

      // Quitamos undefineds para no tocar campos que no querés cambiar
      Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);

      const resp = await api.put<{ user: any }>(`/users/${userId}`, body);
      const updated = resp.user;

      // Guardar en SecureStore para que el resto de la app lo vea
      await SecureStore.setItemAsync("current_user", JSON.stringify(updated));

      Alert.alert("Listo", "Datos actualizados.");
      router.back();
    } catch (e: any) {
      const msg =
        e?.message ?? e?.data?.error ?? "No se pudieron actualizar los datos.";
      setErrorMsg(msg);
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  const onChangePhoto = async () => {
    try {
      if (!userId) return;
      const asset = await pickImageFromLibrary();
      if (!asset?.uri) return;

      await uploadUserPhoto(userId, asset.uri); // usa tu endpoint /users/:id/photo
      // Forzamos refresh visual (bust cache)
      const bust = Date.now();
      setAvatarUri(
        getUserPhotoUrl ? `${getUserPhotoUrl(userId)}?t=${bust}` : asset.uri
      );

      Alert.alert("Listo", "Foto actualizada.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo actualizar la foto.");
    }
  };

  const keyboardOffset = Platform.select({
    ios: headerHeight,
    android: headerHeight + 12,
  }) as number;

  if (loading) {
    return (
      <View style={[styles.center, { paddingBottom: 24 + insets.bottom }]}>
        <Text>Cargando…</Text>
      </View>
    );
  }

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
          <Text style={styles.title}>Editar datos</Text>

          {/* Avatar + Cambiar foto */}
          <View style={styles.avatarRow}>
            <Image
              source={
                avatarUri
                  ? { uri: avatarUri }
                  : require("@/assets/avatar-placeholder.png")
              }
              style={styles.avatar}
            />
            <Button title="Cambiar foto" onPress={onChangePhoto} />
          </View>

          <Input
            label="DNI (sin puntos)"
            value={dni}
            onChangeText={(t) => setDni(t.replace(/\D+/g, ""))}
            keyboardType="number-pad"
          />
          <Input label="Nombre" value={nombre} onChangeText={setNombre} />
          <Input label="Apellido" value={apellido} onChangeText={setApellido} />
          <Input
            label="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
          <Input
            label="Fecha de nacimiento (YYYY-MM-DD)"
            value={fechaNacimiento}
            onChangeText={setFechaNacimiento}
            placeholder="1990-05-10"
          />
          <Input
            label="Municipio (ID numérico)"
            value={municipioId}
            onChangeText={(t) => setMunicipioId(t.replace(/\D+/g, ""))}
            keyboardType="number-pad"
          />

          <Text style={{ fontWeight: "700", marginTop: 8 }}>Sexo</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={sexo}
              onValueChange={(v) => setSexo(v as Sex)}
            >
              <Picker.Item label="Masculino" value="M" />
              <Picker.Item label="Femenino" value="F" />
              <Picker.Item label="Otro / Prefiero no decir" value="O" />
            </Picker>
          </View>

          <ErrorText>{errorMsg}</ErrorText>

          <Button
            title={saving ? "Guardando..." : "Guardar cambios"}
            onPress={onSave}
            disabled={saving}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#eee",
  },
  pickerWrap: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 4,
    backgroundColor: "#fff",
  },
});
