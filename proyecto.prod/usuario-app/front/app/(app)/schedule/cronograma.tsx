import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from "react-native";
import { listCronograma } from "@/services/api/requests";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";


interface CronogramaItem {
  id: number;
  dia_semana: number;
  semana_mes: number;
  hora_inicio: string;
  hora_fin: string;
  tipo_reciclable: string;
}

const CronogramaRecoleccion: React.FC = () => {
  const [cronograma, setCronograma] = useState<CronogramaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>("todos");

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
        const data = await listCronograma();
        setCronograma(data);
      } catch (error) {
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
        <Text>Cargando frecuencias...</Text>
      </View>
    );
  }

  const tiposReciclables = [...new Set(cronograma.map((item) => item.tipo_reciclable))]
    .sort((a, b) => a.localeCompare(b));

  const datosFiltrados = cronograma.filter((item) =>
    (semanaSeleccionada === null || item.semana_mes === semanaSeleccionada)
    && (tipoSeleccionado === "todos" || item.tipo_reciclable === tipoSeleccionado)
  );

  if (cronograma.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noData}>No hay frecuencias de recolección disponibles.</Text>
      </View>
    );
  }

  return (
    <ImageBackground

      source={require("@/assets/background/bg-dashboard1.png")}
      style={styles.background}
      resizeMode="cover">
      <View style={styles.container}>
        <Text style={styles.title}>🗓 Frecuencia de Recolección</Text>

        <View style={styles.typePickerWrap}>
          <Picker
            selectedValue={tipoSeleccionado}
            onValueChange={(value) => setTipoSeleccionado(String(value))}
          >
            <Picker.Item label="Todos los reciclables" value="todos" />
            {tiposReciclables.map((tipo) => (
              <Picker.Item key={tipo} label={tipo} value={tipo} />
            ))}
          </Picker>
        </View>

        {/* Filtro por semana */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              semanaSeleccionada === null && styles.filterActive,
            ]}
            onPress={() => setSemanaSeleccionada(null)}
          >
            <Text style={[styles.filterText, semanaSeleccionada === null && styles.filterTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>

          {[1, 2, 3, 4].map((semana) => (
            <TouchableOpacity
              key={semana}
              style={[
                styles.filterButton,
                semanaSeleccionada === semana && styles.filterActive,
              ]}
              onPress={() => setSemanaSeleccionada(semana)}
            >
              <Text
                style={[
                  styles.filterText,
                  semanaSeleccionada === semana && styles.filterTextActive,
                ]}
              >
                {obtenerNombreSemana(semana)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista del cronograma */}
        {datosFiltrados.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <Ionicons name="bicycle" size={34} color="#55b947" />
            <View style={{ gap: 6 }}>
              <Text style={styles.day}>
                📅 {obtenerNombreSemana(item.semana_mes)} - {obtenerNombreDia(item.dia_semana)}
              </Text>
              <Text>🕒 {item.hora_inicio} - {item.hora_fin}</Text>
              <Text>♻️ Tipo reciclable: {item.tipo_reciclable}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {datosFiltrados.length === 0 && (
          <Text style={{ color: "#555", marginTop: 20 }}>
            No hay frecuencias para los filtros seleccionados.
          </Text>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  container: {
    padding: 16,
    alignItems: "center",
  },
  noData: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1f7a44",
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  typePickerWrap: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 12,
  },
  filterButton: {
    backgroundColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  filterActive: {
    backgroundColor: "#1f7a44",
  },
  filterText: {
    color: "#000",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    width: "90%",
    marginBottom: 10,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  day: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CronogramaRecoleccion;
