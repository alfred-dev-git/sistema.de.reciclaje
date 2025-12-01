import {https} from "../https";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}


export const getCronograma = async (): Promise<ApiResponse> => {
  try {
    const response = await https.get("/cronograma/info"); 
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


export const crearFechaRecoleccion = async (payload: {
  dia_semana: number;
  semana_mes: number;
  hora_inicio: string;
  hora_fin: string;
  tipo_reciclable: string;
}): Promise<ApiResponse> => {
  try {
    const response = await https.post("/cronograma/crear", payload);
    return {
      success: true,
      message: "Fecha de recolección creada",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al crear fecha:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error al crear fecha",
    };
  }
};

export const lanzarNotificacion = async (payload: {
  idcronograma_recoleccion: number; 
  mensaje: string;
  fechaObjetivo?: string; // opcional si querés asociarla a una fecha concreta
}): Promise<ApiResponse> => {
  try {
    const response = await https.post("/cronograma/notificar", payload);
    return {
      success: true,
      message: "Notificación enviada correctamente",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al enviar notificación:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error al enviar la notificación",
    };
  }
};


export const modificarFechaRecoleccion = async (
  id: number,
  payload: Partial<{
    idcronograma_recoleccion: number;
    dia_semana: number;
    semana_mes: number;
    hora_inicio: string;
    hora_fin: string;
    tipo_reciclable: string;
  }>
): Promise<ApiResponse> => {
  try {
    const response = await https.put(`/cronograma/modificar/${id}`, payload);
    return {
      success: true,
      message: "Fecha modificada",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al modificar fecha:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error al modificar fecha",
    };
  }
};


export const anularFechaRecoleccion = async (id: number): Promise<ApiResponse> => {
  try {
    const response = await https.post(`/cronograma/anular/${id}`);
    return {
      success: true,
      message: "Fecha anulada",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al anular fecha:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error al anular fecha",
    };
  }
};



export const fechasInactivas = async (): Promise<ApiResponse> => {
  try {
    const response = await https.get(`/cronograma/inactivas`);
    return {
      success: true,
      message: "Fechas inactivas obtenidas",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al traer fechas inactivas:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error al traer fechas inactivas",
    };
  }
};

export const activarFechaRecoleccion = async (id: number): Promise<ApiResponse> => {
  try {
    const response = await https.put(`/cronograma/activar/${id}`);
    return { success: true, message: response.data.message };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al activar la fecha",
    };
  }
};
