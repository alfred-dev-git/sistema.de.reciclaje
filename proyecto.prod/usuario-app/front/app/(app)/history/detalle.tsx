import React, { useEffect, useState } from "react";
import { Modal, View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { getDetallePedido } from "@/services/api/requests";

interface Props {
  visible: boolean;
  onClose: () => void;
  idPedido: number;
}

export default function DetallePedidoModal({ visible, onClose, idPedido }: Props) {
  const [detalle, setDetalle] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      setLoading(true);
      try {
        const result = await getDetallePedido(idPedido);
        setDetalle(result);
      } finally {
        setLoading(false);
      }
    })();
  }, [visible, idPedido]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {loading ? (
            <ActivityIndicator />
          ) : detalle ? (
            <>
              <Text style={styles.title}>Pedido #{detalle.idpedidos}</Text>
              <Text>🗓️ Entrega: {detalle.fecha_entrega ?? "-"}</Text>
              <Text>🧺 Bolsones: {detalle.cant_bolson ?? "-"}</Text>
              <Text>📝 Observación: {detalle.observaciones ?? "Sin observaciones"}</Text>
              <Text>⭐ Puntos totales: {detalle.total_puntos ?? "-"}</Text>
            </>
          ) : (
            <Text>No se encontró información del pedido.</Text>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  modal: { backgroundColor: "#fff", padding: 16, borderRadius: 10, width: "85%" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  closeBtn: { marginTop: 16, backgroundColor: "#2563eb", paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  closeText: { color: "#fff", fontWeight: "700" },
});
