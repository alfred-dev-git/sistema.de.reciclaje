import apiPrivate from "../clients/api-private";
import Constants from "expo-constants";
import { Punto } from "../../utils/agrupador-rutas";
import axios from "axios";
import polyline from "@mapbox/polyline";

/** ---- Tipos del backend ---- */
export interface PedidoAsignado {
  idsolicitud_recoleccion: number;
  id_ruta: number;
  estado: string;
  nombre: string;
  apellido: string;
  idusuario: number;
  calle: string;
  numero: string;
  latitud: number | string | null;
  longitud: number | string | null;
}

export interface ParadaNormalizada
  extends Omit<PedidoAsignado, "latitud" | "longitud">,
    Punto {
  latitud: number;
  longitud: number;
  estado: string;
}

export interface RutaCalculada {
  idRuta: number;
  coordenadas: { latitude: number; longitude: number }[];
  paradas: ParadaNormalizada[];
}

function normalizarParadas(data: PedidoAsignado[]): ParadaNormalizada[] {
  return data
    .filter((p) => p.latitud != null && p.longitud != null)
    .map((p) => {
      const lat =
        typeof p.latitud === "string"
          ? parseFloat(p.latitud)
          : (p.latitud as number);
      const lng =
        typeof p.longitud === "string"
          ? parseFloat(p.longitud)
          : (p.longitud as number);

      return {
        ...p,
        latitud: lat,
        longitud: lng,
        latitude: lat,
        longitude: lng,
      };
    })
    .filter(
      (p) =>
        !Number.isNaN(p.latitude) &&
        !Number.isNaN(p.longitude) &&
        p.latitude >= -30 &&
        p.latitude <= -25 &&
        p.longitude >= -60 &&
        p.longitude <= -53
    );
}

const { googleMapsApiKey } =
  Constants.expoConfig?.extra || Constants.manifest?.extra || {};

export const GOOGLE_API_KEY = googleMapsApiKey;

if (!GOOGLE_API_KEY) {
  throw new Error("Google Maps API Key no encontrada...");
}

export async function obtenerParadasAgrupadas(): Promise<RutaCalculada[]> {
  try {
    const { data } = await apiPrivate.get<PedidoAsignado[]>("/paradas");
    const paradasValidas = normalizarParadas(data);
    const rutasMap = new Map<number, ParadaNormalizada[]>();
    for (const parada of paradasValidas) {
      const grupo = rutasMap.get(parada.id_ruta) ?? [];
      grupo.push(parada);
      rutasMap.set(parada.id_ruta, grupo);
    }

    const rutas: RutaCalculada[] = [];

    for (const [idRuta, grupo] of rutasMap.entries()) {
      if (grupo.length === 0) continue;

      if (grupo.length === 1) {
        rutas.push({
          idRuta,
          coordenadas: [{ latitude: grupo[0].latitude, longitude: grupo[0].longitude }],
          paradas: grupo,
        });
        continue;
      }

      const origin = `${grupo[0].latitude},${grupo[0].longitude}`;
      const destination = `${grupo[grupo.length - 1].latitude},${
        grupo[grupo.length - 1].longitude
      }`;

      const waypoints = grupo
        .slice(1, grupo.length - 1)
        .map((p) => `${p.latitude},${p.longitude}`)
        .join("|");

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${
        waypoints ? `&waypoints=optimize:true|${waypoints}` : ""
      }&key=${GOOGLE_API_KEY}`;

  
      const rutaRes = await axios.get(url);
      const rutaData = rutaRes.data;

      if (rutaData.status !== "OK") {
        console.warn(
          "⚠️ Google Directions devolvió error:",
          rutaData.status,
          rutaData.error_message || ""
        );
        continue;
      }

      if (rutaData.routes && rutaData.routes.length > 0) {
        const ordenIntermedias: number[] = rutaData.routes[0].waypoint_order ?? [];
        const intermedias = grupo.slice(1, grupo.length - 1);
        const paradasOptimizadas = ordenIntermedias.length === intermedias.length
          ? [grupo[0], ...ordenIntermedias.map((indice) => intermedias[indice]), grupo[grupo.length - 1]]
          : grupo;
        const coords = polyline
          .decode(rutaData.routes[0].overview_polyline.points)
          .map(([lat, lng]) => ({
            latitude: lat,
            longitude: lng,
          }));

        rutas.push({ idRuta, coordenadas: coords, paradas: paradasOptimizadas });
      } else {
        console.warn("⚠️ No se encontraron rutas para este grupo:", grupo);
        console.log(
          "Respuesta completa:",
          JSON.stringify(rutaData, null, 2)
        );
      }
    }

    return rutas;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Axios error:", error.response?.data || error.message);
    } else if (error instanceof Error) {
      console.error("❌ Error en obtenerParadasAgrupadas:", error.message);
    } else {
      console.error("❌ Error desconocido en obtenerParadasAgrupadas:", error);
    }
    throw error;
  }
}
