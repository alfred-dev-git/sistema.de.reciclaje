//use-rutas.ts
import { useEffect, useState } from "react";
import { obtenerParadas, PedidoAsignado, updateRutaRecolector } from "../../api/services/paradas.service";
import { obtenerOpcionesAgrupamiento, agruparParadasPorCercania, RutaAgrupada } from "../mapa/agrupador-rutas";
import { postAsignarRuta, anularRuta } from "../../api/services/recolector.service";
import { RutasPendientesItem } from "../Recolector";
import { obtenerRutasPorRecolector } from "./agrupador-rutas";

export function useRutas(modo: "planificacion" | "seguimiento" = "planificacion") {
  const [paradas, setParadas] = useState<PedidoAsignado[]>([]);
  const [rutas, setRutas] = useState<RutaAgrupada[]>([]);
  const [opciones, setOpciones] = useState<number[]>([]);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [rutaActiva, setRutaActiva] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaAgrupada | null>(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PedidoAsignado | null>(null);
  const [recolectorSeleccionado, setRecolectorSeleccionado] = useState<RutasPendientesItem | null>(null);
  const [rutaParaCambio, setRutaParaCambio] = useState<number | null>(null);

  // Cargar datos iniciales según el modo
  useEffect(() => {
    if (modo === "planificacion") cargarParadas();
  }, [modo]);

  async function cargarParadas() {
    try {
      const data = await obtenerParadas();
      setParadas(data);
      setOpciones(obtenerOpcionesAgrupamiento(data.length));
    } catch (err) {
      console.error("❌ Error cargando paradas:", err);
    }
  }

  // === PLANIFICACIÓN ===
  const handleSeleccion = (valor: number) => {
    setOpcionSeleccionada(valor);
    const agrupadas = agruparParadasPorCercania(paradas, valor);
    setRutas(agrupadas);
    setRutaActiva(null);
  };

  const handleAsignarRuta = (ruta: RutaAgrupada) => {
    setRutaSeleccionada(ruta);
    setMostrarModal(true);
  };

  const handleConfirmarAsignacion = async (recolector: RutasPendientesItem) => {
    if (!rutaSeleccionada) return;
    const payload = {
      idrecolector: recolector.idrecolector,
      pedidos: rutaSeleccionada.paradas.map((p) => p.idpedidos),
    };

    try {
      const result = await postAsignarRuta(payload);
      if (result.success) {
        alert(`✅ Ruta ${rutaSeleccionada.id} asignada correctamente a ${recolector.recolector}`);
      } else {
        alert(`❌ Error al asignar ruta: ${result.message}`);
      }
      setMostrarModal(false);
      setRutaSeleccionada(null);
      await cargarParadas();
    } catch (err) {
      console.error("❌ Error general en asignación:", err);
      alert("Error inesperado al asignar la ruta");
    }
  };

  // === SEGUIMIENTO ===
  const cargarRutasPorRecolector = async (idrecolector: number) => {
    try {
      const data = await obtenerRutasPorRecolector(idrecolector);
      setRutas(data);
    } catch (error) {
      console.error("Error al obtener rutas:", error);
    }
  };

  const actualizarRecolectorRuta = async (idRuta: number, nuevoRecolector: RutasPendientesItem) => {
    try {
      const resultado = await updateRutaRecolector(idRuta, nuevoRecolector.idrecolector);
      if (!resultado.success) {
        alert(`⚠️ No se pudo actualizar: ${resultado.message}`);
        return;
      }
      alert(`✅ Recolector de la ruta ${idRuta} actualizado correctamente.`);
      if (recolectorSeleccionado)
        await cargarRutasPorRecolector(recolectorSeleccionado.idrecolector);
    } catch (error) {
      console.error("Error actualizando recolector:", error);
      alert("Error al actualizar recolector.");
    }
  };

  const anularRutaExistente = async (idRuta: number) => {
    try {
      const resultado = await anularRuta(idRuta);
      if (resultado.success) {
        alert(`Ruta ${idRuta} anulada correctamente.`);
        if (recolectorSeleccionado)
          await cargarRutasPorRecolector(recolectorSeleccionado.idrecolector);
      } else {
        alert(`Error: ${resultado.message}`);
      }
    } catch (error) {
      alert("Error al anular la ruta.");
      console.error(error);
    }
  };

  return {
    // comunes
    rutas,
    rutaActiva,
    setRutaActiva,
    puntoSeleccionado,
    setPuntoSeleccionado,
    mostrarModal,
    setMostrarModal,

    // planificación
    modo,
    paradas,
    opciones,
    opcionSeleccionada,
    handleSeleccion,
    handleAsignarRuta,
    handleConfirmarAsignacion,

    // seguimiento
    recolectorSeleccionado,
    setRecolectorSeleccionado,
    rutaParaCambio,
    setRutaParaCambio,
    cargarRutasPorRecolector,
    actualizarRecolectorRuta,
    anularRutaExistente,
  };
}
