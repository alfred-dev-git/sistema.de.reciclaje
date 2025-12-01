// src/components/rutas/RutasViewer.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useGoogleMapsLoader } from "./use-google-maps-loader";
import RutasMap from "./rutas-map";
import ModalRecolector from "../Recolector";
import { useRutas } from "./use-rutas";
import { getTiposReciclable, TipoReciclable } from "../../api/services/reciclables.service";

export default function RutasViewer() {
  const [tipos, setTipos] = useState<TipoReciclable[]>([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<number | null>(null);

  // cargamos los tipos al montar
  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await getTiposReciclable();
      if (mounted && res.success && Array.isArray(res.data)) setTipos(res.data);
    }
    load();
    return () => { mounted = false; };
  }, []);

  // hook principal: siempre lo llamamos (orden constante)
  const rutasHook = useRutas("planificacion", tipoSeleccionado);

  // destructuramos lo que necesitamos (rutasHook siempre existe y provee valores por defecto)
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
  } = rutasHook;

  const { isLoaded } = useGoogleMapsLoader();

  const center = useMemo(() => {
    if (paradas.length > 0)
      return { lat: Number(paradas[0].latitud), lng: Number(paradas[0].longitud) };
    return { lat: -27.362159, lng: -55.950874 };
  }, [paradas]);

  if (!isLoaded) return <p>Cargando mapa...</p>;

  return (
    <div className="MapContainer" style={{ display: "flex", gap: 16 }}>
      {/* PANEL LATERAL UNICO */}
      <div className="panel-lateral" style={{ width: 420 }}>
        {/* SELECT OBLIGATORIO */}
        <div className="container-info-rutas">
          <h3 className="titulo">Seleccioná tipo de reciclable</h3>
          <select
            value={tipoSeleccionado ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setTipoSeleccionado(v === "" ? null : Number(v));
            }}
          >
            <option value="">Elegí un tipo</option>
            {tipos.map((t) => (
              <option key={t.idtipo_reciclable} value={t.idtipo_reciclable}>
                {t.descripcion}
              </option>
            ))}
          </select>
        </div>

        {/* MENSAJE SI NO ELIGIÓ */}
        {tipoSeleccionado === null && (
          <div style={{ padding: 16 }}>
            <p>Elegí un tipo de reciclable para ver los pedidos.</p>
          </div>
        )}

        {/* SI YA ELIGIÓ → mostramos info y agrupamiento */}
        {tipoSeleccionado !== null && (
          <>
            <div className="container-info-rutas" style={{ marginTop: 12 }}>
              <h3 className="titulo">Total de paradas: {paradas.length}</h3>
              <label className="font-medium">Elegí cómo agrupar las rutas:</label>
              <select
                onChange={(e) => handleSeleccion(Number(e.target.value))}
                value={opcionSeleccionada ?? ""}
              >
                <option value="">Seleccioná una opción</option>
                {opciones.map((n) => (
                  <option key={n} value={n}>
                    {n} rutas
                  </option>
                ))}
              </select>
            </div>

            {rutas.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <h4 className="titulo">Rutas generadas:</h4>
                {rutas.map((ruta) => (
                  <div key={ruta.id} style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    <div className="container-ruta-detalles" style={{ display: "flex", justifyContent: "space-between" }}>
                      <h5 className="titulo">Ruta {ruta.id}</h5>
                      <div>
                        <button onClick={() => setRutaActiva(ruta.id)} className="button button-ruta">Ver</button>
                        <button onClick={() => handleAsignarRuta(ruta)} className="button button-ruta" style={{ marginLeft: 8 }}>Asignar</button>
                      </div>
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

            {paradas.length === 0 && <p>No hay paradas para este tipo.</p>}
          </>
        )}
      </div>

      {/* AREA MAPA (un solo RutasMap, consistente) */}
      <div className="area-mapa" style={{ flex: 1 }}>
        {/* mostramos el mapa aunque no haya paradas, pero solo habilitamos rutas cuando eligió */}
        <RutasMap
          rutas={rutas}
          rutaActiva={rutaActiva}
          puntoSeleccionado={puntoSeleccionado}
          setPuntoSeleccionado={setPuntoSeleccionado}
          tiposReciclable={tipos}
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
