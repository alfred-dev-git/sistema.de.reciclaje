import apiPrivate from "../clients/api-private";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const getCronograma = async (): Promise<ApiResponse> => {
  try {
    const response = await apiPrivate.get("/cronograma"); 
    return {
      success: true,
      message: "cronograma obtenido",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al traer cronograma:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error en cronograma",
    };
  }
};
