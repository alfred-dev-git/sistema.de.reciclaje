// src/components/rutas/RutasViewer.tsx
import React from "react";
import { useJsApiLoader } from "@react-google-maps/api";
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

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const center = React.useMemo(() => {
    if (paradas.length > 0)
      return { lat: Number(paradas[0].latitud), lng: Number(paradas[0].longitud) };
    return { lat: -27.362159, lng: -55.950874 };
  }, [paradas]);

  if (!isLoaded) return <p>Cargando mapa...</p>;

  return (
    <div className="MapContainer">
      {/* Panel lateral izquierdo */}
      <div className="panel-lateral">
        {paradas.length > 0 ? (
          <>
            <div className="container-info-rutas">
              <h3 className="titulo">Total de paradas: {paradas.length}</h3>
              <label className="font-medium">Elegí cómo agrupar las rutas:</label>
              <select
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
              <div className="container-botones-rutas">
                {rutas.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRutaActiva(r.id)}
                    className="button button-ruta"
                  >
                    Ruta {r.id}
                  </button>
                ))}
              </div>
            )}

            {/* Lista de rutas */}
            {rutas.length > 0 && (
              <div>
                <h4 className="titulo">Rutas generadas:</h4>
                {rutas.map((ruta) => (
                  <div key={ruta.id} className="">
                    <div className="container-ruta-detalles">
                      <h5 className="titulo">Ruta {ruta.id}</h5>
                      <button
                        onClick={() => handleAsignarRuta(ruta)}
                        className="button button-ruta"
                      >
                        Asignar ruta
                      </button>
                    </div>
                    <ul>
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
      </div>

      {/* Mapa a la derecha */}
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
        onCerrar={() => setMostrarModal(false)}
        onConfirmar={handleConfirmarAsignacion}
      />
    </div>
  );
}
