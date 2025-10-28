// src/components/rutas/RutasViewer.tsx
import React from "react";
import { useGoogleMapsLoader } from "./use-google-maps-loader";
import RutasMap from "./rutas-map";
import ModalRecolector from "../Recolector";
import { useRutas } from "./use-rutas";

export default function RutasViewer() {
  const {
    paradas,
    rutas,
    opciones,
    opcionSeleccionada,
    rutaActiva,
    mostrarModal,
    handleSeleccion,
    handleAsignarRuta,
    handleConfirmarAsignacion,
    setRutaActiva,
    setMostrarModal,
    puntoSeleccionado,
    setPuntoSeleccionado,
  } = useRutas();

  const { isLoaded } = useGoogleMapsLoader(); // usa siempre el mismo loader

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
          <div>
            <h3 className="text-lg font-semibold">Total de paradas: {paradas.length}</h3>
            <label className="font-medium">Elegí cómo agrupar las rutas:</label>
            <select
              className="border p-2 rounded w-64 ml-2"
              onChange={(e) => handleSeleccion(Number(e.target.value))}
              value={opcionSeleccionada ?? ""}
            >
              <option value="">Seleccioná una opción</option>
              {opciones.map((n) => (
                <option key={n} value={n}>{n} rutas</option>
              ))}
            </select>
          </div>

          {/* Botones de rutas */}
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
        <RutasMap
          rutas={rutas}
          rutaActiva={rutaActiva}
          puntoSeleccionado={puntoSeleccionado}
          setPuntoSeleccionado={setPuntoSeleccionado}
          center={center}
        />

          {/* Lista de rutas */}
          {rutas.length > 0 && (
            <div>
              <h4 className="font-semibold mt-4">Rutas generadas:</h4>
              {rutas.map((ruta) => (
                <div key={ruta.id} className="border p-2 rounded mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="font-bold">Ruta {ruta.id}</h5>
                    <button
                      onClick={() => handleAsignarRuta(ruta)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Asignar ruta
                    </button>
                  </div>
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
        <p>No hay paradas aún...</p>
      )}

      <ModalRecolector
        mostrar={mostrarModal}
        onCerrar={() => setMostrarModal(false)}
        onConfirmar={handleConfirmarAsignacion}
      />
    </div>
  );
}
