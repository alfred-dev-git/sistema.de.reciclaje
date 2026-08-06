import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, ScrollView, RefreshControl } from "react-native";
import { router } from "expo-router";
import { listNotificaciones, NotificacionItem } from "@/services/api/requests";

export default function HomeScreen() {
  const [notificacion, setNotificacion] = useState<NotificacionItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotificacion = useCallback(async () => {
    try {
      const items = await listNotificaciones();
      setNotificacion(items[0] ?? null);
    } catch (error) {
      console.log("Error cargando notificaciones", error);
    }
  }, []);

  useEffect(() => {
    fetchNotificacion();
  }, [fetchNotificacion]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotificacion();
    setRefreshing(false);
  }, [fetchNotificacion]);

  return (
    <ImageBackground
      source={require('../../src/assets/background/bg-dashboard1.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

      {/*CONTENEDOR SUPERIOR (bienvenida + notificación) */}
      <View style={styles.topContainer}>
        <Text style={styles.bienvenida}>Bienvenido 👋</Text>

        {notificacion && (
          <View style={styles.notificacionContainer}>
            <View style={styles.notificacionBox}>
              <Text style={styles.notificacionTitulo}>{notificacion.titulo}</Text>
              <Text style={styles.notificacionMensaje}>{notificacion.mensaje}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.middleContainer}>
        {/* LOGO */}
        <Image
          source={require('../../src/assets/logos/logo.png')}
          style={styles.logo}
        />

        <Text style={styles.title}>¡Hola!</Text>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push("/(app)/request/new")}
        >
          <Text style={styles.ctaText}>Solicitar recolección</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  /* CONTENEDOR SUPERIOR */
  topContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: "center",
  },
  middleContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 10, // Acerca el logo al mensaje
  },
  bienvenida: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000ff",
    marginBottom: 6, // Mucho más compacto
  },

  /* CONTENIDO CENTRAL */
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 90,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  cta: {
    backgroundColor: "#0a7",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },

  ctaText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  logo: {
    width: 240,
    height: 240,
    marginBottom: 10,
  },

  /* NOTIFICACIÓN */
  notificacionContainer: {
    marginTop: 5,
    alignItems: "center",
    width: "90%",
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
