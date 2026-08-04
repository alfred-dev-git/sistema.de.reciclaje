import apiPrivate from "../clients/api-private";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const getHistorial = async (): Promise<ApiResponse> => {
  try {
    const response = await apiPrivate.get("/historial"); 
    return {
      success: true,
      message: "Historial obtenido",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al traer historial:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error en historial",
    };
  }
};
