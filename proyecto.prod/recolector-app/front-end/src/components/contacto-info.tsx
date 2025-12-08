import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getContactosAdmin } from "../api/services/contactos-service";
import HeaderRecolector from "./headerComponent";
import BackgorundContainer from "./layout";
import { Ionicons } from "@expo/vector-icons";

// Interfaz del backend SIN idusuario
interface ContactoAdmin {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol_idrol: number;
}

const ContactosAdministradores: React.FC = () => {
  const [contactos, setContactos] = useState<ContactoAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactos = async () => {
      try {
        const response = await getContactosAdmin();

        if (response.success && Array.isArray(response.data)) {
          setContactos(response.data);
        } else {
          Alert.alert("Aviso", response.message || "No se encontraron contactos");
        }
      } catch (error) {
        console.error("❌ Error al cargar contactos:", error);
        Alert.alert("Error", "No se pudo cargar los contactos.");
      } finally {
        setLoading(false);
      }
    };

    fetchContactos();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00AA88" />
        <Text>Cargando contactos...</Text>
      </View>
    );
  }

  if (contactos.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noData}>No se encontraron administradores para tu municipio.</Text>
      </View>
    );
  }

  return (
    <BackgorundContainer>
      <ScrollView>
        <HeaderRecolector />

        <View style={styles.container}>
          <Text style={styles.title}>📞 Contactos con admins</Text>

          {contactos.map((admin) => (
            <TouchableOpacity key={admin.email} style={styles.card}>
              <Ionicons name="person-circle-outline" size={40} color="#1f7a44" />

              <View style={{ gap: 6 }}>
                <Text style={styles.name}>
                  {admin.nombre} {admin.apellido}
                </Text>

                <Text>📧 {admin.email}</Text>
                <Text>📱 {admin.telefono}</Text>

                <Text style={styles.rol}>
                  {admin.rol_idrol === 1
                    ? "👤 Contacto con soporte técnico"
                    : "📞 Supervisor a cargo"}
                </Text>

              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </BackgorundContainer>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 16 },
  noData: { fontSize: 16, color: "#666" },

  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    width: "90%",
    marginBottom: 12,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  name: { fontSize: 17, fontWeight: "bold" },
  rol: { fontSize: 13, color: "#555" },
});

export default ContactosAdministradores;
