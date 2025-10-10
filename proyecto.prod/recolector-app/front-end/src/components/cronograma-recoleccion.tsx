import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { getCronograma } from "../api/services/cronograma-service";

// Interfaz actualizada según tu backend
interface CronogramaItem {
  dia_semana: number;
  semana_mes: number; 
  hora_inicio: string;
  hora_fin: string;
  tipo_reciclable: string;
}

const CronogramaRecoleccion: React.FC = () => {
  const [cronograma, setCronograma] = useState<CronogramaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Funciones para traducir los valores numéricos
  const obtenerNombreDia = (dia: number) => {
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    return dias[dia - 1] || "Día inválido";
  };

  const obtenerNombreSemana = (semana: number) => {
    switch (semana) {
      case 1:
        return "Primera semana";
      case 2:
        return "Segunda semana";
      case 3:
        return "Tercera semana";
      case 4:
        return "Cuarta semana";
      default:
        return "Semana inválida";
    }
  };

  useEffect(() => {
    const fetchCronograma = async () => {
      try {
        const response = await getCronograma();

        if (response.success && Array.isArray(response.data)) {
          setCronograma(response.data);
        } else {
          Alert.alert("Aviso", response.message || "No se encontraron datos del cronograma");
        }
      } catch (error: any) {
        console.error("❌ Error al cargar cronograma:", error);
        Alert.alert("Error", "No se pudo cargar el cronograma, por favor intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchCronograma();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00AA88" />
        <Text>Cargando cronograma...</Text>
      </View>
    );
  }

  if (cronograma.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noData}>No hay días de recolección disponibles.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🗓 Frecuencias en el mes</Text>

      {cronograma.map((item, index) => (
        <TouchableOpacity key={`${item.dia_semana}-${item.semana_mes}-${index}`} style={styles.card}>
          <Text style={styles.day}>
            📅 {obtenerNombreSemana(item.semana_mes)} - {obtenerNombreDia(item.dia_semana)}
          </Text>
          <Text>🕒 {item.hora_inicio} - {item.hora_fin}</Text>
          <Text>♻️ Tipo reciclable: {item.tipo_reciclable}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#E9F9EF",
    padding: 12,
    borderRadius: 12,
    width: "90%",
    marginBottom: 10,
    elevation: 2,
  },
  day: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  noData: {
    fontSize: 16,
    color: "#666",
  },
});

export default CronogramaRecoleccion;
