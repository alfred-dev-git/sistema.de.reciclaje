import { api, saveToken } from "./http";
import * as SecureStore from "expo-secure-store";

type LoginReq = { email: string; password: string };

export type RegisterReq = {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  fecha_nacimiento: string; // "YYYY-MM-DD"
  sexo: "M" | "F" | "O";    // o el código que uses
  rol_idrol?: number;       // default 3 si no envías
  municipio_idmunicipio?: number; // default 1 si no envías
  puntos?: number;          // default 0 si no envías
};

export async function login(body: LoginReq) {
  const resp = await api.post<{ user: any; token: string }>("/auth/login", body);
  await saveToken(resp.token);
  await SecureStore.setItemAsync("current_user", JSON.stringify(resp.user));
  return resp;
}

export async function register(body: RegisterReq) {
  const resp = await api.post<{ user: any; token: string }>("/auth/register", body);
  await saveToken(resp.token);
  await SecureStore.setItemAsync("current_user", JSON.stringify(resp.user));
  return resp;
}

export async function logout() {
  await saveToken(null);
  await SecureStore.deleteItemAsync("current_user");
}

export async function getCurrentUser() {
  try {
    const raw = await SecureStore.getItemAsync("current_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
