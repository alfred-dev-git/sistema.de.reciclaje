// src/services/api/http.ts
import * as SecureStore from "expo-secure-store";

export const BASE_URL = "http://192.168.0.25:3000/api"; 
export async function getToken() {
  try {
    return await SecureStore.getItemAsync("auth_token");
  } catch (e) {
    console.log("SecureStore getToken error:", e);
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const token = await getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
      console.log("HTTP ERROR:", { url, status: res.status, data });
      throw new Error(msg);
    }

    return data as T;
  } catch (e) {
    console.log("HTTP FETCH ERROR:", { url, options, error: String(e) });
    throw e;
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: any) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};

export async function saveToken(token: string | null) {
  try {
    if (token) {
      await SecureStore.setItemAsync("auth_token", token); // clave + valor
    } else {
      await SecureStore.deleteItemAsync("auth_token");
    }
  } catch (e) {
    console.log("SecureStore saveToken error:", e);
  }
}
