import React, { useState, CSSProperties } from "react";
import { useCronograma } from "./use-cronograma";
import { NuevaFechaModal } from "./new-fecha-modal";
import { EditarFechaModal } from "./edit-fecha-modal";
import "./cronograma.css";

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
  const [filtroSemana, setFiltroSemana] = useState<number | "">("");

  const abrirEditar = (item: any) => {
    setItemSeleccionado(item);
    setMostrarEditar(true);
  };

  if (loading)
    return <p style={{ textAlign: "center", fontSize: "1.1rem" }}>Cargando...</p>;

  const cronogramaFiltrado =
    filtroSemana === ""
      ? cronograma
      : cronograma.filter(
          (item) => Number(item.semana_mes) === Number(filtroSemana)
        );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🗓 Frecuencias en el mes</h1>

      {/* Barra de acciones */}
      <div style={styles.actions}>
        <button onClick={() => setMostrarModal(true)} style={btn("green")}>
          Cargar nueva fecha
        </button>
        <button onClick={toggleInactivas} style={btn("purple")}>
          {modoInactivo ? " Ver activas" : " Ver inactivas"}
        </button>

        <div style={styles.filter}>
          <label style={styles.label}>Filtrar por semana:</label>
          <select
            value={filtroSemana}
            onChange={(e) =>
              setFiltroSemana(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            style={styles.select}
          >
            <option value="">Todas</option>
            <option value={1}>Primera semana</option>
            <option value={2}>Segunda semana</option>
            <option value={3}>Tercera semana</option>
            <option value={4}>Cuarta semana</option>
          </select>
        </div>
      </div>

      {mostrarModal && (
        <NuevaFechaModal
          onGuardar={handleCrear}
          onCerrar={() => setMostrarModal(false)}
        />
      )}

      {/* Lista de tarjetas */}
      {cronogramaFiltrado.length === 0 ? (
        <p style={styles.empty}>No hay registros para esta semana.</p>
      ) : (
        cronogramaFiltrado.map((item) => (
          <div
            key={`${modoInactivo ? "inactiva" : "activa"}-${item.idcronograma_recoleccion}`}
            style={{
              ...styles.card,
              backgroundColor: modoInactivo ? "#f6f6f6" : "#f8fff9",
              opacity: modoInactivo ? 0.7 : 1,
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={styles.cardTitle}>
                {obtenerNombreDia(item.dia_semana)} -{" "}
                {obtenerNombreSemana(item.semana_mes)}{" "}
                {modoInactivo && <span style={{ color: "#999" }}>(inactiva)</span>}
              </h3>
              <p style={styles.text}><strong>Tipo:</strong> {item.tipo_reciclable}</p>
              <p style={styles.text}>
                <strong>Horario:</strong> {item.hora_inicio} - {item.hora_fin}
              </p>

              {item.ultima_notificacion ? (
                <div style={styles.notificationBox}>
                  <p style={styles.notificationText}>
                    <strong>📩 Última notificación:</strong> {item.ultima_notificacion}
                  </p>
                  {item.fecha_ultima_notificacion && (
                    <p style={styles.notificationText}>
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
                <p style={{ color: "#777", fontStyle: "italic", fontSize: "0.9rem" }}>
                  Sin notificaciones enviadas
                </p>
              )}
            </div>

            {/* Botones */}
            <div style={styles.buttonGroup}>
              {modoInactivo ? (
                <button
                  onClick={() => handleActivar(item.idcronograma_recoleccion)}
                  style={btn("orange")}
                >
                  🔄 Activar
                </button>
              ) : (
                <>
                  <button onClick={() => abrirEditar(item)} style={btn("blue")}>
                    Editar
                  </button>
                  <button
                    onClick={() => handleAnular(item.idcronograma_recoleccion)}
                    style={btn("red")}
                  >
                    Anular
                  </button>
                  <button
                    onClick={() => handleNotificar(item.idcronograma_recoleccion)}
                    style={btn("violet")}
                  >
                    Notificar
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


const styles: Record<string, CSSProperties> = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "2rem 1rem",
    fontFamily: "Segoe UI, Roboto, sans-serif",
    color: "#222",
  },
  title: {
    textAlign: "center" as const,
    fontSize: "1.8rem",
    marginBottom: "1.5rem",
    color: "#2c3e50",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
  },
  filter: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  label: { fontWeight: 500 },
  select: {
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "0.95rem",
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderRadius: "12px",
    border: "1px solid #dcdcdc",
    padding: "1.2rem",
    marginBottom: "1rem",
    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  cardTitle: {
    fontSize: "1.1rem",
    marginBottom: "0.4rem",
    color: "#2e7d32",
  },
  text: { margin: "0.2rem 0", fontSize: "0.95rem" },
  notificationBox: {
    marginTop: "0.5rem",
    backgroundColor: "#eef8ff",
    borderRadius: "8px",
    padding: "0.6rem 0.8rem",
  },
  notificationText: { margin: 0, fontSize: "0.9rem", color: "#333" },
  buttonGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    marginLeft: "1rem",
  },
  empty: {
    textAlign: "center" as const,
    fontSize: "1rem",
    color: "#666",
  },
};

const btn = (color: string): CSSProperties => ({
  backgroundColor:
    color === "green"
      ? "#43a047"
      : color === "blue"
      ? "#1976d2"
      : color === "violet"
      ? "#8e24aa"
      : color === "orange"
      ? "#fb8c00"
      : "#e53935",
  color: "#fff",
  border: "none",
  padding: "0.6rem 1rem",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: "0.9rem",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  minWidth: "100px",
  height: "40px",
  textAlign: "center" as const,
  lineHeight: "1.2",
});
