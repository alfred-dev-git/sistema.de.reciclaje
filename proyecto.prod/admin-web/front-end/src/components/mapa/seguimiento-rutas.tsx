import React, { useEffect, useMemo, useState } from "react";
import ModalRecolector from "../Recolector";
import RutasMap from "./rutas-map";
import { RutasPendientesItem } from "../Recolector";
import { useRutas } from "./use-rutas";

export default function SeguimientoRutas() {
  const {
    rutas,
    rutaActiva,
    setRutaActiva,
    puntoSeleccionado,
    setPuntoSeleccionado,
    mostrarModal,
    setMostrarModal,
    recolectorSeleccionado,
    setRecolectorSeleccionado,
    rutaParaCambio,
    setRutaParaCambio,
    cargarRutasPorRecolector,
    actualizarRecolectorRuta,
    anularRutaExistente,
  } = useRutas("seguimiento");

  const [loading, setLoading] = useState(false);

  // 📦 cuando cambia el recolector seleccionado, cargamos sus rutas
  useEffect(() => {
    const fetchRutas = async () => {
      if (!recolectorSeleccionado?.idrecolector) return;
      setLoading(true);
      await cargarRutasPorRecolector(recolectorSeleccionado.idrecolector);
      setLoading(false);
    };

    fetchRutas();
  }, [recolectorSeleccionado]);

  // 💾 cuando se confirma un recolector (ya sea para selección o cambio)
  const handleConfirmarRecolector = async (recolector: RutasPendientesItem) => {
    if (rutaParaCambio !== null) {
      await actualizarRecolectorRuta(rutaParaCambio, recolector);
      setRutaParaCambio(null);
    } else {
      setRecolectorSeleccionado(recolector);
    }

    setMostrarModal(false);
  };

  // 📍 centro del mapa
  const center = useMemo(() => {
    if (rutas.length > 0 && rutas[0].paradas.length > 0) {
      return {
        lat: Number(rutas[0].paradas[0].latitud),
        lng: Number(rutas[0].paradas[0].longitud),
      };
    }
    return { lat: -27.362159, lng: -55.950874 };
  }, [rutas]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Seguimiento de rutas</h2>

      <button
        onClick={() => setMostrarModal(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Seleccionar recolector
      </button>

      {recolectorSeleccionado && (
        <div className="mt-3">
          <p className="font-medium">
            Recolector seleccionado: {recolectorSeleccionado.recolector}
          </p>
          <p className="text-sm text-gray-600">
            Teléfono: {recolectorSeleccionado.telefono}
          </p>
        </div>
      )}

      {loading ? (
        <p className="mt-4">Cargando rutas...</p>
      ) : rutas.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2 mt-4">
            {rutas.map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <button
                  onClick={() => setRutaActiva(r.id)}
                  className={`px-4 py-2 rounded text-white font-medium ${
                    rutaActiva === r.id
                      ? "bg-blue-600"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  Ruta {r.id}
                </button>

                <button
                  onClick={() => {
                    setRutaParaCambio(r.id);
                    setMostrarModal(true);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Cambiar recolector
                </button>

                <button
                  onClick={() => {
                    if (confirm(`¿Seguro que deseas anular la ruta ${r.id}?(solo anulará paradas que no han sido completadas)`)) {
                      anularRutaExistente(r.id);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Anular ruta
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <RutasMap
              rutas={rutas}
              rutaActiva={rutaActiva}
              puntoSeleccionado={puntoSeleccionado}
              setPuntoSeleccionado={setPuntoSeleccionado}
              center={center}
            />
          </div>
        </>
      ) : (
        recolectorSeleccionado && <p className="mt-4">No hay rutas activas.</p>
      )}

      <ModalRecolector
        mostrar={mostrarModal}
        onCerrar={() => {
          setMostrarModal(false);
          setRutaParaCambio(null);
        }}
        onConfirmar={handleConfirmarRecolector}
      />
    </div>
  );
}
