import { https } from "../https";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Usuario {
  idusuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  activo: number; // 1 activo, 0 desactivado
  rol_idrol: number;
}

export const getUsuarios = async (): Promise<ApiResponse<Usuario[]>> => {
  try {
    const response = await https.get("/usuarios");

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data, // ← AQUÍ VIENE EL ARRAY REAL
    };
  } catch (error: any) {
    console.error(
      "❌ Error al obtener usuarios:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message:
        error.response?.data?.message || "Error al obtener usuarios",
    };
  }
};



export const desactivarUsuario = async (idusuario: number): Promise<ApiResponse> => {
  try {
    const response = await https.put(`/usuarios/desactivar/${idusuario}`);

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data ?? null,
    };
  } catch (error: any) {
    console.error("❌ Error al desactivar usuario:", error.response?.data || error.message);

    return {
      success: false,
      message: error.response?.data?.message || "Error al desactivar usuario",
    };
  }
};


export const activarUsuario = async (idusuario: number): Promise<ApiResponse> => {
  try {
    const response = await https.put(`/usuarios/activar/${idusuario}`);

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data ?? null,
    };
  } catch (error: any) {
    console.error("❌ Error al activar usuario:", error.response?.data || error.message);

    return {
      success: false,
      message: error.response?.data?.message || "Error al activar usuario",
    };
  }
};
