import {https} from "../https";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface TipoReciclable {
  idtipo_reciclable: number;
  descripcion: string;
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


// 🔹 Crear nuevo tipo de reciclable
export const crearTipoReciclable = async (
  data: Omit<TipoReciclable, "idtipo_reciclable">
): Promise<ApiResponse> => {
  try {
    const response = await https.post("/reciclables/create", data);
    return {
      success: true,
      message: "Tipo de reciclable creado correctamente",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al crear tipo de reciclable:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error al crear tipo de reciclable",
    };
  }
};

// 🔹 Editar tipo de reciclable
export const modificarTipoReciclable = async (
  id: number,
  data: Omit<TipoReciclable, "idtipo_reciclable">
): Promise<ApiResponse> => {
  try {
    const response = await https.put(`/reciclables/update/${id}`, data);
    return {
      success: true,
      message: "Tipo de reciclable modificado correctamente",
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ Error al modificar tipo de reciclable:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error al modificar tipo de reciclable",
    };
  }
};

