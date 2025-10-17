import { https } from "../https";

export interface PedidoAsignado {
  idpedidos: number;
  id_ruta: number;
  estado: number;
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
