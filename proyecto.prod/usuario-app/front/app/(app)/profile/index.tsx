import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { getCurrentUser } from "@/services/api/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

function initialsFrom(name?: string, last?: string) {
  const first = (name?.trim()?.[0] ?? "").toUpperCase();
  return first || "U";
}

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);
    })();
  }, []);

  const initials = initialsFrom(user?.nombre, user?.apellido);

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.header}>
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      {/* DNI / Nombre */}
      <View style={styles.itemProfile}>
        <Ionicons name="id-card-outline" size={30} color="gray" />
        <View style={styles.ItemInfo}>
          <Text style={styles.itemTitulo}>DNI:</Text>
          <Text style={styles.itemSubtitulo}>{user?.DNI ?? "-"}</Text>
        </View>
      </View>

      {/* Nombre completo */}
      <View style={styles.itemProfile}>
        <Ionicons name="person-outline" size={30} color="black" />
        <View style={styles.ItemInfo}>
          <Text style={styles.itemTitulo}>Nombre:</Text>
          <Text style={styles.itemSubtitulo}>
            {user?.nombre ?? "-"} {user?.apellido ?? "-"}
          </Text>
        </View>
      </View>

      {/* Email */}
      <View style={styles.itemProfile}>
        <Ionicons name="at-circle-outline" size={30} color="black" />
        <View style={styles.ItemInfo}>
          <Text style={styles.itemTitulo}>Email:</Text>
          <Text style={styles.itemSubtitulo}>{user?.email ?? "-"}</Text>
        </View>
      </View>

      {/* Teléfono */}
      <View style={styles.itemProfile}>
        <Ionicons name="call-outline" size={30} color="black" />
        <View style={styles.ItemInfo}>
          <Text style={styles.itemTitulo}>Teléfono:</Text>
          <Text style={styles.itemSubtitulo}>{user?.telefono ?? "-"}</Text>
        </View>
      </View>

      {/* Fecha de nacimiento */}
      <View style={styles.itemProfile}>
        <Ionicons name="calendar-outline" size={30} color="black" />
        <View style={styles.ItemInfo}>
          <Text style={styles.itemTitulo}>Fecha de nacimiento:</Text>
          <Text style={styles.itemSubtitulo}>
            {user?.fecha_nacimiento ?? "-"}
          </Text>
        </View>
      </View>

      {/* Puntos */}
      {typeof user?.puntos === "number" && (
        <View style={styles.itemProfile}>
          <Ionicons name="star-outline" size={30} color="black" />
          <View style={styles.ItemInfo}>
            <Text style={styles.itemTitulo}>Puntos:</Text>
            <Text style={styles.itemSubtitulo}>{user.puntos}</Text>
          </View>
        </View>
      )}

      {/* Botones */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnOutline]}
          onPress={() => router.push("/(app)/profile/edit")}
        >
          <Text style={[styles.btnText, styles.btnTextOutline]}>
            Editar datos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnFilled]}
          onPress={() => router.push("/(app)/addresses/new")}
        >
          <Text style={[styles.btnText, styles.btnTextFilled]}>
            Agregar dirección
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 90,
  },

  header: {
    alignItems: "center",
    marginBottom: 16,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarFallback: {
    backgroundColor: "#1f7a44",
  },

  avatarText: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
  },

  itemProfile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },

  ItemInfo: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "85%",
  },

  itemTitulo: {
    fontSize: 13,
    color: "#666",
  },

  itemSubtitulo: {
    fontSize: 18,
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  btn: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },

  btnOutline: {
    borderWidth: 2,
    borderColor: "#1f7a44",
    backgroundColor: "#fff",
  },

  btnFilled: {
    backgroundColor: "#1f7a44",
  },

  btnText: {
    fontWeight: "700",
  },

  btnTextOutline: {
    color: "#1f7a44",
  },

  btnTextFilled: {
    color: "#fff",
  },
});
