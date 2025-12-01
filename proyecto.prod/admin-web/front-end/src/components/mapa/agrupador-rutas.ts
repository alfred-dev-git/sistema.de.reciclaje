import { DBSCAN } from "density-clustering";
import { PedidoAsignado, obtenerParadasRecolector } from "../../api/services/paradas.service";

export interface Punto {
  latitude: number;
  longitude: number;
  [key: string]: any;
}
export interface RutaAgrupada {
  id: number;
  paradas: PedidoAsignado[];
  directions?: google.maps.DirectionsResult
}

/** Agrupa los puntos por cercanía (DBSCAN) y los divide según maxPuntos */
export function prepararGruposParaRutas<T extends Punto>(
  puntos: T[],
  maxPuntos: number = 25,
  distancia: number = 0.03, // radio de agrupamiento (~3km)
  minPts: number = 2
): T[][] {
  if (!puntos || puntos.length === 0) return [];

  const dbscan = new DBSCAN();
  const coords = puntos.map(p => [p.latitude, p.longitude]);
  const clusters = dbscan.run(coords, distancia, minPts);

  const agrupados: T[][] = clusters.map(indices => indices.map(i => puntos[i]));

  const usados = clusters.flat();
  const outliers = puntos.filter((_, i) => !usados.includes(i));
  if (outliers.length > 0) agrupados.push(...outliers.map(p => [p]));

  const subgrupos: T[][] = [];
  for (const grupo of agrupados) {
    for (let i = 0; i < grupo.length; i += maxPuntos) {
      const chunk = grupo.slice(i, i + maxPuntos);
      if (chunk.length > 0) subgrupos.push(chunk);
    }
  }

  return subgrupos;
}

/** Devuelve los divisores del total de paradas */
export function obtenerOpcionesAgrupamiento(total: number): number[] {
  const divisores: number[] = [];
  for (let i = 1; i <= total; i++) {
    if (total % i === 0) divisores.push(i);
  }
  return divisores;
}

/** Agrupa paradas por cercanía geográfica según la cantidad de rutas */
export function agruparParadasPorCercania(
  paradas: PedidoAsignado[],
  cantidadRutas: number
) {
  if (!paradas || paradas.length === 0) return [];

  const puntos = paradas.map(p => ({
    ...p,
    latitude: Number(p.latitud),
    longitude: Number(p.longitud),
  }));

  const maxPorGrupo = Math.ceil(puntos.length / cantidadRutas);
  const grupos = prepararGruposParaRutas(puntos, maxPorGrupo, 0.03, 1);

  // Ajuste si DBSCAN no produce la cantidad deseada de grupos
  while (grupos.length < cantidadRutas) {
    const grande = grupos.sort((a, b) => b.length - a.length)[0];
    grupos.push(grande.slice(Math.floor(grande.length / 2)));
  }
  while (grupos.length > cantidadRutas) {
    const a = grupos.pop()!;
    grupos[grupos.length - 1].push(...a);
  }

  return grupos.map((g, i) => ({
    id: i + 1,
    paradas: g,
  }));
}



export async function obtenerRutasPorRecolector(idRecolector: number): Promise<RutaAgrupada[]> {
  // 1️⃣ Traer pedidos del backend
  const pedidos: PedidoAsignado[] = await obtenerParadasRecolector(idRecolector);

  // 2️⃣ Agrupar por id de ruta
  const rutasMap = new Map<number, PedidoAsignado[]>();

  pedidos.forEach(pedido => {
    const idRuta = pedido.id_ruta; // viene del backend
    if (!rutasMap.has(idRuta)) {
      rutasMap.set(idRuta, []);
    }
    rutasMap.get(idRuta)!.push(pedido);
  });

  // 3️⃣ Transformar en arreglo de RutaAgrupada
  const rutasAgrupadas: RutaAgrupada[] = Array.from(rutasMap.entries()).map(([id, paradas]) => ({
    id,
    paradas,
  }));

  return rutasAgrupadas;
}