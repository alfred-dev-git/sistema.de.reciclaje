import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeRecolector from "../screens/recolector/home-recolector";
import RutaAsignada from "../screens/recolector/ruta-asignada";



const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack para manejar navegación interna de recolector
const RecolectorStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeRecolector" component={HomeRecolector} />
      <Stack.Screen name="RutaAsignada" component={RutaAsignada} />
    </Stack.Navigator>
  );
};

const RecolectorNavigation: React.FC = () => {
  return <RecolectorStack />;
};

export default RecolectorNavigation;
