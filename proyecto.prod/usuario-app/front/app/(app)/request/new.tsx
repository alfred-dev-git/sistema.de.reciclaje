import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
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

  const [addressId, setAddressId] = useState<number | undefined>(undefined);
  const [residuoId, setResiduoId] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        if (!u) throw new Error("Sesión no encontrada");
        const uid = Number(u.id ?? u.idusuario);
        if (!Number.isFinite(uid)) throw new Error("Usuario inválido");
        setUserId(uid);

        const [addressesResp, residuosResp] = await Promise.all([
          listUserAddresses(uid),
          listResiduos(),
        ]);

        const addresses = toArray<AddressApi>(addressesResp);
        const residuos = toArray<ResiduoApi>(residuosResp);

        const addrOpts: Option[] = addresses.map((a) => {
          const id = Number(a.iddirecciones ?? a.id);
          const latNum = Number(a.latitud);
          const lonNum = Number(a.longitud);
          const latTxt = Number.isFinite(latNum) ? latNum.toFixed(5) : String(a.latitud);
          const lonTxt = Number.isFinite(lonNum) ? lonNum.toFixed(5) : String(a.longitud);
          const base = a.calle ? `${a.calle} ${a.numero ?? ""}`.trim() : "Lat/Lon";
          return { label: `${base} (${latTxt}, ${lonTxt})`, value: id };
        });

        const resOpts: Option[] = residuos.map((r) => {
          const id = Number(r.idtipo_reciclable ?? r.id);
          return { label: r.descripcion, value: id };
        });

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
        usuario_idusuario: Number(userId),
        id_direccion: Number(addressId),
        tipo_reciclable_idtipo_reciclable: Number(residuoId),
        // estado: 0,
        // total_puntos: 0,
      });

      Alert.alert("Listo", "Pedido creado.");

      // 👉 Opción A: ir a Inicio (evitamos que crashee el historial mientras lo ajustamos)
      router.replace("/(app)/home");

      // 👉 Opción B: quedarse en la misma pantalla (descomentá si preferís)
      // setAddressId(undefined);
      // setResiduoId(undefined);

    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo crear el pedido.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Cargando...</Text>
      </View>
    );
  }

  const hasAddresses = addressOpts.length > 0;
  const hasResiduos = residuoOpts.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Recolección</Text>

      <Text style={styles.label}>Dirección</Text>
      <Picker
        selectedValue={addressId}
        onValueChange={(v) => setAddressId(v as number | undefined)}
        enabled={hasAddresses}
      >
        <Picker.Item
          label={hasAddresses ? "Seleccionar..." : "No hay direcciones"}
          value={undefined}
        />
        {addressOpts.map((opt) => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>

      <Text style={styles.label}>Tipo de residuo</Text>
      <Picker
        selectedValue={residuoId}
        onValueChange={(v) => setResiduoId(v as number | undefined)}
        enabled={hasResiduos}
      >
        <Picker.Item
          label={hasResiduos ? "Seleccionar..." : "No hay tipos disponibles"}
          value={undefined}
        />
        {residuoOpts.map((opt) => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>

      <View style={{ height: 12 }} />
      <Text
        onPress={onSubmit}
        style={[styles.btn, saving && { opacity: 0.6 }]}
      >
        {saving ? "Guardando..." : "Confirmar pedido"}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingBottom: 90 },
  container: { flex: 1, padding: 16, gap: 8, paddingBottom: 90 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  label: { fontWeight: "600", marginTop: 8 },
  btn: {
    textAlign: "center",
    backgroundColor: "#0a7",
    color: "#fff",
    paddingVertical: 12,
    borderRadius: 10,
    fontWeight: "700",
  },
});
