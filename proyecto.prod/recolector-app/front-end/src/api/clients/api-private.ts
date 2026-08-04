import axios, { InternalAxiosRequestConfig , AxiosError, AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { LimpiarSesion } from '../../utils/expired-util';
import { getToken } from '../../auth/auth';

if (!Constants.expoConfig?.extra) {
  throw new Error('expoConfig.extra no está definido...');
}

const { apiUrl } = Constants.expoConfig.extra as { apiUrl: string };

const apiPrivate = axios.create({
  baseURL: apiUrl,
});

// agregar token para envío
apiPrivate.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// manejar error de expiración
apiPrivate.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 403) {
      console.error('Token expirado o inválido');
      await LimpiarSesion();
    }
    return Promise.reject(error);
  }
);

export default apiPrivate;



//agregar mas controles de distintos erroes que devuelva el back