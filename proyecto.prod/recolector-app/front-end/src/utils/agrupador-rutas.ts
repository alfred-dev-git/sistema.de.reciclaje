import { DBSCAN } from "density-clustering";

export interface Punto {
  latitude: number;
  longitude: number;
  [key: string]: any;
}

export function prepararGruposParaRutas<T extends Punto>(
  puntos: T[],
  maxPuntos: number = 25,
  distancia: number = 0.03,
  minPts: number = 2
): T[][] {
  const dbscan = new DBSCAN();
  const subgrupos: T[][] = [];

  // Agrupar primero por id_ruta
  const rutasMap = new Map<number, T[]>();
  for (const punto of puntos) {
    if (!rutasMap.has(punto.id_ruta)) rutasMap.set(punto.id_ruta, []);
    rutasMap.get(punto.id_ruta)!.push(punto);
  }

  // Ahora para cada ruta, aplicamos DBSCAN y chunking
  for (const rutaPuntos of rutasMap.values()) {
    const coords = rutaPuntos.map((p) => [p.latitude, p.longitude]);
    const clusters: number[][] = dbscan.run(coords, distancia, minPts);

    const agrupados: T[][] = clusters.map((clusterIndices) =>
      clusterIndices.map((i) => rutaPuntos[i])
    );

    // Agregar outliers
    const outliers = rutaPuntos.filter((_, i) => !clusters.flat().includes(i));
    if (outliers.length > 0) agrupados.push(...outliers.map((p) => [p]));

    // Dividir grupos grandes en subgrupos
    for (const grupo of agrupados) {
      for (let i = 0; i < grupo.length; i += maxPuntos) {
        const chunk = grupo.slice(i, i + maxPuntos);
        if (chunk.length > 0) subgrupos.push(chunk);
      }
    }
  }

  return subgrupos;
}
