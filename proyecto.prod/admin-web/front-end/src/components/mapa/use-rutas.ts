// src/components/rutas/useRutas.ts
import { useEffect, useState } from "react";
import { obtenerParadas, PedidoAsignado } from "../../api/services/paradas.service";
import { obtenerOpcionesAgrupamiento, agruparParadasPorCercania, RutaAgrupada } from "../mapa/agrupador-rutas";
import { postAsignarRuta } from "../../api/services/recolector.service";
import { RutasPendientesItem } from "../Recolector";

export function useRutas() {
  const [paradas, setParadas] = useState<PedidoAsignado[]>([]);
  const [rutas, setRutas] = useState<RutaAgrupada[]>([]);
  const [opciones, setOpciones] = useState<number[]>([]);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [rutaActiva, setRutaActiva] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaAgrupada | null>(null);
    const [puntoSeleccionado, setPuntoSeleccionado] = useState<PedidoAsignado | null>(null);

  useEffect(() => {
    cargarParadas();
  }, []);

  async function cargarParadas() {
    try {
      const data = await obtenerParadas();
      setParadas(data);
      setOpciones(obtenerOpcionesAgrupamiento(data.length));
    } catch (err) {
      console.error("❌ Error cargando paradas:", err);
    }
  }

  const handleSeleccion = (valor: number) => {
    setOpcionSeleccionada(valor);
    const agrupadas = agruparParadasPorCercania(paradas, valor);
    setRutas(agrupadas);
    setRutaActiva(null);
  };

  const recargarParadas = async () => {
    await cargarParadas();
    setRutas([]);
    setOpcionSeleccionada(null);
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
      await recargarParadas();
    } catch (err) {
      console.error("❌ Error general en asignación:", err);
      alert("Error inesperado al asignar la ruta");
    }
  };

  return {
    paradas,
    rutas,
    opciones,
    opcionSeleccionada,
    rutaActiva,
    mostrarModal,
    rutaSeleccionada,
    puntoSeleccionado,
    handleSeleccion,
    handleAsignarRuta,
    handleConfirmarAsignacion,
    setRutaActiva,
    setMostrarModal,
    setPuntoSeleccionado,
  };
}
