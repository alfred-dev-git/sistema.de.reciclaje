import { useEffect, useState } from "react";
import {
  getCronograma,
  crearFechaRecoleccion,
  lanzarNotificacion,
  modificarFechaRecoleccion,
  anularFechaRecoleccion,
  fechasInactivas,
  activarFechaRecoleccion,
} from "../../api/services/cronograma.service";

export interface CronogramaItem {
  idcronograma_recoleccion: number;
  dia_semana: number;
  semana_mes: number;
  hora_inicio: string;
  hora_fin: string;
  tipo_reciclable: string;
  ultima_notificacion?: string;
  fecha_ultima_notificacion?: string;
}

export const useCronograma = () => {
  const [cronograma, setCronograma] = useState<CronogramaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modoInactivo, setModoInactivo] = useState(false);
  
  const obtenerNombreDia = (dia: number) =>
    ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][dia - 1] || "Día inválido";

  const obtenerNombreSemana = (n: number) =>
    ["", "Primera semana", "Segunda semana", "Tercera semana", "Cuarta semana"][n] || "Semana inválida";

  const fetchCronograma = async (inactivas = false) => {
    setLoading(true);
    try {
      const res = inactivas ? await fechasInactivas() : await getCronograma();
      if (res.success && Array.isArray(res.data)) setCronograma(res.data);
      else alert(res.message || "No se encontraron datos");
    } catch (e) {
      console.error("❌ Error al cargar cronograma:", e);
      alert("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };
    useEffect(() => { fetchCronograma(); }, []);

  const toggleInactivas = async () => {
    const nuevoEstado = !modoInactivo;
    setModoInactivo(nuevoEstado);
    await fetchCronograma(nuevoEstado);
  };
  
  const handleAfterSuccess = async (response: any) => {
    alert(response.message);
    if (response.success) await fetchCronograma();
  };

  const handleNotificar = async (id: number) => {
    const mensaje = prompt("Mensaje de la notificación:");
    if (!mensaje?.trim()) return;
    const res = await lanzarNotificacion({
      idcronograma_recoleccion: id,
      mensaje: mensaje.trim(),
    });
    alert(res.message);
  };

  const handleModificar = async (id: number, data: Partial<CronogramaItem>) => {
  const res = await modificarFechaRecoleccion(id, data);
  handleAfterSuccess(res);
};

    // 🔹 Nuevo método para activar una fecha inactiva
  const handleActivar = async (id: number) => {
    if (!window.confirm("¿Deseas reactivar esta fecha de recolección?")) return;
    const res = await activarFechaRecoleccion(id);
    alert(res.message);
    await fetchCronograma(true); // recarga las inactivas actualizadas
  };

  const handleAnular = async (id: number) => {
    if (!window.confirm("¿Seguro que desea anular esta fecha?")) return;
    const res = await anularFechaRecoleccion(id);
    handleAfterSuccess(res);
  };

  const handleCrear = async (data: any) => {
    const res = await crearFechaRecoleccion(data);
    handleAfterSuccess(res);
  };

  return {
    cronograma,
    loading,
    obtenerNombreDia,
    obtenerNombreSemana,
    handleActivar,
    handleCrear,
    handleNotificar,
    handleModificar,
    handleAnular,
    toggleInactivas,
    modoInactivo,
  };
};
