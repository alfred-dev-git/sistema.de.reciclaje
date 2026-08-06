import React, { useEffect, useMemo, useState } from "react";
import { useGoogleMapsLoader } from "./use-google-maps-loader";
import RutasMap from "./rutas-map";
import ModalRecolector from "../Recolector";
import FechaRutaModal from "../FechaRutaModal";
import { useRutas } from "./use-rutas";
import { getTiposReciclable, TipoReciclable } from "../../api/services/reciclables.service";

const POR_PAGINA = 8;
export default function RutasViewer() {
  const [tipos, setTipos] = useState<TipoReciclable[]>([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<number | null>(null);
  const [pagina, setPagina] = useState(1);
  useEffect(() => { getTiposReciclable().then((r) => r.success && Array.isArray(r.data) && setTipos(r.data)); }, []);
  const h = useRutas("planificacion", tipoSeleccionado);
  const { isLoaded } = useGoogleMapsLoader();
  const paginas = Math.max(1, Math.ceil(h.paradas.length / POR_PAGINA));
  const visibles = h.paradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const center = useMemo(() => h.paradas.length ? { lat: Number(h.paradas[0].latitud), lng: Number(h.paradas[0].longitud) } : { lat: -27.362159, lng: -55.950874 }, [h.paradas]);
  useEffect(() => setPagina(1), [tipoSeleccionado]);
  if (!isLoaded) return <p>Cargando mapa...</p>;
  return <div className="MapContainer" style={{ display: "flex", gap: 16 }}>
    <div className="panel-lateral" style={{ width: 440 }}>
      <div className="container-info-rutas"><h3 className="titulo">Seleccioná tipo de reciclable</h3>
        <select value={tipoSeleccionado ?? ""} onChange={(e) => setTipoSeleccionado(e.target.value ? Number(e.target.value) : null)}>
          <option value="">Elegí un tipo</option>{tipos.map((t) => <option key={t.idtipo_reciclable} value={t.idtipo_reciclable}>{t.descripcion}</option>)}
        </select>
      </div>
      {tipoSeleccionado === null ? <p className="mensaje-rutas">Elegí un tipo de reciclable para ver las solicitudes.</p> : <>
        <div className="container-info-rutas"><h3 className="titulo">Solicitudes disponibles: {h.paradas.length}</h3><p>Seleccionadas: {h.seleccionadas.length}</p></div>
        <div className="lista-solicitudes-ruta">
          {visibles.map((p) => <label key={p.idpedidos} className="solicitud-ruta-item"><input type="checkbox" checked={h.seleccionadas.includes(p.idpedidos)} onChange={() => h.alternarSolicitud(p.idpedidos)} /><span><strong>{p.calle} {p.numero}</strong><small>{p.nombre} {p.apellido} · Solicitud #{p.idpedidos}</small></span></label>)}
          {!h.paradas.length && <p>No existen solicitudes para este tipo de reciclable.</p>}
        </div>
        {h.paradas.length > POR_PAGINA && <div className="paginacion-rutas"><button disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>&lt;</button>{Array.from({ length: paginas }, (_, i) => i + 1).map((n) => <button className={n === pagina ? "activa" : ""} onClick={() => setPagina(n)} key={n}>{n}</button>)}<button disabled={pagina === paginas} onClick={() => setPagina((p) => p + 1)}>&gt;</button></div>}
        <button className="button button-crear crear-ruta-seleccion" disabled={!h.seleccionadas.length} onClick={h.crearRuta}>Crear ruta</button>
      </>}
    </div>
    <div className="area-mapa" style={{ flex: 1 }}><RutasMap rutas={h.rutas} rutaActiva={h.rutaActiva} puntoSeleccionado={h.puntoSeleccionado} setPuntoSeleccionado={h.setPuntoSeleccionado} tiposReciclable={tipos} center={center} /></div>
    <ModalRecolector mostrar={h.mostrarModal} onCerrar={() => h.setMostrarModal(false)} onConfirmar={h.elegirRecolectorAsignacion} />
    <FechaRutaModal mostrar={h.mostrarModalFecha} onCerrar={() => h.setMostrarModalFecha(false)} onConfirmar={h.confirmarAsignacion} />
  </div>;
}
