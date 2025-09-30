import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/home-screen";
import LoginForm from "./screens/forms/login-form";
import RecolectorNavigation from "./navigation/recolector-navigation";
import type { RootStackParamList } from "./types/navigation";

// Creamos stack tipados
const Stack = createNativeStackNavigator<RootStackParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginForm} />
      <Stack.Screen name="RecolectorNavigation" component={RecolectorNavigation}/>
    </Stack.Navigator>
  );
};

export default MainNavigator;
