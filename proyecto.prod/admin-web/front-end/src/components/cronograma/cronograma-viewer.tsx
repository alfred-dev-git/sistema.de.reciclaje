import React, { useEffect, useState } from "react";
import { getCronograma } from "../../api/services/cronograma.service";

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
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div className="loader" /> {/* Puedes poner un spinner CSS */}
        <p>Cargando cronograma...</p>
      </div>
    );
  }

  if (cronograma.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
        No hay días de recolección disponibles.
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>🗓 Frecuencias en el mes</h2>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        {cronograma.map((item, index) => (
          <button
            key={`${item.dia_semana}-${item.semana_mes}-${index}`}
            style={{
              backgroundColor: "#E9F9EF",
              padding: "1rem",
              borderRadius: "12px",
              width: "90%",
              border: "none",
              textAlign: "left",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
            }}
            onClick={() => window.alert(`Detalles: ${obtenerNombreSemana(item.semana_mes)} - ${obtenerNombreDia(item.dia_semana)}`)}
          >
            <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
              📅 {obtenerNombreSemana(item.semana_mes)} - {obtenerNombreDia(item.dia_semana)}
            </p>
            <p>🕒 {item.hora_inicio} - {item.hora_fin}</p>
            <p>♻️ Tipo reciclable: {item.tipo_reciclable}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CronogramaViewer;
