// src/services/api/http.ts
import * as SecureStore from "expo-secure-store";

const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");

if (!API_BASE) {
  // Esto hace que si la variable no existe, explote inmediatamente
  throw new Error(
    "❌ No se encontró direccion API."
  );
}

type Json = Record<string, unknown>;

async function request<T = Json>(path: string, init: RequestInit = {}): Promise<T> {
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

  return data as T;
}

export const api = {
  get: <T = Json>(p: string) => request<T>(p, { method: "GET" }),
  post: <T = Json>(p: string, body?: unknown) =>
    request<T>(p, { method: "POST", body: JSON.stringify(body ?? {}) }),
  put: <T = Json>(p: string, body?: unknown) =>
    request<T>(p, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  patch: <T = Json>(p: string, body?: unknown) =>
    request<T>(p, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  del: <T = Json>(p: string) => request<T>(p, { method: "DELETE" }),
};

export async function saveToken(token: string | null) {
  if (token) await SecureStore.setItemAsync("auth_token", token);
  else await SecureStore.deleteItemAsync("auth_token");
}

export async function getToken() {
  return SecureStore.getItemAsync("auth_token");
}
