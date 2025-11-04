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
  ImageBackground,
  TouchableOpacity,
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
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [municipioId, setMunicipioId] = useState("");
  const [sexo, setSexo] = useState<Sex>("O");
  const [avatarUri, setAvatarUri] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      try {
        const me = await getCurrentUser();
        if (!me?.id && !me?.idusuario) throw new Error("Sesión inválida");
        const id = Number(me.id ?? me.idusuario);
        setUserId(id);
        setAvatarUri(getUserPhotoUrl ? getUserPhotoUrl(id) : undefined);
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

    if (!nombre || !apellido) {
      setErrorMsg("Nombre y apellido son requeridos.");
      return;
    }
    if (fechaNacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
      setErrorMsg("Fecha de nacimiento debe ser YYYY-MM-DD.");
      return;
    }

    try {
      setSaving(true);
      const body: Record<string, any> = {
        dni: dni ? dni.replace(/\D+/g, "") : undefined,
        nombre: nombre || undefined,
        apellido: apellido || undefined,
        telefono: telefono || undefined,
        fecha_nacimiento: fechaNacimiento || undefined,
        municipio_idmunicipio: municipioId ? Number(municipioId) : undefined,
        sexo: sexo || undefined,
      };
      Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);

      const resp = await api.put<{ user: any }>(`/users/${userId}`, body);
      await SecureStore.setItemAsync("current_user", JSON.stringify(resp.user));

      Alert.alert("Listo", "Datos actualizados.");
      router.back();
    } catch (e: any) {
      const msg = e?.message ?? "No se pudieron actualizar los datos.";
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
      await uploadUserPhoto(userId, asset.uri);
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
      <View style={[styles.center]}>
        <Text style={{ color: "#fff" }}>Cargando…</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/background/bg-dashboard2.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

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
            <View style={styles.card}>
              <Text style={styles.title}>Editar perfil</Text>

              <View style={styles.avatarRow}>
                <Image
                  source={
                    avatarUri
                      ? { uri: avatarUri }
                      : require("@/assets/avatar-placeholder.png")
                  }
                  style={styles.avatar}
                />
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={onChangePhoto}
                >
                  <Text style={styles.photoButtonText}>Cambiar foto</Text>
                </TouchableOpacity>
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

              <Text style={styles.label}>Sexo</Text>
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

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                disabled={saving}
                onPress={onSave}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0A7",
    marginBottom: 16,
    textAlign: "center",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#0A7",
    backgroundColor: "#eee",
  },
  photoButton: {
    backgroundColor: "#0A7",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: "#0A7",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },
  photoButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  label: {
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
    color: "#333",
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: "#0A7",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#00C897",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A7",
  },
});
