import apiPrivate from "../clients/api-private";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const getNotificacion = async (): Promise<ApiResponse> => {
  try {
    const response = await apiPrivate.get("/notificacion"); 
    return {
      success: true,
      message: "Notificación obtenida",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al traer notificación:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error en notificación",
    };
  }
};
