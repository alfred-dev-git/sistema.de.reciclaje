import React, { useState } from "react";

interface Props {
  onGuardar: (data: { descripcion: string }) => void;
  onCerrar: () => void;
}

export const NewTipoModal: React.FC<Props> = ({ onGuardar, onCerrar }) => {
  const [nombreGeneral, setNombreGeneral] = useState("");
  const [detalle, setDetalle] = useState("");

  const camposCompletos =
    nombreGeneral.trim() !== "" && detalle.trim() !== "";

  const handleSave = () => {
    if (!camposCompletos) return;

    // Construir DESCRIPCIÓN FINAL sin tocar la BD
    const descripcionFinal = `${nombreGeneral.trim()} - (${detalle.trim()})`;

    onGuardar({ descripcion: descripcionFinal });
    onCerrar();
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={content}>
        <h3>➕ Nuevo tipo de reciclable</h3>

        <label>Nombre general:</label>
        <input
          type="text"
          placeholder="Ej: Reciclados"
          value={nombreGeneral}
          onChange={(e) => setNombreGeneral(e.target.value)}
          maxLength={30}
        />

        <label style={{ marginTop: "0.5rem" }}>Descripción:</label>
        <input
          type="text"
          placeholder="Ej: papel, cartón, plástico"
          value={detalle}
          onChange={(e) => setDetalle(e.target.value)}
          maxLength={160}
        />

        <small style={{ display: "block", marginTop: "0.5rem", opacity: 0.7 }}>
          Ejemplo final guardado: <br />
          <b>
            {nombreGeneral || "Reciclados"} - (
            {detalle || "papel, cartón, plástico"})
          </b>
        </small>

        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          <button
            onClick={handleSave}
            disabled={!camposCompletos}
            style={{
              ...btn("green"),
              opacity: camposCompletos ? 1 : 0.5,
            }}
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

// Estilos
const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.4)",
};

const content = {
  background: "#fff",
  padding: "1rem",
  width: "320px",
  borderRadius: "10px",
};

const btn = (color: string) => ({
  backgroundColor: color === "green" ? "#4CAF50" : "#F44336",
  color: "white",
  padding: "0.5rem 1rem",
  border: "none",
  borderRadius: "8px",
});
