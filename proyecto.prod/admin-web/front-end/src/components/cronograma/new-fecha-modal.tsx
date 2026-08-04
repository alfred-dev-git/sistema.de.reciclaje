import React, { useState, useEffect } from "react";
import { getTiposReciclable } from "../../api/services/reciclables.service";

interface Props {
  onGuardar: (data: any) => void;
  onCerrar: () => void;
}

export const NuevaFechaModal: React.FC<Props> = ({ onGuardar, onCerrar }) => {
  const [nuevaFecha, setNuevaFecha] = useState({
    dia_semana: 1,
    semana_mes: 1,
    hora_inicio: "",
    hora_fin: "",
    tipo_reciclable_idtipo_reciclable: "",
  });

  const [tiposReciclable, setTiposReciclable] = useState<
    { idtipo_reciclable: number; descripcion: string }[]
  >([]);

  useEffect(() => {
    const fetchTipos = async () => {
      const response = await getTiposReciclable();
      if (response.success && response.data) {
        setTiposReciclable(response.data);
      } else {
        console.error("Error al cargar tipos de reciclable");
      }
    };
    fetchTipos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevaFecha((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = () => {
    onGuardar({
      dia_semana: Number(nuevaFecha.dia_semana),
      semana_mes: Number(nuevaFecha.semana_mes),
      hora_inicio: nuevaFecha.hora_inicio,
      hora_fin: nuevaFecha.hora_fin,
      tipo_reciclable: nuevaFecha.tipo_reciclable_idtipo_reciclable,
    });
    onCerrar();
  };

  // ✅ Chequea si todos los campos requeridos están completos
  const camposCompletos =
    nuevaFecha.hora_inicio &&
    nuevaFecha.hora_fin &&
    nuevaFecha.tipo_reciclable_idtipo_reciclable;

  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <h3>➕ Nueva fecha de recolección</h3>

        <label>Día de la semana:</label>
        <select name="dia_semana" value={nuevaFecha.dia_semana} onChange={handleChange}>
          <option value="1">1 - Lunes</option>
          <option value="2">2 - Martes</option>
          <option value="3">3 - Miércoles</option>
          <option value="4">4 - Jueves</option>
          <option value="5">5 - Viernes</option>
          <option value="6">6 - Sábado</option>
          <option value="7">7 - Domingo</option>
        </select>

        <label>Semana del mes:</label>
        <select name="semana_mes" value={nuevaFecha.semana_mes} onChange={handleChange}>
          <option value="1">1 - Primera</option>
          <option value="2">2 - Segunda</option>
          <option value="3">3 - Tercera</option>
          <option value="4">4 - Cuarta</option>
        </select>

        <label>Hora de inicio:</label>
        <input type="time" name="hora_inicio" value={nuevaFecha.hora_inicio} onChange={handleChange} />

        <label>Hora de fin:</label>
        <input type="time" name="hora_fin" value={nuevaFecha.hora_fin} onChange={handleChange} />

        <label>Tipo de reciclable:</label>
        <select
          name="tipo_reciclable_idtipo_reciclable"
          value={nuevaFecha.tipo_reciclable_idtipo_reciclable}
          onChange={handleChange}
        >
          <option value="">Seleccione un tipo...</option>
          {tiposReciclable.map((tipo) => (
            <option key={tipo.idtipo_reciclable} value={tipo.idtipo_reciclable}>
              {tipo.descripcion}
            </option>
          ))}
        </select>

        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button
            onClick={handleGuardar}
            style={{
              ...btn("green"),
              opacity: camposCompletos ? 1 : 0.5,
              cursor: camposCompletos ? "pointer" : "not-allowed",
            }}
            disabled={!camposCompletos}
          >
            Guardar
          </button>
          <button onClick={onCerrar} style={btn("red")}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos reutilizables
const btn = (color: string) => ({
  backgroundColor:
    color === "green"
      ? "#4CAF50"
      : color === "blue"
      ? "#2196F3"
      : color === "orange"
      ? "#FF9800"
      : color === "red"
      ? "#F44336"
      : "#ccc",
  color: "white",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  cursor: "pointer",
});

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

export const modalContent: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "1.5rem",
  borderRadius: "12px",
  width: "320px",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};
