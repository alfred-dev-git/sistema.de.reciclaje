import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { getPerfil, updateFotoPerfil, Perfil } from "../../api/services/perfil-service";
import { useImagePicker } from "../../utils/imag-picker";

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
        setImageError(false); // 👈 reseteamos error si había
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
    <ScrollView style={styles.scrollContainer}>
      <TouchableOpacity onPress={handleChangePhoto} disabled={updatingPhoto}>
            <Image
            source={
                !imageError && perfil.foto_perfil
                ? { uri: perfil.foto_perfil }
                : require("../../../assets/images/perfildefault.png")
            }
            style={styles.profileImage}
            onError={() => {
                if (!imageError) {
                setImageError(true);
                Alert.alert("⚠️ Aviso", "No se pudo cargar la imagen, pruebe cambiarla.");
                }
            }}
            />

        <Text style={styles.changePhotoText}>
          {updatingPhoto ? "Actualizando..." : "Cambiar foto"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.nombre}>
        {perfil.nombre} {perfil.apellido}
      </Text>
      <Text>DNI: {perfil.DNI}</Text>
      <Text>Email: {perfil.email}</Text>
      <Text>Teléfono: {perfil.telefono}</Text>
      <Text>Fecha de nacimiento: {perfil.fecha_nacimiento}</Text>
      <Text>Municipio: {perfil.municipio}</Text>
      <Text>Puntos: {perfil.puntos}</Text>
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
  nombre: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 8,
    backgroundColor: "#f0f0f0", // 👈 evita el fondo negro al fallar
  },
  changePhotoText: {
    textAlign: "center",
    color: "#00BFA6",
    marginBottom: 16,
  },
});
