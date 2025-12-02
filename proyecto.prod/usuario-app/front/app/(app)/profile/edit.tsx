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
  Text,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { router } from "expo-router";
import { Input } from "@/components/Input";
import { ErrorText } from "@/components/ErrorText";
import * as SecureStore from "expo-secure-store";
import { getCurrentUser, listMunicipios } from "@/services/api/auth";
import { api } from "@/services/api/http";
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [municipios, setMunicipios] = useState<{ id: number; descripcion: string }[]>([]);
    useEffect(() => {
    const cargarMunicipios = async () => {
      try {
        const data = await listMunicipios();
        setMunicipios(data);
      } catch (err) {
        console.error("Error cargando municipios", err);
        Alert.alert("Error", "No se pudieron cargar los municipios.");
      }
    };

    cargarMunicipios();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await getCurrentUser();
        if (!me?.id && !me?.idusuario) throw new Error("Sesión inválida");
        const id = Number(me.id ?? me.idusuario);
        setUserId(id);
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

              {/* Avatar con inicial */}
            <View style={styles.avatarRow}>
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {(nombre?.trim()?.[0] ?? "U").toUpperCase()}
                </Text>
              </View>
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
              <Text style={styles.label}>Municipio</Text>

              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={municipioId ? Number(municipioId) : null}
                  onValueChange={(v) => {
                    setMunicipioId(String(v));
                  }}
                >
                  <Picker.Item label="Seleccione un municipio..." value={null} />

                  {municipios.map((m) => (
                    <Picker.Item key={m.id} label={m.descripcion} value={m.id} />
                  ))}
                </Picker>
              </View>

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
  avatarFallback: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: "#0A7",
  alignItems: "center",
  justifyContent: "center"
},
avatarText: {
  fontSize: 36,
  fontWeight: "800",
  color: "#fff"
}

});
