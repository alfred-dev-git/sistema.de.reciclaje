import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface ModalVerificacionProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  datos: {
    email: string;
    nombre: string;
    password: string;
    apellido: string;
    telefono: string;
    fecha: string;
    municipioId?: number;
    municipioDesc: string;
    dni: string; 
  };
}


const ModalVerificacion: React.FC<ModalVerificacionProps> = ({
  visible,
  onClose,
  onConfirm,
  datos,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            Por favor verifique que sus datos sean correctos
          </Text>

          <View style={styles.dataContainer}>
            <Text style={styles.dataText}> MUNICIPIO: {datos.municipioDesc}</Text>
            <Text style={styles.dataText}>📧 Correo: {datos.email}</Text>
            <Text style={styles.dataText}>CONTRASEÑA: {datos.password}</Text>
            <Text style={styles.dataText}>👤 Nombre y Apellido: {datos.nombre}, {datos.apellido}</Text>
            <Text style={styles.dataText}>🪪 DNI: {datos.dni}</Text>
            <Text style={styles.dataText}>📞 Teléfono: {datos.telefono}</Text>
            <Text style={styles.dataText}>🎂 Fecha: {datos.fecha}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onConfirm}>
            <Text style={styles.buttonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ModalVerificacion;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  dataContainer: {
    width: "100%",
    marginBottom: 20,
  },
  dataText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#2e7040",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
