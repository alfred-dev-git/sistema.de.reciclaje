// src/api/services/recoleccion-service.ts
import apiPrivate from "../clients/api-private";

// interfaz opcional para la respuesta
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface CompletadoPayload {
  idpedidos: number;
  estado: number;       // ej: 1 = completado
  cant_bolson: number;
  id_tipo_reciclable: number;
}

interface UserAusentePayload {
  idpedidos: number;
  estado: number;       // ej: 2 = ausente
}

export const marcarCompletado = async (payload: CompletadoPayload): Promise<ApiResponse> => {
  try {
    const response = await apiPrivate.post("/completado/presente", payload);
    return {
      success: true,
      message: "Ruta marcada como completada",
      data: response.data,
    };
  } catch (error: any) {
     console.error("❌ Error marcarCompletado:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error de recolección",
    };
  }
};

export const marcarUserAusente = async (payload: UserAusentePayload): Promise<ApiResponse> => {
  try {
    const response = await apiPrivate.post("/userAusente/ausente", payload);
    return {
      success: true,
      message: "Usuario ausente registrado",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error marcarCompletado:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error de recolección",
    };
  }
};
