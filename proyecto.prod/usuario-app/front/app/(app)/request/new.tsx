import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";

import { listUserAddresses } from "@/services/api/addresses";
import { listResiduos, createPedido } from "@/services/api/requests";
import { getCurrentUser } from "@/services/api/auth";

type Option = { label: string; value: number };
type AddressApi = {
  id?: number;
  iddirecciones?: number;
  calle?: string | null;
  numero?: string | null;
  latitud: number | string;
  longitud: number | string;
};
type ResiduoApi = {
  id?: number;
  idtipo_reciclable?: number;
  descripcion: string;
};

function toArray<T = any>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (Array.isArray(v?.data)) return v.data as T[];
  if (Array.isArray(v?.rows)) return v.rows as T[];
  return [];
}

export default function RequestNewScreen() {
  const [userId, setUserId] = useState<number | null>(null);
  const [addressOpts, setAddressOpts] = useState<Option[]>([]);
  const [residuoOpts, setResiduoOpts] = useState<Option[]>([]);
  const [addressId, setAddressId] = useState<number | undefined>();
  const [residuoId, setResiduoId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        if (!u) throw new Error("Sesión no encontrada");
        const uid = Number(u.id ?? u.idusuario);
        setUserId(uid);

        const [addressesResp, residuosResp] = await Promise.all([
          listUserAddresses(uid),
          listResiduos(),
        ]);

        const addresses = toArray<AddressApi>(addressesResp);
        const residuos = toArray<ResiduoApi>(residuosResp);

        const addrOpts: Option[] = addresses.map((a) => {
          const id = Number(a.iddirecciones ?? a.id);
          const base = a.calle ? `${a.calle} ${a.numero ?? ""}`.trim() : "Lat/Lon";
          return { label: `${base}`, value: id };
        });

        const resOpts: Option[] = residuos.map((r) => ({
          label: r.descripcion,
          value: Number(r.idtipo_reciclable ?? r.id),
        }));

        setAddressOpts(addrOpts);
        setResiduoOpts(resOpts);
        if (addrOpts[0]) setAddressId(addrOpts[0].value);
        if (resOpts[0]) setResiduoId(resOpts[0].value);
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "No se pudo cargar datos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit = async () => {
    if (!userId || !addressId || !residuoId) {
      Alert.alert("Faltan datos", "Elegí una dirección y un tipo de residuo.");
      return;
    }
    try {
      setSaving(true);
      await createPedido({
        usuario_idusuario: userId,
        id_direccion: addressId,
        tipo_reciclable_idtipo_reciclable: residuoId,
      });
      Alert.alert("Listo", "Pedido creado.");
      router.replace("/(app)/home");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo crear el pedido.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1f7a44" />
        <Text style={{ color: "#333" }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/background/bg-dashboard.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Nueva Recolección</Text>

          <Text style={styles.label}>Dirección</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={addressId}
              onValueChange={(v) => setAddressId(v as number | undefined)}
              style={styles.picker}
            >
              <Picker.Item
                label={
                  addressOpts.length > 0 ? "Seleccionar..." : "No hay direcciones"
                }
                value={undefined}
              />
              {addressOpts.map((opt) => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Tipo de residuo</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={residuoId}
              onValueChange={(v) => setResiduoId(v as number | undefined)}
              style={styles.picker}
            >
              <Picker.Item
                label={
                  residuoOpts.length > 0
                    ? "Seleccionar..."
                    : "No hay tipos disponibles"
                }
                value={undefined}
              />
              {residuoOpts.map((opt) => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity
            onPress={onSubmit}
            disabled={saving}
            style={[styles.btn, saving && { opacity: 0.6 }]}
          >
            <Text style={styles.btnText}>
              {saving ? "Guardando..." : "Confirmar pedido"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f7a44",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    marginTop: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  picker: {
    height: 48,
  },
  btn: {
    backgroundColor: "#1f7a44",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});
