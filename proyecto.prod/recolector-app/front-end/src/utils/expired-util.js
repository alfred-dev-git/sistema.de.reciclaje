import { Alert } from 'react-native';
import { deleteToken, deleteUser } from '../auth/auth';
import { resetToLogin } from '../navigation/refglobal-navigation';

export const LimpiarSesion = async () => {
  await deleteToken();
  await deleteUser();

  await new Promise((resolve) => {
    Alert.alert('Sesión expirada', 'Por favor vuelva a ingresar.', [
      {
        text: 'OK',
        onPress: () => {
          resetToLogin();
          resolve();
        },
      },
    ]);
  });
};
