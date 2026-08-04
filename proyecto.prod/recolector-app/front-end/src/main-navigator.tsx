import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import HomeScreen from "./screens/home-screen";
import LoginForm from "./screens/forms/login-form";
import RegisterForm from "./screens/forms/register-form";
import ForgotScreen from "./screens/forms/forgot-form";
import ResetScreen from "./screens/forms/reset";

// App Navigation
import DrawerNavigation from "./navigation/drawer-navigation";
import { deleteToken, deleteUser, getToken, getUser } from "./auth/auth";

const Stack = createNativeStackNavigator();

const MainNavigator: React.FC = () => {
  const [loadingSession, setLoadingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    (async () => {
      const [token, user] = await Promise.all([getToken(), getUser()]);
      const valid = Boolean(token && user?.rol === 4);
      setHasSession(valid);
      if (!valid && (token || user)) {
        await Promise.all([deleteToken(), deleteUser()]);
      }
      setLoadingSession(false);
    })();
  }, []);

  if (loadingSession) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#307043" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={hasSession ? "Drawer" : "Home"}
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
