import React, { useState, useEffect } from "react";
import { TipoReciclable } from "../../api/services/reciclables.service";

interface Props {
  visible: boolean;
  tipo: TipoReciclable | null;
  onGuardar: (id: number, data: { descripcion: string }) => void;
  onCerrar: () => void;
}

export const EditTipoModal: React.FC<Props> = ({
  visible,
  tipo,
  onGuardar,
  onCerrar,
}) => {
  const [nombreGeneral, setNombreGeneral] = useState("");
  const [detalle, setDetalle] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (tipo) {
      const desc = tipo.descripcion;
      const [nombre, resto] = desc.split(" - (");
      setNombreGeneral(nombre || "");
      const detalleLimpio = resto ? resto.replace(/\)$/, "") : "";
      setDetalle(detalleLimpio);
    }
  }, [tipo]);

  if (!visible || !tipo) return null;

  const camposCompletos =
    nombreGeneral.trim() !== "" && detalle.trim() !== "";

  const handleTrySave = () => {
    if (!camposCompletos) return;
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    const descripcionFinal = `${nombreGeneral.trim()} - (${detalle.trim()})`;
    onGuardar(tipo.idtipo_reciclable, { descripcion: descripcionFinal });
    setShowConfirm(false);
    onCerrar();
  };

  return (
    <div style={modalOverlay}>
      <div style={modalCard}>
        {!showConfirm ? (
          <>
            <h3 style={titulo}>✏️ Editar tipo</h3>

            <label style={label}>Nombre general:</label>
            <input
              style={input}
              type="text"
              value={nombreGeneral}
              onChange={(e) => setNombreGeneral(e.target.value)}
              maxLength={30}
            />

            <label style={label}>Descripción:</label>
            <input
              style={input}
              type="text"
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              maxLength={160}
            />

            <small style={preview}>
              Ejemplo final guardado:
              <br />
              <b>
                {nombreGeneral || "Reciclados"} - (
                {detalle || "papel, cartón, plástico"})
              </b>
            </small>

            <div style={actionsRow}>
              <button
                onClick={handleTrySave}
                disabled={!camposCompletos}
                style={{
                  ...btn("green"),
                  opacity: camposCompletos ? 1 : 0.6,
                }}
              >
                Guardar
              </button>

              <button onClick={onCerrar} style={btn("red")}>
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 style={titulo}>⚠️ Confirmar modificación</h3>

            <p style={confirmText}>
              ¿Está seguro de modificar?
              <br />
              <b>
                Esta acción también afectará el cronograma donde se utilice este
                tipo de residuo.
              </b>
            </p>

            <div style={actionsRow}>
              <button onClick={handleConfirmSave} style={btn("green")}>
                Confirmar
              </button>
              <button onClick={() => setShowConfirm(false)} style={btn("red")}>
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};



const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backdropFilter: "blur(3px)",
  zIndex: 999,
};

const modalCard: React.CSSProperties = {
  background: "#fff",
  padding: "1.4rem",
  width: "350px",
  borderRadius: "14px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
  animation: "fadeIn 0.25s ease-out",
};

const titulo: React.CSSProperties = {
  marginBottom: "1rem",
  fontSize: "1.3rem",
  textAlign: "center",
  fontWeight: 600,
};

const label: React.CSSProperties = {
  marginTop: "0.7rem",
  marginBottom: "0.2rem",
  fontWeight: 500,
};

const input: React.CSSProperties = {
  padding: "0.55rem",
  borderRadius: "8px",
  border: "1px solid #ccc",
  width: "100%",
  outline: "none",
  transition: "0.2s",
};

const preview: React.CSSProperties = {
  display: "block",
  marginTop: "0.8rem",
  opacity: 0.75,
  fontSize: "0.85rem",
};

const actionsRow: React.CSSProperties = {
  display: "flex",
  marginTop: "1.2rem",
  gap: "0.7rem",
  justifyContent: "center",
};

const confirmText: React.CSSProperties = {
  marginTop: "0.6rem",
  textAlign: "center",
  lineHeight: "1.4rem",
};

const btn = (color: string) => ({
  backgroundColor: color === "green" ? "#2ecc71" : "#e74c3c",
  border: "none",
  padding: "0.55rem 1rem",
  color: "white",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  transition: "0.2s",
  width: "100%",
});
