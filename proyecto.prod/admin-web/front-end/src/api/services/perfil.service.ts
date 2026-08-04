import { https } from "../https";

export type Perfil = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni: string;
  municipio: string;
  municipio_idmunicipio: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export interface Municipio {
  idmunicipio: number;
  descripcion: string;
}

export const perfilService = {
  // Obtener perfil actual
  getPerfil: async (): Promise<ApiResponse<Perfil>> => {
    try {
      const response = await https.get("/perfil");
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Error al obtener perfil:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener perfil",
      };
    }
  },

  // actualizar datos del perfil
  updatePerfil: async (
    data: Partial<Perfil>
  ): Promise<ApiResponse<Perfil>> => {
    try {
      const response = await https.put("/perfil/update", data);

      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data, // perfil actualizado que devuelve el back
      };
    } catch (error: any) {
      console.error(
        "❌ Error al actualizar perfil:",
        error.response?.data || error.message
      );

      return {
        success: false,
        message:
          error.response?.data?.message || "Error al actualizar el perfil",
      };
    }
  },
};

export const getMunicipios = async (): Promise<ApiResponse<Municipio[]>> => {
  try {
    const response = await https.get("/perfil/municipios");
    return {
      success: true,
      message: "Municipios obtenidos correctamente",
      data: response.data.data, // el .data del backend
    };
  } catch (error: any) {
    console.error("❌ Error al traer municipios:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener municipios",
    };
  }
};
