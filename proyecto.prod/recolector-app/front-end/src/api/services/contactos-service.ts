import apiPrivate from "../clients/api-private";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
export const getContactosAdmin = async (): Promise<ApiResponse> => {
  try {
    const response = await apiPrivate.get("/contactos-admin");

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data, // <-- AHORA SÍ devuelve el array
    };
  } catch (error: any) {
    console.error("❌ Error al traer contactos:", error.response?.data || error.message);

    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener contactos",
    };
  }
};
