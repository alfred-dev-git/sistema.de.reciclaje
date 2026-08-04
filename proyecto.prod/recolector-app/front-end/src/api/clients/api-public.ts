import axios from 'axios';
import Constants from 'expo-constants';

if (!Constants.expoConfig?.extra) {
  throw new Error('expoConfig.extra no está definido...');
}

const { apiUrl } = Constants.expoConfig.extra as { apiUrl: string };

if (!apiUrl) {
  throw new Error('No está configurada la URL de la API');
}

const apiPublic = axios.create({
  baseURL: apiUrl,
  timeout: 15000,
});

export default apiPublic;
