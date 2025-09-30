import * as SecureStore from 'expo-secure-store';

const USER_KEY = 'userInfo';
const TOKEN_KEY = 'authToken';

// Tipos
export interface User {
  id?: number;
  email?: string;
  rol?: number;
  [key: string]: any;
}

// Guardar usuario
export const saveUser = async (user: User): Promise<void> => {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};

// Obtener usuario
export const getUser = async (): Promise<User | null> => {
  const userString = await SecureStore.getItemAsync(USER_KEY);
  return userString ? JSON.parse(userString) as User : null;
};

// Eliminar usuario
export const deleteUser = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(USER_KEY);
};

// Guardar token
export const saveToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

// Obtener token
export const getToken = async (): Promise<string | null> => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return token;
};

// Eliminar token
export const deleteToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};
