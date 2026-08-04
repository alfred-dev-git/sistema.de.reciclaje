import apiPrivate from "../clients/api-private";
import type * as ImagePicker from "expo-image-picker";
import apiPublic from "../clients/api-public";

export interface Municipio {
  idmunicipio: number;
  descripcion: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Perfil {
  DNI: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  municipio: string;
  foto_perfil: string | null;
}

export interface NewPerfil {
  email: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  password: string;
  fecha_nacimiento: string; 
  idmunicipio: number;
}

export interface UpdatePerfilDTO {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string; 
  dni?: string;
  idmunicipio?: number;
  password?: string; 
}

export const updatePerfil = async (
  data: UpdatePerfilDTO
): Promise<ApiResponse> => {
  try {
    const response = await apiPrivate.put("/perfil/update", data);

    return {
      success: true,
      message: response.data?.message || "Perfil actualizado correctamente",
      data: response.data?.data,
    };
  } catch (error: any) {
    const status = error.response?.status;
    const serverMsg = error.response?.data?.message;

    let message = "Error al actualizar perfil";

    if (status === 400) message = serverMsg || "Datos inválidos";
    else if (status === 409) message = serverMsg || "El correo, DNI o teléfono ya están registrados";
    else if (status === 500) message = "Error interno del servidor";

    console.error("❌ Error al actualizar perfil:", status, serverMsg);

    return {
      success: false,
      message,
    };
  }
};

export const crearPerfil = async (data: NewPerfil): Promise<ApiResponse> => {
  try {
    const response = await apiPublic.post("/perfil/register", data);

    return {
      success: true,
      message: response.data?.message || "Usuario creado correctamente",
      data: response.data,
    };
  } catch (error: any) {
    const status = error.response?.status;
    const serverMsg = error.response?.data?.message;

    let message = "Error al registrar usuario";

    // Manejo personalizado por código HTTP
    if (status === 409) {
      message = serverMsg || "El DNI, correo o teléfono ya están registrados";
    } else if (status === 400) {
      message = serverMsg || "Datos inválidos, verifique los campos";
    } else if (status === 500) {
      message = serverMsg || "Error interno del servidor";
    }

    console.error("❌ Error al crear usuario:", status, serverMsg);

    return {
      success: false,
      message,
    };
  }
};

export const getMunicipios = async (): Promise<ApiResponse<Municipio[]>> => {
  try {
    const response = await apiPublic.get("/perfil/municipios");
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

export const getPerfil = async (): Promise<ApiResponse<Perfil>> => {
  try {
    const response = await apiPrivate.get("/perfil");
    return {
      success: true,
      message: "Perfil obtenido correctamente",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al traer perfil:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener el perfil",
    };
  }
};


/**
 * 🔹 Subir nueva foto de perfil
 */
export const updateFotoPerfil = async (
  asset: ImagePicker.ImagePickerAsset
): Promise<ApiResponse> => {
  try {
    // Enviar solo la ruta local del dispositivo (sin subir imagen)
    const response = await apiPrivate.put("/perfil/foto", {
      foto_perfil: asset.uri, // 👈 debe coincidir con el campo del backend
    });

    return {
      success: true,
      message: "Ruta de foto guardada correctamente",
      data: response.data.data || asset.uri, // usa la ruta que devuelve el backend
    };
  } catch (error: any) {
    console.error("❌ Error al guardar ruta de foto:", error.response?.data || error.message);
    return {
      success: false,
      message:
        error.response?.data?.message || "Error al guardar la ruta de la foto",
    };
  }
};


/**
 * 🔹 Obtener la URL de la foto (para mostrar en <Image>)
 */
export const getUserPhotoUrl = () => {
  const baseURL = apiPrivate.defaults.baseURL;
  return `${baseURL}/perfil/foto?ts=${Date.now()}`;
};

