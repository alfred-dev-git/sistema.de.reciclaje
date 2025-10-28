import React, { useEffect, useState } from "react";
import { getCronograma } from "../../api/services/cronograma.service";
import "./cronograma.css";

interface CronogramaItem {
  dia_semana: number;
  semana_mes: number;
  hora_inicio: string;
  hora_fin: string;
  tipo_reciclable: string;
}

const CronogramaViewer: React.FC = () => {
  const [cronograma, setCronograma] = useState<CronogramaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const obtenerNombreDia = (dia: number) => {
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    return dias[dia - 1] || "Día inválido";
  };

  const obtenerNombreSemana = (semana: number) => {
    switch (semana) {
      case 1: return "Primera semana";
      case 2: return "Segunda semana";
      case 3: return "Tercera semana";
      case 4: return "Cuarta semana";
      default: return "Semana inválida";
    }
  };

  useEffect(() => {
    const fetchCronograma = async () => {
      try {
        const response = await getCronograma();

        if (response.success && Array.isArray(response.data)) {
          setCronograma(response.data);
        } else {
          window.alert(response.message || "No se encontraron datos del cronograma");
        }
      } catch (error: any) {
        console.error("❌ Error al cargar cronograma:", error);
        window.alert("No se pudo cargar el cronograma, por favor intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchCronograma();
  }, []);

  if (loading) {
    return (
      <div className="cronograma-viewer__estado">
        <div className="loader" />
        <p>Cargando cronograma...</p>
      </div>
    );
  }

  if (cronograma.length === 0) {
    return (
      <div className="cronograma-viewer__estado">
        No hay días de recolección disponibles.
      </div>
    );
  }

  return (
    <div className="cronograma-viewer">
      <h2 className="cronograma-viewer__titulo titulo">🗓 Frecuencias de Recolección</h2>

      <div className="cronograma-list">
        {cronograma.map((item, index) => (
          <button
            key={`${item.dia_semana}-${item.semana_mes}-${index}`}
            className="cronograma-item"
            onClick={() => window.alert(`Detalles: ${obtenerNombreSemana(item.semana_mes)} - ${obtenerNombreDia(item.dia_semana)}`)}
          >

            <div className="cronograma-item__fecha">
              <p className="cronograma-item__semana">
                {obtenerNombreSemana(item.semana_mes)}
              </p>
              <p className="cronograma-item__dia">
                {obtenerNombreDia(item.dia_semana)}
              </p>
            </div>


            <div className="cronograma-item__detalles">
              <p>⏰ Horarios: **{item.hora_inicio} - {item.hora_fin}**</p>
              <p className="cronograma-item__tipo">♻️ Tipo: **{item.tipo_reciclable}**</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CronogramaViewer;
