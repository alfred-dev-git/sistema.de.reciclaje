import axios from 'axios';
import Constants from 'expo-constants';

if (!Constants.expoConfig?.extra) {
  throw new Error('expoConfig.extra no está definido...');
}

const { apiUrl } = Constants.expoConfig.extra as { apiUrl: string };

const apiPublic = axios.create({
  baseURL: apiUrl,
});

export default apiPublic;
