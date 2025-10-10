import apiPrivate from "../clients/api-private";
import type * as ImagePicker from "expo-image-picker";


export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Perfil {
  idusuario: number;
  DNI: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  municipio: string;
  foto_perfil: string | null;
  puntos: number;
}

/**
 * 🔹 Obtener perfil del usuario logueado
 */
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

