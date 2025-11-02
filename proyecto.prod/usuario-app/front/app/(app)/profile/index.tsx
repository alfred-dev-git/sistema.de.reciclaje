import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { getCurrentUser } from "@/services/api/auth";
import { getUserPhotoUrl, pickImageFromLibrary, uploadUserPhoto } from "@/services/api/user";
import { router } from "expo-router";


function initialsFrom(name?: string, last?: string) {
  const a = (name?.trim()?.[0] ?? "").toUpperCase();
  const b = (last?.trim()?.[0] ?? "").toUpperCase();
  const res = (a + b).trim();
  return res || "U";
}

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);
      if (u) setPhotoUri(getUserPhotoUrl(u.id));
    })();
  }, []);

  const onChangePhoto = async () => {
    if (!user) return;
    const asset = await pickImageFromLibrary();
    if (!asset) return;
    await uploadUserPhoto(user.id, asset);
    setPhotoUri(`${getUserPhotoUrl(user.id)}`);
  };

  const initials = initialsFrom(user?.nombre, user?.apellido);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        <TouchableOpacity onPress={onChangePhoto} style={styles.editBtn}>
          <Text style={styles.editBtnText}>Cambiar foto</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.row}><Text style={styles.label}>Nombre:</Text> {user?.nombre ?? "-"}</Text>
        <Text style={styles.row}><Text style={styles.label}>Apellido:</Text> {user?.apellido ?? "-"}</Text>
        <Text style={styles.row}><Text style={styles.label}>Email:</Text> {user?.email ?? "-"}</Text>
        <Text style={styles.row}><Text style={styles.label}>Teléfono:</Text> {user?.telefono ?? "-"}</Text>
        <Text style={styles.row}><Text style={styles.label}>Fecha de nacimiento:</Text> {user?.fecha_nacimiento ?? "-"}</Text>
        <Text style={styles.row}><Text style={styles.label}>Sexo:</Text> {user?.sexo ?? "-"}</Text>
        {typeof user?.puntos === "number" ? (
          <Text style={styles.row}><Text style={styles.label}>Puntos:</Text> {user.puntos}</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => { router.push("/(app)/profile/edit") }}>
          <Text style={[styles.btnText, styles.btnTextOutline]}>Editar datos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnFilled]}
          onPress={() => router.push("/(app)/addresses/new")}
        >
          <Text style={[styles.btnText, styles.btnTextFilled]}>Agregar dirección</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingBottom: 90 },
  header: { alignItems: "center", marginBottom: 16 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#eee" },
  avatarFallback: { alignItems: "center", justifyContent: "center", backgroundColor: "#1f7a44" },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 42 },
  editBtn: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: "#1f7a44" },
  editBtnText: { color: "#fff", fontWeight: "700" },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 14, gap: 6 },
  row: { fontSize: 16 },
  label: { fontWeight: "700" },
  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
  btn: { flex: 1, alignItems: "center", justifyContent: "center", height: 44, borderRadius: 10 },
  btnOutline: { borderWidth: 2, borderColor: "#1f7a44", backgroundColor: "#fff" },
  btnFilled: { backgroundColor: "#1f7a44" },
  btnText: { fontWeight: "700" },
  btnTextOutline: { color: "#1f7a44" },
  btnTextFilled: { color: "#fff" },
});
