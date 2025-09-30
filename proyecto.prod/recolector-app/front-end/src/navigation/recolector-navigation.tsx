import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeRecolector from "../screens/recolector/home-recolector";
import RutaAsignada from "../screens/recolector/ruta-asignada";
// import AsignarRuta from "../screens/admin/asignar-ruta-admin";
// import PedidosAsignadosAdmin from "../screens/admin/pedidos-asignados-admin";
// import PedidoUsuarioAdmin from "../screens/admin/pedido-usuario-admin";

import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack para manejar navegación interna de recolecto
const RecolectorStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeRecolector" component={HomeRecolector} />
      <Stack.Screen name="RutaAsignada" component={RutaAsignada} />
    </Stack.Navigator>
  );
};

const RecolectorNavigation: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="RecolectorStack"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#307043",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tab.Screen
        name="RecolectorStack"
        component={RecolectorStack}
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default RecolectorNavigation;
