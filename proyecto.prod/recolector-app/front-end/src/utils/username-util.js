import { getUser } from '../auth/auth';
import { resetToLogin } from '../navigation/refglobal-navigation';

export const userName = async (setNombre) => {
  const user = await getUser();

  if (user?.nombre) {
    if (typeof setNombre === 'function') {
      setNombre(user.nombre);
    }
    //Usuario autenticado
  } else {
    console.warn('No se encontró usuario, redirigiendo a Login');
    resetToLogin();
  }
};
