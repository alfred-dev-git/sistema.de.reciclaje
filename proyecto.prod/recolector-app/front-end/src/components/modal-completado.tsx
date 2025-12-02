import React, { useState, useEffect } from "react";
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from "react-native";

interface ModalCompletadoProps {
  visible: boolean;
  parada: any;
  onCancel: () => void;
  onConfirm: (cantidad: number) => void;
}

export default function ModalCompletado({ visible, parada, onCancel, onConfirm }: ModalCompletadoProps) {
  const [cantidad, setCantidad] = useState("");

  // Limpiar cantidad cuando se abre o cierra el modal
  useEffect(() => {
    if (!visible) setCantidad("");
  }, [visible]);

  const handleConfirm = () => {
    if (!cantidad.trim()) {
    alert("Por favor, indique la cantidad de bolsones.");
    return;
  }
   const numero = Number(cantidad);

  if (isNaN(numero) || numero <= 0) {
    alert("Ingrese una cantidad válida mayor a 0.");
    return;
  }

  onConfirm(numero);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {parada && (
            <>
              <Text style={styles.modalText}>
                Contribuyente: {parada.nombre} {parada.apellido}
              </Text>
              <Text style={styles.modalText}>N° bolsón: {parada.idusuario}</Text>

              <TextInput
                style={styles.input}
                placeholder="Indique la cantidad de bolsones recogidos"
                keyboardType="numeric"
                value={cantidad}
                onChangeText={setCantidad}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelarBtn]} onPress={onCancel}>
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    styles.guardarBtn,
                    !cantidad.trim() && { backgroundColor: "#ccc" } // cambia color si vacío
                  ]}
                  onPress={handleConfirm}
                  disabled={!cantidad.trim()}
                >
                  <Text style={styles.modalBtnText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "80%", backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalText: { fontSize: 16, marginBottom: 10, fontWeight: "bold" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 15 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalBtn: { flex: 1, padding: 10, borderRadius: 5, alignItems: "center", marginHorizontal: 5 },
  guardarBtn: { backgroundColor: "#007bff" },
  cancelarBtn: { backgroundColor: "#6c757d" },
  modalBtnText: { color: "#fff", fontWeight: "bold" },
});
