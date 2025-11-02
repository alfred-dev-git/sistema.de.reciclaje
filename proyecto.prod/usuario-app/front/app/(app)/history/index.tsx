import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { getCurrentUser } from "@/services/api/auth";
import { getHistorial } from "@/services/api/requests";


type Item = {
  idpedidos: number;
  fecha_emision: string; // 'YYYY-MM-DD'
  estado?: number;       // 1,2,3
  id_direccion: number;
  calle?: string | null;
  numero?: string | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
  tipo_id: number;
  tipo_descripcion: string;
  fecha_entrega?: string | null; // puede venir null
};

const statusMap: Record<number, { label: string; bg: string; fg: string }> = {
  1: { label: "Retirado", bg: "#16a34a", fg: "#fff" },   // verde
  2: { label: "Cancelado", bg: "#dc2626", fg: "#fff" },  // rojo
  3: { label: "En proceso", bg: "#f59e0b", fg: "#000" }, // amarillo
};

export default function HistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        const uid = Number(u?.id ?? u?.idusuario);
        if (!Number.isFinite(uid)) return;

        const data = await getHistorial(uid);
        setItems(Array.isArray(data) ? (data as Item[]) : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Cargando historial…</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Item }) => {
    const status = statusMap[item.estado ?? 3] ?? statusMap[3];
    const dir =
      item.calle
        ? `${item.calle} ${item.numero ?? ""}`.trim()
        : `(${Number(item.latitud ?? 0).toFixed(5)}, ${Number(item.longitud ?? 0).toFixed(5)})`;

    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{item.tipo_descripcion}</Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.fg }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <Text style={styles.line}>📍 {dir}</Text>
        <Text style={styles.line}>📅 Emisión: {item.fecha_emision}</Text>
        <Text style={styles.line}>🗓️ Retiro: {item.fecha_entrega ?? "-"}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historial</Text>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.idpedidos)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingBottom: 90 },
  container: { flex: 1, padding: 16, paddingBottom: 90 },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  card: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    padding: 12,
    backgroundColor: "#fff",
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "700" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontWeight: "700", fontSize: 12 },
  line: { marginTop: 6 },
});
