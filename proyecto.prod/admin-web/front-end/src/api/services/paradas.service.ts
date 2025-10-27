import { https } from "../https";

export interface PedidoAsignado {
  idpedidos: number;
  id_ruta: number;
  estado: number;
  fecha_emision: string;
  nombre: string;
  apellido: string;
  idusuario: number;
  calle: string;
  numero: string;
  latitud: number | string | null;
  longitud: number | string | null;
}

/** Obtiene paradas desde el backend */
export async function obtenerParadas(): Promise<PedidoAsignado[]> {
  const { data } = await https.get<PedidoAsignado[]>("/paradas");
  return data.filter(p => p.latitud && p.longitud);
}

/** Obtiene las paradas asignadas a un recolector específico */
export async function obtenerParadasRecolector(idRecolector: number): Promise<PedidoAsignado[]> {
  const { data } = await https.get<PedidoAsignado[]>(`/rutas/inforutas`, {
    params: { idRecolector },
  });

  // Filtramos solo las que tienen coordenadas válidas
  return data.filter(p => p.latitud && p.longitud);
}


export const updateRutaRecolector = async (idRuta: number, idRecolector: number) => {
  try {

    const response = await https.post(`/rutas/updaterecolector`, {
      id_ruta: idRuta,
      id_recolector: idRecolector,
    });

    const data = response.data;

    //  Validamos si el backend envía success=false
    if (!data.success) {
      console.warn("⚠️ Error lógico al actualizar recolector:", data.message);
      return { success: false, message: data.message };
    }

    //  Si todo fue bien
    return { success: true, message: data.message };

  } catch (error: any) {
    console.error("❌ Error al actualizar recolector:", error);

    // Si el servidor devolvió respuesta (por ejemplo 500)
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || "Error en el servidor",
      };
    }

    // Si es un problema de red o Axios
    return { success: false, message: "No se pudo conectar con el servidor" };
  }
};
