// recolector-navigation.tsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeRecolector from "../screens/recolector/home-recolector";
import RutaAsignada from "../screens/recolector/ruta-asignada";
import PerfilScreen from "../components/perfil-recolector";
import EditarPerfilScreen from "../screens/forms/edit-perfil";

const Stack = createNativeStackNavigator();

const RecolectorStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeRecolector" component={HomeRecolector} />
      <Stack.Screen name="RutaAsignada" component={RutaAsignada} />
      <Stack.Screen name="Perfil" component={PerfilScreen} />
      <Stack.Screen name="Editar" component={EditarPerfilScreen} />
    </Stack.Navigator>
  );
};

export default RecolectorStack;
