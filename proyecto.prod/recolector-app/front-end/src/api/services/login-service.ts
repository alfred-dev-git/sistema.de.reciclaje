import apiPublic from '../clients/api-public';
import { AxiosError } from "axios";

// Tipamos la respuesta esperada del backend
export type LoginResponse = {
  message: string;
  token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
  };
};

// Tipamos lo que devuelve la función
export type LoginResultOk = {
  ok: true;
  mensaje: string;
  token: string;
  user: LoginResponse["user"];
};

export type LoginResultError = {
  ok: false;
  mensaje: string;
};
//
// Tipos comunes
//
export type BasicResponse = {
  message: string;
};

export type ServiceResultOk<T> = {
  ok: true;
  mensaje: string;
  data?: T;
};

export type ServiceResultError = {
  ok: false;
  mensaje: string;
};

export type ServiceResult<T = undefined> =
  | ServiceResultOk<T>
  | ServiceResultError;

export type LoginResult = LoginResultOk | LoginResultError;

export const loginUsuario = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  try {
    const response = await apiPublic.post<LoginResponse>(
      "/user/login",
      { email, password },
      { withCredentials: true }
    );

    return {
      ok: true,
      mensaje: response.data.message,
      token: response.data.token,
      user: response.data.user,
    };
  } catch (err: unknown) {
    console.error("❌Error en login:", err);

    // Usamos AxiosError para tipar mejor
    const error = err as AxiosError<{ message?: string }>;

    return {
      ok: false,
      mensaje: error.response?.data?.message || "Error desconocido",
    };
  }
};

//
//──── FORGOT PASSWORD
//
export const forgotPasswordService = async (
  email: string
): Promise<ServiceResult> => {
  try {
    const response = await apiPublic.post<BasicResponse>(
      "/user/forgot",
      { email },
      { withCredentials: true }
    );

    return {
      ok: true,
      mensaje: response.data.message,
    };
  } catch (err: unknown) {
    console.error("❌ Error en forgotPassword:", err);

    const error = err as AxiosError<{ message?: string }>;

    return {
      ok: false,
      mensaje: error.response?.data?.message || "Error desconocido",
    };
  }
};

//
// ──── RESET PASSWORD
//
export const resetPasswordService = async (
  email: string,
  code: string,
  new_password: string
): Promise<ServiceResult> => {
  try {
    const response = await apiPublic.post<BasicResponse>(
      "/user/reset",
      { email, code, new_password },
      { withCredentials: true }
    );

    return {
      ok: true,
      mensaje: response.data.message ?? "Contraseña actualizada",
    };
  } catch (err: unknown) {
    console.error("❌ Error en resetPassword:", err);

    const error = err as AxiosError<{ error?: string }>;

    return {
      ok: false,
      mensaje: error.response?.data?.error || "Error desconocido",
    };
  }
};
