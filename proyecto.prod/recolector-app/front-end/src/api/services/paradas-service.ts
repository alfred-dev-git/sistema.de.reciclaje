// src/services/rutas/obtener-paradas.ts

import apiPrivate from "../clients/api-private";
import { prepararGruposParaRutas, Punto } from "../../utils/agrupador-rutas";
import axios from "axios";
import polyline from "@mapbox/polyline";

/** ---- Tipos del backend ---- */
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

export interface ParadaNormalizada
  extends Omit<PedidoAsignado, "latitud" | "longitud">,
  Punto {
  latitud: number;
  longitud: number;
  estado: number; // 0 = pendiente, 1 = completado
}

export interface RutaCalculada {
  coordenadas: { latitude: number; longitude: number }[];
  paradas: ParadaNormalizada[];
}

/** ---- Google API Key ---- */
export const GOOGLE_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

/** ---- Normalización de paradas ---- */
function normalizarParadas(
  data: PedidoAsignado[]
): ParadaNormalizada[] {
  return data
    .filter((p) => p.latitud != null && p.longitud != null)
    .map((p) => {
      const lat =
        typeof p.latitud === "string"
          ? parseFloat(p.latitud)
          : p.latitud;
      const lng =
        typeof p.longitud === "string"
          ? parseFloat(p.longitud)
          : p.longitud;

      return {
        ...p,
        latitud: lat,
        longitud: lng,
        latitude: lat,
        longitude: lng,
        estado: 0,
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

/** ---- Obtener rutas agrupadas ---- */
export async function obtenerParadasAgrupadas(): Promise<
  RutaCalculada[]
> {
  try {
    if (!GOOGLE_API_KEY) {
      console.warn(
        "⚠️ Google Maps API Key no configurada (EXPO_PUBLIC_GOOGLE_MAPS_API_KEY)"
      );
      return [];
    }

    const { data } =
      await apiPrivate.get<PedidoAsignado[]>("/paradas");

    const paradasValidas = normalizarParadas(data);
    const subgrupos =
      prepararGruposParaRutas(paradasValidas);

    const rutas: RutaCalculada[] = [];

    for (const grupo of subgrupos) {
      if (grupo.length === 0) continue;

      const origin = `${grupo[0].latitude},${grupo[0].longitude}`;
      const destination = `${grupo[grupo.length - 1].latitude
        },${grupo[grupo.length - 1].longitude}`;

      const waypoints = grupo
        .slice(1, grupo.length - 1)
        .map((p) => `${p.latitude},${p.longitude}`)
        .join("|");

      const url =
        `https://maps.googleapis.com/maps/api/directions/json` +
        `?origin=${origin}` +
        `&destination=${destination}` +
        (waypoints ? `&waypoints=${waypoints}` : "") +
        `&key=${GOOGLE_API_KEY}`;

      const rutaRes = await axios.get(url);
      const rutaData = rutaRes.data;

      if (rutaData.status !== "OK") {
        console.warn(
          "⚠️ Google Directions error:",
          rutaData.status,
          rutaData.error_message ?? ""
        );
        continue;
      }

      const overview =
        rutaData.routes?.[0]?.overview_polyline?.points;

      if (!overview) {
        console.warn(
          "⚠️ Ruta sin polyline:",
          JSON.stringify(rutaData, null, 2)
        );
        continue;
      }

      const coordenadas = polyline
        .decode(overview)
        .map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));

      rutas.push({
        coordenadas,
        paradas: grupo,
      });
    }

    return rutas;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ Axios error:",
        error.response?.data || error.message
      );
    } else if (error instanceof Error) {
      console.error(
        "❌ Error en obtenerParadasAgrupadas:",
        error.message
      );
    } else {
      console.error(
        "❌ Error desconocido en obtenerParadasAgrupadas:",
        error
      );
    }

    return [];
  }
}
