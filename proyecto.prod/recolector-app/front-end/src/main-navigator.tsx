import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import HomeScreen from "./screens/home-screen";
import LoginForm from "./screens/forms/login-form";
import RegisterForm from "./screens/forms/register-form";
import ForgotScreen from "./screens/forms/forgot-form";
import ResetScreen from "./screens/forms/reset";

// App Navigation
import DrawerNavigation from "./navigation/drawer-navigation";

const Stack = createNativeStackNavigator();

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      {/* ================================
          HOME
      ================================= */}
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* ================================
          AUTH
      ================================= */}
      <Stack.Screen name="Login" component={LoginForm} />
      <Stack.Screen name="Register" component={RegisterForm} />
      <Stack.Screen name="Forgot" component={ForgotScreen} />
      <Stack.Screen name="Reset" component={ResetScreen} />

      {/* ================================
          APP (Protegida después del login)
      ================================= */}
      <Stack.Screen
        name="Drawer"
        component={DrawerNavigation}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
