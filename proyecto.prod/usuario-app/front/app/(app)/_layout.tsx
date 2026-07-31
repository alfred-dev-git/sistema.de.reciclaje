// app/(app)/_layout.tsx
import { Drawer } from "expo-router/drawer";
import { useEffect, useState } from "react";
import {
  View, Text, Image, StyleSheet, Platform,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
  DrawerItem,
} from "@react-navigation/drawer";
import { router } from "expo-router";
import { getCurrentUser, logout as logoutApi } from "@/services/api/auth";

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

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);
    })();
  }, []);

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
          <Avatar uri={user?.foto_perfil ?? null} initials={initials} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user ? `${user.nombre} ${user.apellido}` : "Usuario"}</Text>
          <Text style={styles.email}>{user?.email ?? ""}</Text>
        </View>
      </View>

      <DrawerItemList {...props} />

      <DrawerItem label="Cerrar sesión" onPress={onLogout} labelStyle={{ color: "#d00", fontWeight: "600" }} />
      <View style={styles.footer}>
        <Text style={{ margin: 10, color: "black", fontWeight: "600", fontSize: 13 }}>Contacto: recolectapp.soporte@gmail.com</Text>
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
  footer: {
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
});
