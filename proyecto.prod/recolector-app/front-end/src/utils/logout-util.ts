import { Alert } from 'react-native';
import { deleteUser, deleteToken } from '../auth/auth';
import { resetToLogin } from '../navigation/refglobal-navigation';

export const handleLogout = (): void => {
  Alert.alert(
    'Cerrar sesión',
    '¿Estás seguro de que deseas salir?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser();
            await deleteToken();
            resetToLogin();
          } catch (error) {
            console.error('Error cerrando sesión:', error);
          }
        },
      },
    ]
  );
};
