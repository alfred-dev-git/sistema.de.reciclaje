import { Alert } from "react-native";

/**
 * Verifica si el usuario tiene el rol correcto (3).
 * @param user objeto de usuario que devuelve el backend
 * @returns true si tiene rol 3, false en caso contrario
 */
export const verificarRol = (user: any): boolean => {
  if (user && user.rol === 4) {
    return true;
  } else {
    Alert.alert("Acceso denegado", "Tu rol no tiene permisos para entrar aquí.");
    return false;
  }
};
