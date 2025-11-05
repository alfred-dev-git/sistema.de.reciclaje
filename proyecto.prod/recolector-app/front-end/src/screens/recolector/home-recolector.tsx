import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import BackgorundContainer from "../../components/layout";

import HeaderRecolector from "../../components/headerComponent";
import {
  obtenerParadasAgrupadas,
  RutaCalculada,
} from "../../api/services/paradas-service";
import { getHistorial } from "../../api/services/historial-service";
import { getNotificacion } from "../../api/services/notificacion-service";

type Notificacion = {
  titulo: string;
  mensaje: string;
};

const HomeRecolector: React.FC = () => {
  const [rutas, setRutas] = useState<RutaCalculada[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  useFocusEffect(
    React.useCallback(() => {
      const cargarDatos = async () => {
        try {
          if (route.params?.rutasActualizadas) {
            setRutas(route.params.rutasActualizadas);
            navigation.setParams({ rutasActualizadas: undefined });
          } else {
            const rutasObtenidas = await obtenerParadasAgrupadas();
            setRutas(rutasObtenidas);
          }

          const historialRes = await getHistorial();
          if (historialRes.success) setHistorial(historialRes.data);

          const notificacionRes = await getNotificacion();
          if (notificacionRes.success && Array.isArray(notificacionRes.data)) {
            setNotificaciones(notificacionRes.data);
          }
        } catch (error) {
          console.warn("Error al cargar rutas/historial/notificación:", error);
        }
      };
      cargarDatos();
    }, [route.params?.rutasActualizadas, navigation])
  );

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

  const renderHeader = () => (
    <View>
      <HeaderRecolector />
      {/* Bienvenida */}
      <View style={styles.bienvenidaContainer}>
        <Text style={styles.bienvenida}>Bienvenido Recolector 👋</Text>

        {notificaciones.length > 0 && (
          <View style={{ marginTop: 5 }}>
            {notificaciones.map((n, idx) => (
              <View
                key={idx}
                style={{ marginBottom: 4, flexDirection: "row", flexWrap: "wrap" }}
              >
                <Text style={styles.notificacion}>Aviso! {n.titulo}:</Text>
                <Text
                  style={[
                    styles.notificacion,
                    { fontWeight: "bold", marginLeft: 4 },
                  ]}
                >
                  {n.mensaje}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Rutas */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Rutas Asignadas</Text>
        {rutas.map((ruta, index) => (
          <View key={index} style={styles.item}>
            <View style={{ flexDirection: "row" }}>
              <View style={styles.iconContainer}>
                <Ionicons name="leaf" size={24} color="#307043" />
              </View>
              <View style={{ marginLeft: 15 }}>
                <Text style={styles.infoTitle}>Recorrido {index + 1}</Text>
                <Text style={styles.infoSubtitle}>
                  {ruta.paradas.length} Paradas asignadas
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.botonVer}
              onPress={() =>
                navigation.navigate("RutaAsignada", {
                  rutaSeleccionada: index,
                  rutas,
                })
              }
            >
              <Ionicons name="eye" size={10} color="green" />
              <Text style={styles.botonTexto}>Ver</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Historial título */}
      <Text style={[styles.sectionTitle, { marginLeft: 15 }]}>
        Recolecciones del Mes
      </Text>
    </View>
  );

  const renderHistorialItem = ({ item }: any) => {
    const { label, color } = getEstadoInfo(item.estado);
    return (
      <View style={styles.historialItem}>
        <Image
          source={require("../../../assets/images/truck-icon.png")}
          style={styles.icon}
        />
        <View style={styles.historialInfo}>
          <View>
            <Text style={styles.fecha}>
              {new Date(item.fecha_entrega).toLocaleDateString()}
            </Text>
            <Text style={styles.direccion}>
              {item.calle} {item.numero}
            </Text>
          </View>
          <View>
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
      </View>
    );
  };

  return (
    <BackgorundContainer>
      <View style={{ flex: 1 }}>
        {renderHeader()}
        <View style={{ flex: 1, maxHeight: 350 }}>
          <FlatList
            data={historial}
            keyExtractor={(item) => item.idpedidos.toString()}
            renderItem={renderHistorialItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator
          />
        </View>
      </View>
    </BackgorundContainer>
  );
};

export default HomeRecolector;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f8faed"
  },
  header: {
    flexDirection: "row",
    paddingTop: 40, paddingBottom: 15,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "green",
    borderRadius: 20,
    backgroundColor: "transparent"
  },
  headerItem: {
    padding: 10,
    borderRadius: 100,
    backgroundColor: "#307043"
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  logo: {
    width: 220,
    height: 90,
    resizeMode: "contain"
  },
  bienvenidaContainer: {
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  },
  bienvenida: {
    fontSize: 18,
    fontWeight: "bold"
  },
  card: {
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#307043",
    padding: 18,
    marginBottom: 8,
    borderRadius: 25
  },
  iconContainer: {
    backgroundColor: "#f1f3e6",
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff"
  },
  infoSubtitle: {
    fontSize: 13,
    color: "#ffffff"
  },
  botonVer: {
    backgroundColor: "#f1f3e6",
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center"
  },
  botonTexto: {
    color: "#307043",
    fontWeight: "bold"
  },

  historialItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 18,
  },
  historialInfo: {
    marginLeft: 6,
    borderLeftWidth: 1,
    borderLeftColor: "#ccc",
    paddingLeft: 10, flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 10
  },
  fecha: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555"
  },
  direccion: {
    fontSize: 12,
    color: "#333"
  },
  puntos: {
    fontSize: 12,
    color: "green"
  },
  estado: {
    fontSize: 12,
    fontWeight: "bold"
  },
  notificacion: {
    fontSize: 14,
    color: "#307043",
    marginTop: 5,
    textAlign: "center",
  },
});
