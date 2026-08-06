import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import BackgorundContainer from "../../components/layout";
import HeaderRecolector from "../../components/headerComponent";
import { obtenerParadasAgrupadas, RutaCalculada } from "../../api/services/rutas-service";
import { getHistorial } from "../../api/services/historial-service";
import { getNotificacion } from "../../api/services/notificacion-service";
import Paginacion from "../../components/paginacion";

type Notificacion = {
  titulo: string;
  mensaje: string;
};

const HomeRecolector: React.FC = () => {
  const [rutas, setRutas] = useState<RutaCalculada[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paginaHistorial, setPaginaHistorial] = useState(1);

  const navigation = useNavigation<any>();

  const cargarDatos = async () => {
    try {
      setRefreshing(true);
      setErrorMessage(null);

      try {
        const rutasObtenidas = await obtenerParadasAgrupadas();
        setRutas(rutasObtenidas);
      } catch {
        setRutas([]);
        setErrorMessage("No se pudieron cargar las rutas. Deslizá para reintentar.");
      }

      const [historialRes, notificacionRes] = await Promise.all([
        getHistorial(),
        getNotificacion(),
      ]);
      if (historialRes.success) {
        setHistorial(Array.isArray(historialRes.data) ? historialRes.data : []);
        setPaginaHistorial(1);
      }

      if (notificacionRes.success && Array.isArray(notificacionRes.data)) {
        setNotificaciones(notificacionRes.data.slice(0, 1));
      }
    } catch (error) {
      console.warn("Error al cargar rutas/historial/notificación:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      cargarDatos();
    }, [])
  );

  const getEstadoInfo = (estado: string) => {
    const normalizado = String(estado ?? "").toLowerCase();
    if (normalizado === "completada") return { label: "Completada", color: "green" };
    if (normalizado === "ausente") return { label: "Ausente", color: "red" };
    return { label: estado || "Desconocido", color: "gray" };
  };

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
            <Text style={styles.puntos}>{item.cant_bolson} bolsones</Text>
            {!!item.observaciones && (
              <Text style={styles.observaciones}>{item.observaciones}</Text>
            )}
            <Text style={[styles.estado, { color }]}>{label}</Text>
          </View>
        </View>
      </View>
    );
  };

  const totalPaginasHistorial = Math.max(1, Math.ceil(historial.length / 3));
  const historialVisible = historial.slice(
    (paginaHistorial - 1) * 3,
    paginaHistorial * 3
  );

  return (
    <BackgorundContainer>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={cargarDatos} />
        }
      >
        <HeaderRecolector />

        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        {/* Bienvenida */}
        <View style={styles.bienvenidaContainer}>
          <Text style={styles.bienvenida}>Bienvenido Recolector 👋</Text>

          {notificaciones.length > 0 && (
            <View style={styles.notificacionContainer}>
              {notificaciones.map((n, idx) => (
                <View key={idx} style={styles.notificacionBox}>
                  <Text style={styles.notificacionTitulo}>Aviso!</Text>
                  <Text style={styles.notificacionMensaje} numberOfLines={0}>
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
          {rutas.length === 0 && (
            <Text style={styles.emptyText}>No tenés rutas En ruta asignadas.</Text>
          )}
          {rutas.map((ruta, index) => (
            <View key={index} style={styles.item}>
              <View style={{ flexDirection: "row" }}>
                <View style={styles.iconContainer}>
                  <Ionicons name="leaf" size={24} color="#307043" />
                </View>
                <View style={{ marginLeft: 15 }}>
                  <Text style={styles.infoTitle}>Ruta #{ruta.idRuta}</Text>
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

        {/* Historial */}
        <Text style={[styles.sectionTitle, { marginLeft: 15 }]}>
          Historial de recolecciones
        </Text>

        <FlatList
          data={historialVisible}
          keyExtractor={(item) => item.idsolicitud_recoleccion.toString()}
          renderItem={renderHistorialItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator
          scrollEnabled={false} // importante para que funcione bien dentro del ScrollView
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={30} color="#307043" />
              <Text style={styles.emptyCardTitle}>Sin recolecciones este mes</Text>
              <Text style={styles.emptyCardText}>
                Cuando completes una recolección, aparecerá en este espacio.
              </Text>
            </View>
          }
        />
        <Paginacion
          pagina={paginaHistorial}
          totalPaginas={totalPaginasHistorial}
          onChange={setPaginaHistorial}
        />
      </ScrollView>
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
  emptyText: { color: "#555", textAlign: "center", marginVertical: 12 },
  emptyCard: {
    backgroundColor: "#f4f8f1",
    borderWidth: 1,
    borderColor: "#d7e7d5",
    borderRadius: 16,
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 20,
    alignItems: "center",
  },
  emptyCardTitle: { color: "#234f31", fontSize: 16, fontWeight: "700", marginTop: 8 },
  emptyCardText: { color: "#52645a", textAlign: "center", marginTop: 4 },
  errorText: { color: "#b91c1c", textAlign: "center", marginHorizontal: 20 },
  observaciones: { fontSize: 11, color: "#555", maxWidth: 130 },
  estado: {
    fontSize: 12,
    fontWeight: "bold"
  },

  notificacionContainer: {
  marginTop: 10,
  alignItems: "center",
  justifyContent: "center",
  width: "90%",
  alignSelf: "center",
},
notificacionBox: {
  backgroundColor: "#eaf5ea",
  borderRadius: 12,
  paddingVertical: 8,
  paddingHorizontal: 15,
  marginBottom: 8,
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
},

notificacionTitulo: {
  fontSize: 14,
  fontWeight: "bold",
  color: "#307043",
  marginBottom: 2,
  textAlign: "center",
},

notificacionMensaje: {
  fontSize: 14,
  color: "#307043",
  textAlign: "center",
  flexWrap: "wrap",
  flexShrink: 1,
  width: "100%",
},
});
