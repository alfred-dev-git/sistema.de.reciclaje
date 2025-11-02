import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, } from "react-native";
import { getCurrentUser } from "@/services/api/auth";
import { getUserPhotoUrl, pickImageFromLibrary, uploadUserPhoto } from "@/services/api/user";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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


      <View style={styles.itemProfile}>
        <View><Ionicons name="accessibility-outline" size={30} color="gray" /></View>
        <View style={styles.ItemInfo}>
          <Text style={styles.itemTitulo} >DNI:</Text>
          <Text style={styles.itemSubtitulo} >{user?.nombre ?? "-"} {user?.apellido ?? "-"} </Text>
        </View>
      </View>
      <View style={styles.itemProfile}>
        <View>
          <Ionicons name="at-circle-outline" size={30} color="black" />
        </View>
        <View style={styles.ItemInfo}>
          <Text style={styles.itemTitulo} >Email: </Text>
          <Text style={styles.itemSubtitulo}>{user?.email ?? "-"}</Text>
        </View>
      </View>
      <View style={styles.itemProfile}>
        <View>
          <Ionicons name="call-outline" size={30} color="black" />
        </View>
        <View style={styles.ItemInfo}>
          <Text style={styles.itemTitulo}>Teléfono:</Text>
          <Text style={styles.itemSubtitulo}> {user?.telefono ?? "-"}</Text>
        </View>
      </View>
      <View style={styles.itemProfile}>
        <View>
          <Ionicons name="calendar-outline" size={30} color="black" />
        </View>
        <View style={styles.ItemInfo}>
          <Text style={styles.itemTitulo}>Fecha de nacimiento:</Text>
          <Text style={styles.itemSubtitulo}> {user?.fecha_nacimiento ?? "-"}</Text>
        </View>
      </View>

      {typeof user?.puntos === "number" ? (
        <View style={styles.itemProfile}>
          <View>
            <Ionicons name="star-outline" size={30} color="black" />
          </View>
          <View style={styles.ItemInfo}>
            <Text style={styles.itemTitulo}>Puntos:</Text>
            <Text style={styles.itemSubtitulo}>{user.puntos}</Text>
          </View>
        </View>
      ) : null}


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
  )
}

const styles = StyleSheet.create({
  container:
  {
    flex: 1,
    padding: 16,
    paddingBottom: 90
  },
  header: {
    alignItems: "center",
    marginBottom: 16
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee"
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f7a44"
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 42
  },
  editBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#1f7a44"
  },
  editBtnText: {
    color: "#fff",
    fontWeight: "700"
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16
  },
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 10
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: "#1f7a44",
    backgroundColor: "#fff"
  },
  btnFilled: {
    backgroundColor: "#1f7a44"
  },
  btnText: {
    fontWeight: "700"
  },
  btnTextOutline: {
    color: "#1f7a44"
  },
  btnTextFilled: {
    color: "#fff"
  },
  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  profileContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
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
