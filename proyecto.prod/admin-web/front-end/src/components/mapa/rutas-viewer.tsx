import React, { useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { obtenerParadas, PedidoAsignado } from "../../api/services/paradas.service";
import {
  obtenerOpcionesAgrupamiento,
  agruparParadasPorCercania,
  RutaAgrupada,
} from "../mapa/agrupador-rutas";
import RutasMap from "./rutas-map";
import PanelRecolector from "../Recolector";

export default function RutasViewer() {
  const [paradas, setParadas] = useState<PedidoAsignado[]>([]);
  const [rutas, setRutas] = useState<RutaAgrupada[]>([]);
  const [opciones, setOpciones] = useState<number[]>([]);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [rutaActiva, setRutaActiva] = useState<number | null>(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PedidoAsignado | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    async function cargarParadas() {
      try {
        const data = await obtenerParadas();
        setParadas(data);
        setOpciones(obtenerOpcionesAgrupamiento(data.length));
      } catch (err) {
        console.error("❌ Error cargando paradas:", err);
      }
    }
    cargarParadas();
  }, []);

  const handleSeleccion = (valor: number) => {
    setOpcionSeleccionada(valor);
    const agrupadas = agruparParadasPorCercania(paradas, valor);
    setRutas(agrupadas);
    setRutaActiva(null);
  };

  const center = React.useMemo(() => {
    if (paradas.length > 0)
      return { lat: Number(paradas[0].latitud), lng: Number(paradas[0].longitud) };
    return { lat: -27.362159, lng: -55.950874 };
  }, [paradas]);

  if (!isLoaded) return <p>Cargando mapa...</p>;

  return (
    <div className="p-4 flex flex-col gap-4">
      {paradas.length > 0 ? (
        <>
          {/* 🔹 Selector de opciones */}
          <div>
            <h3 className="text-lg font-semibold">
              Total de paradas: {paradas.length}
            </h3>
            <label className="font-medium">Elegí cómo agrupar las rutas:</label>
            <select
              className="border p-2 rounded w-64 ml-2"
              onChange={(e) => handleSeleccion(Number(e.target.value))}
              value={opcionSeleccionada ?? ""}
            >
              <option value="">Seleccioná una opción</option>
              {opciones.map((n) => (
                <option key={n} value={n}>
                  {n} rutas → {Math.ceil(paradas.length / n)} paradas por ruta
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 Botones de rutas */}
          {rutas.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {rutas.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRutaActiva(r.id)}
                  className={`px-4 py-2 rounded text-white font-medium ${
                    rutaActiva === r.id ? "bg-blue-600" : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  Ruta {r.id}
                </button>
              ))}
            </div>
          )}

          {/* 🔹 Mapa separado */}
          <RutasMap
            rutas={rutas}
            rutaActiva={rutaActiva}
            puntoSeleccionado={puntoSeleccionado}
            setPuntoSeleccionado={setPuntoSeleccionado}
            center={center}
          />
                {/* 👷 Panel lateral */}
          <div>
            <PanelRecolector rutaActiva={rutaActiva} />
          </div>
          {/* 🔹 Listado de rutas */}
          {rutas.length > 0 && (
            <div>
              <h4 className="font-semibold mt-4">Rutas generadas:</h4>
              {rutas.map((ruta) => (
                <div key={ruta.id} className="border p-2 rounded mb-2">
                  <h5 className="font-bold">Ruta {ruta.id}</h5>
                  <ul className="ml-4 list-disc">
                    {ruta.paradas.map((p) => (
                      <li key={p.idpedidos}>
                        {p.calle} {p.numero} ({p.latitud}, {p.longitud})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p>Cargando paradas...</p>
      )}
    </div>
  );
}
