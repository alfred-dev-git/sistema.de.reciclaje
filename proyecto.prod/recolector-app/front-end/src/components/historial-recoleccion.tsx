import React from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Image } from "react-native";

interface Recoleccion {
  idpedidos: number;
  estado: number;
  fecha_entrega: string;
  total_puntos: number;
  calle: string;
  numero: string;
}

interface Props {
  historial: Recoleccion[];
}

const getEstadoInfo = (estado: number) => {
  switch (estado) {
    case 1:
      return { label: "Completado", color: "green" };
    case 2:
      return { label: "No estuvo", color: "red" };
    case 3:
      return { label: "Cancelado", color: "red" };
    default:
      return { label: "Desconocido", color: "gray" };
  }
};

const HistorialRecolecciones: React.FC<Props> = ({ historial }) => {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Recolecciones del Mes</Text>

        {historial.map((item) => {
          const { label, color } = getEstadoInfo(item.estado);
          return (
            <View key={item.idpedidos} style={styles.historialItem}>
              <Image
                source={require("../../assets/images/truck-icon.png")}
                style={styles.icon}
              />
              <View>
                <Text style={styles.fecha}>
                  {new Date(item.fecha_entrega).toLocaleDateString()}
                </Text>
                <Text style={styles.direccion}>
                  {item.calle} {item.numero}
                </Text>
                <Text
                  style={[
                    styles.puntos,
                    { color: item.total_puntos > 0 ? "green" : "black" },
                  ]}
                >
                  {item.total_puntos} puntos
                </Text>
                <Text style={[styles.estado, { color }]}>{label}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HistorialRecolecciones;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f8faed",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 15,
    marginTop: 10,
  },
  historialItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 10,
  },
  icon: { width: 40, height: 40, marginRight: 10 },
  fecha: { fontSize: 14, fontWeight: "bold", color: "#555" },
  direccion: { fontSize: 12, color: "#333" },
  puntos: { fontSize: 12, color: "green" },
  estado: { fontSize: 12, fontWeight: "bold" },
});
