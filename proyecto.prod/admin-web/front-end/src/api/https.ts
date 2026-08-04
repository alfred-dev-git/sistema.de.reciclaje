import axios, { type AxiosError, type AxiosResponse } from 'axios';
import { navigateTo } from '../refglobal.navigation';

const apiUrl = import.meta.env.VITE_API_URL;

export const https = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

let currentAuthCtx: { logout?: () => Promise<void> } | null = null;

export const setAuthContextRef = (ctx: { logout?: () => Promise<void> }) => {
  currentAuthCtx = ctx;
};

function getAuthContext() {
  return currentAuthCtx;
}

https.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as any;

    // Evita bucle si ya viene del logout
    if (originalRequest?.url?.includes('/auth/logout')) {
      return Promise.reject(error);
    }

    const authCtx = getAuthContext();

    if (status === 401 || status === 403) {
      console.warn('Sesión expirada o no autorizada → redirigiendo a login');
      // Limpieza local sin llamar al back
      await authCtx?.logout?.(); 
      alert('Tu sesión ha caducado. Por favor, vuelve a iniciar sesión.');
      navigateTo('/login');
    }

    return Promise.reject(error);
  }
);
