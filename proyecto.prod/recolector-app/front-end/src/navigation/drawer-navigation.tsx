// src/navigation/drawer-navigation.tsx
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import RecolectorNavigation from "./recolector-navigation";
import PerfilScreen from "../components/perfil-recolector";
import CronogramaScreen from "../components/cronograma-recoleccion";
const Drawer = createDrawerNavigator();

const DrawerNavigation: React.FC = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Inicio"
      screenOptions={{
        headerShown: false, 
        drawerActiveTintColor: "#307043",
        drawerInactiveTintColor: "gray",
        drawerStyle: {
          backgroundColor: "#f8faed",
          width: 250,
        },
      }}
    >
      <Drawer.Screen
        name="Inicio"
        component={RecolectorNavigation}
        options={{ title: "Inicio" }}
      />
      <Drawer.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ title: "Mi Perfil" }}
      />
      <Drawer.Screen
        name="cronograma"
        component={CronogramaScreen}
        options={{ title: "Cronograma Reciclaje" }}
      />
    </Drawer.Navigator>
    
  );
};

export default DrawerNavigation;
