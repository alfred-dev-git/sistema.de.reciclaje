import React, { useState } from "react";
import { useCronograma } from "./use-cronograma";
import { NuevaFechaModal } from "./new-fecha-modal";
import { EditarFechaModal } from "./edit-fecha-modal";
const CronogramaViewer: React.FC = () => {
  const {
    cronograma,
    loading,
    obtenerNombreDia,
    obtenerNombreSemana,
    handleCrear,
    handleNotificar,
    handleModificar,
    handleAnular,
    handleActivar,
    toggleInactivas,
    modoInactivo,
  } = useCronograma();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState<any>(null);
  const [filtroSemana, setFiltroSemana] = useState<number | "">(""); // nueva variable para filtro

  const abrirEditar = (item: any) => {
    setItemSeleccionado(item);
    setMostrarEditar(true);
  };

  if (loading) return <p style={{ textAlign: "center" }}>Cargando...</p>;

  // 🔍 Filtrar por semana si el usuario seleccionó una
const cronogramaFiltrado =
  filtroSemana === ""
    ? cronograma
    : cronograma.filter((item) => Number(item.semana_mes) === Number(filtroSemana));

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ textAlign: "center" }}>🗓 Frecuencias en el mes</h2>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1rem" }}>
      <button onClick={() => setMostrarModal(true)} style={btn("green")}>
        ➕ Cargar nueva fecha
      </button>

      <button onClick={toggleInactivas} style={btn("blue")}>
        {modoInactivo ? "🔙 Ver activas" : "🕒 Ver inactivas"}
      </button>
    </div>

      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <label style={{ marginRight: "0.5rem" }}>Filtrar por semana:</label>
        <select
          value={filtroSemana}
          onChange={(e) =>
            setFiltroSemana(e.target.value === "" ? "" : Number(e.target.value))
          }
          style={{ padding: "0.4rem", borderRadius: "6px" }}
        >
          <option value="">Todas</option>
          <option value={1}>Primera semana</option>
          <option value={2}>Segunda semana</option>
          <option value={3}>Tercera semana</option>
          <option value={4}>Cuarta semana</option>
        </select>
      </div>
      
      {mostrarModal && (
        <NuevaFechaModal
          onGuardar={handleCrear}
          onCerrar={() => setMostrarModal(false)}
        />
      )}

      {cronogramaFiltrado.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          No hay registros para esta semana.
        </p>
      ) : (
        cronogramaFiltrado.map((item) => (
          <div
            key={`${modoInactivo ? "inactiva" : "activa"}-${item.idcronograma_recoleccion}`}
            style={{
              backgroundColor: modoInactivo ? "#f2f2f2" : "#E9F9EF",
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "1rem",
              opacity: modoInactivo ? 0.6 : 1, // 👈 más opaco cuando está inactivo
              marginBottom: "1rem",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ margin: 0 }}>
              {obtenerNombreDia(item.dia_semana)} - {obtenerNombreSemana(item.semana_mes)}
              {modoInactivo && <span style={{ color: "#777" }}> (inactiva)</span>}
            </h3>
            <p>Tipo: {item.tipo_reciclable}</p>
            <p>
              Horario: {item.hora_inicio} - {item.hora_fin}
            </p>
            {/* ✅ Mostrar última notificación si existe */}
            {item.ultima_notificacion ? (
              <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#555" }}>
                <p>
                  <strong>📩 Última notificación:</strong> {item.ultima_notificacion}
                </p>
                {item.fecha_ultima_notificacion && (
                  <p>
                    <strong>📅 Enviada:</strong>{" "}
                     {new Date(item.fecha_ultima_notificacion).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            ) : (
              <p style={{ color: "#888", fontSize: "0.9rem" }}>Sin notificaciones enviadas</p>
            )}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              {modoInactivo ? (
                <button
                  onClick={() => handleActivar(item.idcronograma_recoleccion)}
                  style={btn("orange")}
                >
                  🔄 Activar
                </button>
              ) : (
                <>
                  <button
                    onClick={() => abrirEditar(item)}
                    style={btn("blue")}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleAnular(item.idcronograma_recoleccion)}
                    style={btn("red")}
                  >
                    🚫 Anular
                  </button>
                  <button
                    onClick={() => handleNotificar(item.idcronograma_recoleccion)}
                    style={btn("purple")}
                  >
                    🔔 Notificar
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}


      {mostrarEditar && itemSeleccionado && (
        <EditarFechaModal
          visible={mostrarEditar}
          item={itemSeleccionado}
          onCerrar={() => setMostrarEditar(false)}
          onGuardar={(data) =>
            handleModificar(itemSeleccionado.idcronograma_recoleccion, data)
          }
        />
      )}
    </div>
  );
};

export default CronogramaViewer;

const btn = (color: string) => ({
  backgroundColor:
    color === "green"
      ? "#4CAF50"
      : color === "blue"
      ? "#8a00bcff"
      : color === "orange"
      ? "#FF9800"
      : color === "red"
      ? "#F44336"
      : "#0400ffff",
  color: "white",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  cursor: "pointer",
});
