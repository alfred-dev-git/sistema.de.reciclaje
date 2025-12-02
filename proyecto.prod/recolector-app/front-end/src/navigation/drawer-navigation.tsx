// drawer-navigation.tsx
import { createDrawerNavigator } from "@react-navigation/drawer";
import RecolectorStack from "./recolector-navigation";
import CronogramaScreen from "../components/cronograma-recoleccion";
import PerfilScreen from "../components/perfil-recolector";
import EditarPerfilScreen from "../screens/forms/edit-perfil";

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => (
  <Drawer.Navigator initialRouteName="Inicio" screenOptions={{ headerShown: false }}>
    <Drawer.Screen name="Inicio" component={RecolectorStack} />
    <Drawer.Screen name="Mi perfil" component={PerfilScreen} />

    <Drawer.Screen name="EditarPerfil" component={EditarPerfilScreen}
      options={{
        drawerItemStyle: { display: "none" },
      }}
    />

    <Drawer.Screen name="Cronograma" component={CronogramaScreen} />
  </Drawer.Navigator>
);

export default DrawerNavigation;
