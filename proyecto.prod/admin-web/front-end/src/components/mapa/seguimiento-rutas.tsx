import React, { useEffect, useMemo, useState } from "react";
import ModalRecolector from "../Recolector";
import RutasMap from "./rutas-map";
import { RutasPendientesItem } from "../Recolector";
import { useRutas } from "./use-rutas";
import { getTiposReciclable, TipoReciclable } from "../../api/services/reciclables.service";
import FechaRutaModal from "../FechaRutaModal";

export default function SeguimientoRutas() {
  const [tiposReciclable, setTiposReciclable] = useState<TipoReciclable[]>([]);
  useEffect(() => {
    async function cargarTipos() {
      const res = await getTiposReciclable();

      if (res.success && Array.isArray(res.data)) {
        setTiposReciclable(res.data);
      }
    }
    cargarTipos();
  }, []);
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
    notificarRutaExistente,
    modificarFechaRuta,
  } = useRutas("seguimiento");

  const [loading, setLoading] = useState(false);
  const [rutaFecha, setRutaFecha] = useState<number | null>(null);

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
              <button
                onClick={() => setMostrarModal(true)}
                className="button button-ruta"
              >
                Seleccionar otro recolector
              </button>
              <div className="info-recolector">
                <p>
                  Recolector: {recolectorSeleccionado.recolector}
                </p>
                <p>
                  Teléfono: {recolectorSeleccionado.telefono}
                </p>
              </div>
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
                  className={`button button-ruta ${rutaActiva === r.id ? "button-activa" : ""
                    }`}
                >
                  Ruta #{r.id}
                </button>
                <p className="tipo-ruta">
                  Tipo de reciclable: {tiposReciclable.find(
                    (tipo) => tipo.idtipo_reciclable === r.paradas[0]?.tipo_reciclable_idtipo_reciclable
                  )?.descripcion ?? "Sin especificar"}
                </p>
                <p className="fecha-ruta">Programada: {r.paradas[0]?.fecha_programada ? new Date(r.paradas[0].fecha_programada).toLocaleString("es-AR") : "Sin fecha"}</p>

                <div className="acciones-ruta">
                  <div className="notificacion-ruta-accion">
                    <span>Notificar inicio de recolección</span>
                    <button
                      onClick={() => notificarRutaExistente(r.id)}
                      className={`button ${r.paradas[0]?.fue_notificada ? "button-notificado" : "button-ruta"}`}
                    >
                      Notificar {r.paradas[0]?.fue_notificada ? "✓" : ""}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setRutaParaCambio(r.id);
                      setMostrarModal(true);
                    }}
                    className="button button-modificar"
                  >
                    Modificar recolector
                  </button>
                  <button onClick={() => setRutaFecha(r.id)} className="button button-fecha">Modificar fecha</button>
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
                    className="button button-eliminar"
                  >
                    Anular Ruta
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
          tiposReciclable={tiposReciclable}
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
      <FechaRutaModal
        mostrar={rutaFecha !== null}
        titulo="Modificar fecha de la ruta"
        onCerrar={() => setRutaFecha(null)}
        onConfirmar={async (fecha) => {
          if (rutaFecha !== null && await modificarFechaRuta(rutaFecha, fecha)) setRutaFecha(null);
        }}
      />
    </div>
  );
}
