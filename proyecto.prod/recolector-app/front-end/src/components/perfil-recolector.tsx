import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { getPerfil, updateFotoPerfil, Perfil } from "../api/services/perfil-service";
import { useImagePicker } from "../utils/imag-picker"
import HeaderRecolector from "./headerComponent";
import { Ionicons } from "@expo/vector-icons";
import { navigate } from "../navigation/refglobal-navigation";

export default function PerfilScreen() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPhoto, setUpdatingPhoto] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { pickImageFromLibrary } = useImagePicker();

  // Obtener perfil al montar
  useEffect(() => {
    const fetchPerfil = async () => {
      const result = await getPerfil();
      if (result.success && result.data) {
        setPerfil(result.data);
      } else {
        console.warn("⚠️ No se encontró perfil válido");
      }
      setLoading(false);
    };

    fetchPerfil();
  }, []);

  // Función para actualizar la foto
  const handleChangePhoto = async () => {
    const asset = await pickImageFromLibrary();
    if (!asset) return;

    try {
      setUpdatingPhoto(true);
      const result = await updateFotoPerfil(asset);
      if (result.success && result.data) {
        setPerfil((prev) => (prev ? { ...prev, foto_perfil: result.data } : null));
        setImageError(false);
        Alert.alert("✅ Ruta de imagen guardada correctamente");
      } else {
        Alert.alert("❌ Error", result.message);
      }
    } finally {
      setUpdatingPhoto(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00BFA6" />
      </View>
    );
  }

  if (!perfil) {
    return (
      <View style={styles.centered}>
        <Text>No se pudo cargar el perfil.</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <HeaderRecolector />
      <View style={styles.scrollContainer}>
        <Text style={styles.titulo} >Mi Perfil</Text>
        <View style={styles.profileContainer}>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Image
              source={
                !imageError && perfil.foto_perfil
                  ? { uri: perfil.foto_perfil }
                  : require("../../assets/images/perfildefault.png")
              }
              style={styles.profileImage}
              onError={() => {
                if (!imageError) {
                  setImageError(true);
                  Alert.alert("⚠️ Aviso", "No se pudo cargar la imagen, pruebe cambiarla.");
                }
              }}
            />
          </View>
          <View>
            <Text style={styles.nombre}>
              {perfil.nombre} {perfil.apellido}
            </Text>
            <TouchableOpacity onPress={handleChangePhoto} disabled={updatingPhoto}>
              <Text style={styles.changePhotoText}>
                {updatingPhoto ? "Actualizando..." : "Cambiar foto"}
              </Text>
            </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigate("Editar", { perfil })}
          >
            <Text style={styles.changePhotoText}>Editar información</Text>
          </TouchableOpacity>

          </View>
        </View>
        <View style={styles.itemProfile}>
          <View><Ionicons name="accessibility-outline" size={30} color="gray" /></View>
          <View style={styles.ItemInfo}>
            <Text style={styles.itemTitulo} >DNI:</Text>
            <Text style={styles.itemSubtitulo} >{perfil.DNI}</Text>
          </View>
        </View>
        <View style={styles.itemProfile}>
          <View>
            <Ionicons name="at-circle-outline" size={30} color="black" />
          </View>
          <View style={styles.ItemInfo}>
            <Text style={styles.itemTitulo} >Email: </Text>
            <Text style={styles.itemSubtitulo}>{perfil.email}</Text>
          </View>
        </View>
        <View style={styles.itemProfile}>
          <View>
            <Ionicons name="call-outline" size={30} color="black" />
          </View>
          <View style={styles.ItemInfo}>
            <Text style={styles.itemTitulo}>Teléfono:</Text>
            <Text style={styles.itemSubtitulo}>{perfil.telefono}</Text>
          </View>
        </View>
        <View style={styles.itemProfile}>
          <View>
            <Ionicons name="calendar-outline" size={30} color="black" />
          </View>
          <View style={styles.ItemInfo}>
            <Text style={styles.itemTitulo}>Fecha de nacimiento:</Text>
            <Text style={styles.itemSubtitulo}>{perfil.fecha_nacimiento}</Text>
          </View>
        </View>
        <View style={styles.itemProfile}>
          <View>
            <Ionicons name="location-outline" size={30} color="black" />
          </View>
          <View style={styles.ItemInfo}>
            <Text style={styles.itemTitulo}>Municipio:</Text>
            <Text style={styles.itemSubtitulo}>{perfil.municipio}</Text>
          </View>
        </View>
        <View style={styles.itemProfile}>
          <View>
            <Ionicons name="star-outline" size={30} color="black" />
          </View>
          <View style={styles.ItemInfo}>
            <Text style={styles.itemTitulo}>Puntos:</Text>
            <Text style={styles.itemSubtitulo}>{perfil.puntos}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    padding: 16,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  nombre: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  profileContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    marginRight: 18,
    marginLeft: 8,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  changePhotoText: {
    color: "#307043",
    fontSize: 16,
    marginTop: 5,
  },
  itemProfile: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12
  },
  itemTitulo: {
    fontSize: 13,
    color: "#666",
    fontWeight: "medium",
  },
  itemSubtitulo: {
    fontSize: 19,
    fontWeight: "medium",
  },
  ItemInfo: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%"
  }
});
