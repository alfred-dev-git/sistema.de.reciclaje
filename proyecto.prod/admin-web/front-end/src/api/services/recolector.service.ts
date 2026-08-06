import { https } from "../https";
import type { AxiosError } from "axios";

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

export const notificarRuta = async (idRuta: number, mensaje: string) => {
  try {
    const response = await https.post("/rutas/notificar", { idRuta, mensaje });
    return { success: true, message: response.data.message, data: response.data };
  } catch (error: unknown) {
    const apiError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: apiError.response?.data?.message || "Error al enviar la notificación",
    };
  }
};

export const actualizarFechaRuta = async (idRuta: number, fechaProgramada: string) => {
  try {
    const response = await https.post("/rutas/updatefecha", {
      id_ruta: idRuta,
      fecha_programada: fechaProgramada,
    });
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Error al actualizar la fecha" };
  }
};



