import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";
import MapaRutas from "../../components/mapa-rutas";
import ModalCompletado from "../../components/modal-completado";
import AlertNoEstuvo from "../../components/alert-ausente";
import { RutaCalculada } from "../../api/services/rutas-service";
import { marcarCompletado } from "../../api/services/recoleccion-service";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

export default function RutaAsignada({ route }: any) {
  const { rutas: rutasProp = [], rutaSeleccionada = 0 } = route.params ?? {};
  const [rutas, setRutas] = useState<RutaCalculada[]>(rutasProp);
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [paradaSeleccionada, setParadaSeleccionada] = useState<any>(null);

  const mapRef = useRef<any>(null);
  const ruta = rutas[rutaSeleccionada];

  // --- BOTÓN COMPLETADO ---
  const handleCompletado = (item: any) => {
    setParadaSeleccionada(item);
    setModalVisible(true);
  };

  const confirmarCompletado = async (cantidad: number) => {
    if (!paradaSeleccionada) return;
    try {
      const response = await marcarCompletado({
        idsolicitud_recoleccion: paradaSeleccionada.idsolicitud_recoleccion,
        cant_bolson: cantidad,
      });
      if (!response.success) {
        throw new Error(response.message);
      }

      // Actualizar estado local
      const updatedRutas = rutas.map((rutaItem, idx) =>
        idx === rutaSeleccionada
          ? {
            ...rutaItem,
            paradas: rutaItem.paradas.map((p) =>
              p.idsolicitud_recoleccion === paradaSeleccionada.idsolicitud_recoleccion
                ? { ...p, estado: "Completada" }
                : p
            ),
          }
          : rutaItem
      );

      setRutas(updatedRutas);
      navigation.setParams({ rutasActualizadas: updatedRutas });

      // Opcional: centrar mapa en la parada actual
      const parada = updatedRutas[rutaSeleccionada].paradas.find(
        (p) => p.idsolicitud_recoleccion === paradaSeleccionada.idsolicitud_recoleccion
      );
      if (parada) {
        mapRef.current?.animateToRegion({
          latitude: parada.latitude,
          longitude: parada.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo completar la recolección");
    } finally {
      setModalVisible(false);
    }
  };

  // --- BOTÓN NO ESTUVO ---
  const handleNoEstuvo = (item: any) => {
    AlertNoEstuvo(item, rutaSeleccionada, setRutas);
  };

  if (!ruta) {
    return (
      <View style={styles.containerVacio}>
        <Text>La ruta ya no está disponible.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mapa */}
      <View style={styles.mapaContainer}>
        <MapaRutas
          rutas={rutas}
          rutaSeleccionada={rutaSeleccionada}
          onToggleEstado={(paradaIndex) => {
            // opcional: si quieres hacer algo al tocar el marker
          }}
        />
      </View>

      {/* Lista de paradas */}
      <View style={styles.listaContainer}>
        <FlatList
          data={ruta.paradas}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.calle}>
                {item.calle} {item.numero}
              </Text>
              {/* Icono de check si la parada está completada */}
              {item.estado?.toLowerCase() === "completada" && (
                <Ionicons name="checkmark-circle" size={24} color="green" style={{ marginLeft: 8 }} />
              )}
              {item.estado?.toLowerCase() === "ausente" && (
                <Ionicons name="close-circle" size={24} color="red" style={{ marginLeft: 8 }} />
              )}
              {/* Mostrar botones solo si la parada está pendiente */}
              {item.estado?.toLowerCase() === "en ruta" && (
                <>
                  <TouchableOpacity
                    style={[styles.boton, styles.noEstuvo]}
                    onPress={() => handleNoEstuvo(item)}
                  >
                    <Text style={styles.textoBoton}>No estuvo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.boton, styles.completado]}
                    onPress={() => handleCompletado(item)}
                  >
                    <Text style={styles.textoBoton}>Completado</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        />
      </View>

      {/* Modal de completado */}
      <ModalCompletado
        visible={modalVisible}
        parada={paradaSeleccionada}
        onCancel={() => setModalVisible(false)}
        onConfirm={confirmarCompletado}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerVacio: { flex: 1, alignItems: "center", justifyContent: "center" },
  mapaContainer: { flex: 1 },
  listaContainer: { flex: 1 },
  lista: { padding: 10, backgroundColor: "#f8faed" },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffffff",
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
  },
  calle: { fontSize: 14, flex: 1 },
  boton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 5, marginLeft: 5 },
  completado: { backgroundColor: "#307043" },
  noEstuvo: { backgroundColor: "#c21d1dff" },
  textoBoton: { color: "#fff", fontWeight: "bold" },
});
