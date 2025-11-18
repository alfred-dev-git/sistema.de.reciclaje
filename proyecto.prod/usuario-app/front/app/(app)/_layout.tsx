// app/(app)/_layout.tsx
import { Drawer } from "expo-router/drawer";
import { useEffect, useState } from "react";
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Platform,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
  DrawerItem,
} from "@react-navigation/drawer";
import { router } from "expo-router";
import { getCurrentUser, logout as logoutApi } from "@/services/api/auth";
import { getUserPhotoUrl, pickImageFromLibrary, uploadUserPhoto } from "@/services/api/user";

function initialsFrom(name?: string, last?: string) {
  const a = (name?.trim()?.[0] ?? "").toUpperCase();
  const b = (last?.trim()?.[0] ?? "").toUpperCase();
  const res = (a + b).trim();
  return res || "U";
}

function Avatar({ uri, initials }: { uri?: string | null; initials: string }) {
  if (uri) return <Image source={{ uri }} style={styles.avatar} />;
  return (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}
export default function AppLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: "#1f7a44", // verde principal
        drawerInactiveTintColor: "#333",
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "500",
        },
        drawerStyle: {
          backgroundColor: "#fff",
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
          width: 270,
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="home" options={{ title: "Inicio" }} />
      <Drawer.Screen name="request/new" options={{ title: "Solicitar recolección" }} />
      <Drawer.Screen name="history/index" options={{ title: "Historial" }} />
      <Drawer.Screen name="schedule/cronograma" options={{ title: "Cronograma", drawerLabel: "Cronograma" }} />
      <Drawer.Screen name="profile/index" options={{ title: "Perfil" }} />
      <Drawer.Screen
        name="profile/edit"
        options={{ title: "Editar perfil", drawerItemStyle: { display: "none" } }}
      />
      <Drawer.Screen
        name="history/detalle"
        options={{ drawerItemStyle: { display: "none" } }}
      />
      <Drawer.Screen
        name="addresses/new"
        options={{ title: "Agregar dirección", drawerItemStyle: { display: "none" } }}
      />
    </Drawer>

  );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const [user, setUser] = useState<any>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);
      if (u) setPhotoUri(getUserPhotoUrl(u.id));
    })();
  }, []);

  const onEditPhoto = async () => {
    if (!user) return;
    const asset = await pickImageFromLibrary();
    if (!asset) return;
    await uploadUserPhoto(user.id, asset);
    setPhotoUri(`${getUserPhotoUrl(user.id)}`); // cache-busting
  };

  const onLogout = async () => {
    try {
      await logoutApi();
    } finally {
      props.navigation.closeDrawer();
      router.replace("/(auth)/login");
    }
  };

  const initials = initialsFrom(user?.nombre, user?.apellido);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View style={{ width: 80, height: 80 }}>
          <Avatar uri={photoUri} initials={initials} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user ? `${user.nombre} ${user.apellido}` : "Usuario"}</Text>
          <Text style={styles.email}>{user?.email ?? ""}</Text>
          {typeof user?.puntos === "number" ? <Text style={styles.points}>Puntos: {user.puntos}</Text> : null}
        </View>
      </View>

      <DrawerItemList {...props} />

      <View style={styles.footer}>
        <DrawerItem label="Cerrar sesión" onPress={onLogout} labelStyle={{ color: "#d00", fontWeight: "600" }} />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: Platform.select({ ios: 20, android: 0 }),
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eee",
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f7a44",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 28,
  },
  editBtn: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1f7a44",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  editBtnText: { color: "#fff", fontWeight: "bold" },
  userInfo: { marginLeft: 12, flex: 1 },
  name: { fontSize: 18, fontWeight: "700", color: "#1f7a44" },
  email: { color: "#666", marginTop: 2 },
  points: { color: "#333", marginTop: 4, fontWeight: "600" },
  footer: {
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
});
