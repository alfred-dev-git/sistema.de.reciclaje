import apiPrivate from "../clients/api-private";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const getFrecuencia = async (): Promise<ApiResponse> => {
  try {
    const response = await apiPrivate.get("/frecuencia");

    return {
      success: true,
      message: "Frecuencia obtenida",
      data: response.data,
    };
  } catch (error: any) {
    console.error(
      "❌ Error al traer frecuencia:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message: error.response?.data?.message || "Error en frecuencia",
    };
  }
};