import React, { useState, useEffect } from "react";
import ModalRecolector, { RutasPendientesItem } from "../Recolector";
import RutasMap from "./rutas-map";
import { obtenerRutasPorRecolector } from "./agrupador-rutas";
import { RutaAgrupada } from "./agrupador-rutas";
import { updateRutaRecolector } from "../../api/services/paradas.service";

export default function Seguimiento() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [recolectorSeleccionado, setRecolectorSeleccionado] =
    useState<RutasPendientesItem | null>(null);

  const [rutas, setRutas] = useState<RutaAgrupada[]>([]);
  const [rutaActiva, setRutaActiva] = useState<number | null>(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [rutaParaCambio, setRutaParaCambio] = useState<number | null>(null); // para saber a qué ruta se cambia el recolector

  useEffect(() => {
    const fetchRutas = async () => {
      if (!recolectorSeleccionado?.idrecolector) return;
      setLoading(true);
      try {
        const data = await obtenerRutasPorRecolector(recolectorSeleccionado.idrecolector);
        setRutas(data);
      } catch (error) {
        console.error("Error al obtener rutas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRutas();
  }, [recolectorSeleccionado]);

  const handleConfirmarRecolector = async (recolector: RutasPendientesItem) => {
    if (rutaParaCambio !== null) {
      try {
        const resultado = await updateRutaRecolector(rutaParaCambio, recolector.idrecolector);

        if (!resultado.success) {
          // ⚠️ Error lógico: mismo recolector o problema
          alert(`No se pudo actualizar: ${resultado.message}`);
          console.warn("Error lógico al actualizar recolector:", resultado.message);
          setRutaParaCambio(null);
          return;
        }

        // ✅ Si todo va bien
        alert(`Recolector de la ruta ${rutaParaCambio} actualizado correctamente.`);

        // Refrescar rutas
        if (recolectorSeleccionado) {
          const data = await obtenerRutasPorRecolector(recolectorSeleccionado.idrecolector);
          setRutas(data);
        }

        setRutaParaCambio(null);

      } catch (error) {
        alert("Error al actualizar recolector. Revisa la consola.");
        console.error(error);
      }
    } else {
      setRecolectorSeleccionado(recolector);
    }

    setMostrarModal(false);
  };

  const center = React.useMemo(() => {
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
                    rutaActiva === r.id ? "bg-blue-600" : "bg-gray-500 hover:bg-gray-600"
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
