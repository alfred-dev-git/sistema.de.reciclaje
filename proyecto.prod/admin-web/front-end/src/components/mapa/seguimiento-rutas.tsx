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

  // 📦 cargar rutas cuando cambia el recolector
  useEffect(() => {
    const fetchRutas = async () => {
      if (!recolectorSeleccionado?.idrecolector) return;
      setLoading(true);
      await cargarRutasPorRecolector(recolectorSeleccionado.idrecolector);
      setLoading(false);
    };

    fetchRutas();
  }, [recolectorSeleccionado]);

  // 💾 confirmar selección o cambio de recolector
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
    <div className="MapContainer">
      {/*Panel lateral*/}
      <div className="panel-lateral">
        <div className="container-info-rutas">
          <h3 className="titulo">Seguimiento de rutas</h3>

          {!recolectorSeleccionado ? (
            <button
              onClick={() => setMostrarModal(true)}
              className="button button-ruta"
            >
              Seleccionar recolector
            </button>
          ) : (
            <>
              <div className="info-recolector">
                <p>
                  Recolector: {recolectorSeleccionado.recolector}
                </p>
                <p>
                  Teléfono: {recolectorSeleccionado.telefono}
                </p>
              </div>

              <button
                onClick={() => setMostrarModal(true)}
                className="button button-secundario"
              >
                Cambiar recolector
              </button>
            </>
          )}
        </div>

        {loading ? (
          <p className="mt-4">Cargando rutas...</p>
        ) : rutas.length > 0 ? (
          <div className="container-botones-rutas">
            {rutas.map((r) => (
              <div key={r.id} className="container-ruta-detalles">
                <button
                  onClick={() => setRutaActiva(r.id)}
                  className={`button button-ruta ${
                    rutaActiva === r.id ? "button-activa" : ""
                  }`}
                >
                  Ruta {r.id}
                </button>

                <div className="acciones-ruta">
                  <button
                    onClick={() => {
                      setRutaParaCambio(r.id);
                      setMostrarModal(true);
                    }}
                    className="button button-amarillo"
                  >
                    Cambiar recolector
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `¿Seguro que deseas anular la ruta ${r.id}? (solo anulará paradas no completadas)`
                        )
                      ) {
                        anularRutaExistente(r.id);
                      }
                    }}
                    className="button button-rojo"
                  >
                    Anular
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          recolectorSeleccionado && (
            <p>No hay rutas activas.</p>
          )
        )}
      </div>

      {/* Área del mapa */}
      <div className="area-mapa">
        <RutasMap
          rutas={rutas}
          rutaActiva={rutaActiva}
          puntoSeleccionado={puntoSeleccionado}
          setPuntoSeleccionado={setPuntoSeleccionado}
          center={center}
        />
      </div>

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
