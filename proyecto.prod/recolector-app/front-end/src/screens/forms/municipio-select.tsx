import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { getMunicipios, Municipio } from "../../api/services/perfil-service"; // 🔹 importa el service

interface ModalMunicipioProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (municipio: { id: number; descripcion: string }) => void;
}

export default function ModalMunicipio({ visible, onCancel, onConfirm }: ModalMunicipioProps) {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState<{ id: number; descripcion: string } | null>(null);

  useEffect(() => {
    if (visible) {
      cargarMunicipios();
    } else {
      setSeleccionado(null);
    }
  }, [visible]);

  const cargarMunicipios = async () => {
    setLoading(true);
    const res = await getMunicipios();
    if (res.success && res.data) {
      setMunicipios(res.data);
    } else {
      alert("Error al cargar municipios");
    }
    setLoading(false);
  };

  const handleConfirm = () => {
    if (!seleccionado) {
      alert("Por favor seleccione un municipio.");
      return;
    }
    onConfirm(seleccionado);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Seleccione su municipio</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />
          ) : (
            municipios.map((m) => (
              <TouchableOpacity
                key={m.idmunicipio}
                style={[
                  styles.option,
                  seleccionado?.id === m.idmunicipio && styles.optionSelected,
                ]}
                onPress={() =>
                  setSeleccionado({ id: m.idmunicipio, descripcion: m.descripcion })
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    seleccionado?.id === m.idmunicipio && { color: "#fff" },
                  ]}
                >
                  {m.descripcion}
                </Text>
              </TouchableOpacity>
            ))
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.cancelarBtn]}
              onPress={onCancel}
            >
              <Text style={styles.modalBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalBtn,
                styles.guardarBtn,
                !seleccionado && { backgroundColor: "#ccc" },
              ]}
              onPress={handleConfirm}
              disabled={!seleccionado}
            >
              <Text style={styles.modalBtnText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  option: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  optionSelected: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  optionText: {
    color: "#333",
    textAlign: "center",
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  guardarBtn: { backgroundColor: "#007bff" },
  cancelarBtn: { backgroundColor: "#6c757d" },
  modalBtnText: { color: "#fff", fontWeight: "bold" },
});
