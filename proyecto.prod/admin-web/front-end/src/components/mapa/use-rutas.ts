import { useEffect, useMemo, useState } from "react";
import { obtenerParadas, PedidoAsignado, updateRutaRecolector } from "../../api/services/paradas.service";
import { postAsignarRuta, anularRuta, notificarRuta, actualizarFechaRuta } from "../../api/services/recolector.service";
import { RutasPendientesItem } from "../Recolector";
import { obtenerRutasPorRecolector, RutaAgrupada } from "./agrupador-rutas";

const distancia = (a: PedidoAsignado, b: PedidoAsignado) => {
  const x = Number(a.latitud) - Number(b.latitud);
  const y = Number(a.longitud) - Number(b.longitud);
  return Math.sqrt(x * x + y * y);
};

function ordenarSolicitudes(paradas: PedidoAsignado[]) {
  const grupos = new Map<string, PedidoAsignado[]>();
  [...paradas].sort((a, b) => a.calle.localeCompare(b.calle, "es", { sensitivity: "base" }))
    .forEach((p) => {
      const inicial = p.calle.trim().charAt(0).toLocaleUpperCase("es");
      grupos.set(inicial, [...(grupos.get(inicial) || []), p]);
    });
  return [...grupos.keys()].sort((a, b) => a.localeCompare(b, "es")).flatMap((inicial) => {
    const pendientes = [...(grupos.get(inicial) || [])];
    const ordenadas: PedidoAsignado[] = [];
    let actual = pendientes.shift();
    if (actual) ordenadas.push(actual);
    while (actual && pendientes.length) {
      pendientes.sort((a, b) => distancia(actual!, a) - distancia(actual!, b));
      actual = pendientes.shift();
      if (actual) ordenadas.push(actual);
    }
    return ordenadas;
  });
}

export function useRutas(modo: "planificacion" | "seguimiento" = "planificacion", tipoReciclable: number | null = null) {
  const [todasLasParadas, setTodasLasParadas] = useState<PedidoAsignado[]>([]);
  const [rutas, setRutas] = useState<RutaAgrupada[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [rutaActiva, setRutaActiva] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalFecha, setMostrarModalFecha] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaAgrupada | null>(null);
  const [recolectorAsignacion, setRecolectorAsignacion] = useState<RutasPendientesItem | null>(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PedidoAsignado | null>(null);
  const [recolectorSeleccionado, setRecolectorSeleccionado] = useState<RutasPendientesItem | null>(null);
  const [rutaParaCambio, setRutaParaCambio] = useState<number | null>(null);

  useEffect(() => {
    if (modo !== "planificacion") return;
    obtenerParadas().then(setTodasLasParadas).catch((err) => console.error("Error cargando solicitudes:", err));
  }, [modo]);

  const paradas = useMemo(() => ordenarSolicitudes(tipoReciclable === null ? [] :
    todasLasParadas.filter((p) => p.tipo_reciclable_idtipo_reciclable === tipoReciclable)),
  [tipoReciclable, todasLasParadas]);

  useEffect(() => { setSeleccionadas([]); setRutas([]); setRutaActiva(null); }, [tipoReciclable]);

  const alternarSolicitud = (id: number) => setSeleccionadas((prev) =>
    prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);

  const crearRuta = () => {
    const elegidas = paradas.filter((p) => seleccionadas.includes(p.idpedidos));
    if (!elegidas.length) return alert("Seleccioná al menos una solicitud para crear la ruta.");
    const ruta = { id: 1, paradas: elegidas };
    setRutas([ruta]); setRutaSeleccionada(ruta); setRutaActiva(1); setMostrarModal(true);
  };

  const elegirRecolectorAsignacion = (recolector: RutasPendientesItem) => {
    setRecolectorAsignacion(recolector); setMostrarModal(false); setMostrarModalFecha(true);
  };

  const confirmarAsignacion = async (fecha: string) => {
    if (!rutaSeleccionada || !recolectorAsignacion) return;
    const result = await postAsignarRuta({
      idrecolector: recolectorAsignacion.idrecolector,
      pedidos: rutaSeleccionada.paradas.map((p) => p.idpedidos),
      fecha_programada: fecha,
    });
    if (!result.success) return alert(`Error al asignar ruta: ${result.message}`);
    alert(`Ruta asignada correctamente a ${recolectorAsignacion.recolector}`);
    setMostrarModalFecha(false); setRutaSeleccionada(null); setRecolectorAsignacion(null);
    setSeleccionadas([]); setRutas([]); setRutaActiva(null); setPuntoSeleccionado(null);
    setTodasLasParadas(await obtenerParadas());
  };

  const cargarRutasPorRecolector = async (id: number) => setRutas(await obtenerRutasPorRecolector(id));
  const actualizarRecolectorRuta = async (idRuta: number, recolector: RutasPendientesItem) => {
    const r = await updateRutaRecolector(idRuta, recolector.idrecolector); alert(r.message);
    if (r.success && recolectorSeleccionado) await cargarRutasPorRecolector(recolectorSeleccionado.idrecolector);
  };
  const anularRutaExistente = async (id: number) => {
    const r = await anularRuta(id); alert(r.message);
    if (r.success && recolectorSeleccionado) await cargarRutasPorRecolector(recolectorSeleccionado.idrecolector);
  };
  const notificarRutaExistente = async (id: number) => {
    const mensaje = prompt("Mensaje para los contribuyentes de esta ruta:");
    if (!mensaje?.trim()) return;
    const r = await notificarRuta(id, mensaje.trim()); alert(r.message);
    if (r.success && recolectorSeleccionado) await cargarRutasPorRecolector(recolectorSeleccionado.idrecolector);
  };
  const modificarFechaRuta = async (id: number, fecha: string) => {
    const r = await actualizarFechaRuta(id, fecha); alert(r.message);
    if (r.success && recolectorSeleccionado) await cargarRutasPorRecolector(recolectorSeleccionado.idrecolector);
    return r.success;
  };

  return { rutas, paradas, seleccionadas, alternarSolicitud, crearRuta, rutaActiva, setRutaActiva,
    puntoSeleccionado, setPuntoSeleccionado, mostrarModal, setMostrarModal, mostrarModalFecha,
    setMostrarModalFecha, elegirRecolectorAsignacion, confirmarAsignacion, recolectorSeleccionado,
    setRecolectorSeleccionado, rutaParaCambio, setRutaParaCambio, cargarRutasPorRecolector,
    actualizarRecolectorRuta, anularRutaExistente, notificarRutaExistente, modificarFechaRuta };
}
