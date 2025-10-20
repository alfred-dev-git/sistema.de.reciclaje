import { https } from "../https";

export interface Recolector {
  id: number;
  nombre: string;
  apellido: string;
  estado: string; // por ejemplo: "Activo", "En ruta", "Disponible"
  rutas_asignadas: number;
}

/** Obtiene el recolector asignado a una ruta */
export async function obtenerRecolectorPorRuta(idRuta: number): Promise<Recolector | null> {
  try {
    const { data } = await https.get<Recolector>(`/recolectores/ruta/${idRuta}`);
    return data;
  } catch (error) {
    console.error("Error al obtener recolector:", error);
    return null;
  }
}

/** Asigna una ruta a un recolector */
export async function asignarRutaARecolector(idRecolector: number, idRuta: number): Promise<boolean> {
  try {
    await https.post(`/recolectores/${idRecolector}/asignar`, { idRuta });
    return true;
  } catch (error) {
    console.error("Error al asignar ruta:", error);
    return false;
  }
}
