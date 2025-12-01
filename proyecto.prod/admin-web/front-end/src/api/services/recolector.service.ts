import { https } from "../https";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const getCantRutas = async (): Promise<ApiResponse> => {
  try {
    const response = await https.get("/rutas/cantrutas");
    return {
      success: true,
      message: "Cantidad de rutas obtenida correctamente",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al traer cantidad de rutas:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener cantidad de rutas",
    };
  }
};


export const postAsignarRuta = async (payload: any): Promise<ApiResponse> => {
  try {
    const response = await https.post("/rutas/asignar", payload);
    return {
      success: true,
      message: "Ruta asignada correctamente",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al asignar ruta:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error al asignar ruta",
    };
  }
};


export const anularRuta = async (idRuta: number) => {
  try {
    const response = await https.post("/rutas/anularRuta", { idRuta });
    return {
      success: true,
      message: "Ruta anulada correctamente",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al anular ruta:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error al anular la ruta",
    };
  }
};



