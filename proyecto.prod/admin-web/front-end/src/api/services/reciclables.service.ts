import {https} from "../https";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const getTiposReciclable = async (): Promise<ApiResponse> => {
  try {
    const response = await https.get("/reciclables/getAll");
    return {
      success: true,
      message: "Tipos de reciclable obtenidos correctamente",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al traer tipos de reciclable:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener tipos de reciclable",
    };
  }
};