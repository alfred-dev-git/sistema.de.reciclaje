// src/services/api/http.ts
import * as SecureStore from "expo-secure-store";

const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");

if (!API_BASE) {
  // Esto hace que si la variable no existe, explote inmediatamente
  throw new Error(
    "❌ No se encontró direccion API."
  );
}

type Json = Record<string, any>;

async function request(path: string, init: RequestInit = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const token = await SecureStore.getItemAsync("auth_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const resp = await fetch(url, { ...init, headers });

  let data: any = null;

  try {
    data = await resp.json();
  } catch {
    // puede ser 204 No Content
  }

  if (!resp.ok) {
    const err: any = new Error(data?.error || `HTTP ${resp.status}`);
    err.status = resp.status;
    err.data = data;
    err.url = url;
    throw err;
  }

  return data as Json;
}

export const api = {
  get: (p: string) => request(p, { method: "GET" }),
  post: (p: string, body?: Json) =>
    request(p, { method: "POST", body: JSON.stringify(body ?? {}) }),
  put: (p: string, body?: Json) =>
    request(p, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  patch: (p: string, body?: Json) =>
    request(p, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  del: (p: string) => request(p, { method: "DELETE" }),
};

export async function saveToken(token: string | null) {
  if (token) await SecureStore.setItemAsync("auth_token", token);
  else await SecureStore.deleteItemAsync("auth_token");
}

export async function getToken() {
  return SecureStore.getItemAsync("auth_token");
}
