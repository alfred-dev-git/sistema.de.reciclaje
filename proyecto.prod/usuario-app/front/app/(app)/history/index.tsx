import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { getCurrentUser } from "@/services/api/auth";
import { getHistorial, cancelarPedido } from "@/services/api/requests";
import DetallePedidoModal from "./detalle";

type Item = {
  idpedidos: number;
  fecha_emision: string;
  estado: string;
  tiene_ruta?: number;
  id_direccion: number;
  calle?: string | null;
  numero?: string | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
  tipo_id: number;
  tipo_descripcion: string;
};

const statusMap: Record<string, { label: string; bg: string; fg: string }> = {
  pendiente: { label: "Pendiente", bg: "#f59e0b", fg: "#000" },
  completada: { label: "Completada", bg: "#16a34a", fg: "#fff" },
  anulado: { label: "Anulada", bg: "#dc2626", fg: "#fff" },
  anulada: { label: "Anulada", bg: "#dc2626", fg: "#fff" },
};

export default function HistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ⬅️ nuevo
  const [items, setItems] = useState<Item[]>([]);
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<number | null>(null);

  const abrirModal = (id: number) => {
    setPedidoSeleccionado(id);
    setDetalleVisible(true);
  };

  const cerrarModal = () => {
    setDetalleVisible(false);
    setPedidoSeleccionado(null);
  };

  const cargarHistorial = async () => {
    try {
      const u = await getCurrentUser();
      const uid = Number(u?.id ?? u?.idusuario);
      if (!Number.isFinite(uid)) return;
      const data = await getHistorial(uid);
      setItems(Array.isArray(data) ? (data as Item[]) : []);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Recarga manual
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await cargarHistorial();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const handleCancelarPedido = async (idPedido: number) => {
    Alert.alert(
      "Cancelar pedido",
      "¿Estás seguro de que querés cancelar este pedido?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelarPedido(idPedido);
              Alert.alert("Éxito", "El pedido fue cancelado correctamente.");
              cargarHistorial();
            } catch (e) {
              Alert.alert("Error", "No se pudo cancelar el pedido.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Cargando historial…</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Item }) => {
    const status = statusMap[item.estado?.toLowerCase()] ?? {
      label: item.estado || "Sin estado",
      bg: "#9ca3af",
      fg: "#000",
    };
    const direccion = item.calle
      ? `${item.calle} ${item.numero ?? ""}`.trim()
      : `(${Number(item.latitud ?? 0).toFixed(5)}, ${Number(item.longitud ?? 0).toFixed(5)})`;

    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>N° de orden: {item.idpedidos}</Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.fg }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.line}>📅 Emisión: {item.fecha_emision}</Text>
        <Text style={styles.line}>📍 Dirección: {direccion}</Text>
        <Text style={styles.line}>♻️ Tipo: {item.tipo_descripcion}</Text>

        {item.estado?.toLowerCase() === "completada" && (
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => abrirModal(item.idpedidos)}
          >
            <Text style={styles.detailButtonText}>Ver detalle</Text>
          </TouchableOpacity>
        )}

        {item.estado?.toLowerCase() === "pendiente" && !item.tiene_ruta && (
          <TouchableOpacity
            style={[styles.detailButton, { backgroundColor: "#dc2626" }]}
            onPress={() => handleCancelarPedido(item.idpedidos)}
          >
            <Text style={styles.detailButtonText}>Cancelar pedido</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historial en el mes</Text>

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.idpedidos)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {pedidoSeleccionado && (
        <DetallePedidoModal
          visible={detalleVisible}
          idPedido={pedidoSeleccionado}
          onClose={cerrarModal}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingBottom: 90 },
  container: { flex: 1, padding: 16, paddingBottom: 90, backgroundColor: "#f9fafb" },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  card: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    padding: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "700" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontWeight: "700", fontSize: 12 },
  line: { marginTop: 6, color: "#111827" },
  detailButton: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  detailButtonText: { color: "#fff", fontWeight: "700" },
});
