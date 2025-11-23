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

  // Desarma la descripción almacenada en BD
  useEffect(() => {
    if (tipo) {
      const desc = tipo.descripcion;

      // formato esperado: "Nombre - (detalle)"
      const [nombre, resto] = desc.split(" - (");

      setNombreGeneral(nombre || "");

      // quitar paréntesis finales:
      const detalleLimpio = resto ? resto.replace(/\)$/, "") : "";
      setDetalle(detalleLimpio);
    }
  }, [tipo]);

  if (!visible || !tipo) return null;

  const camposCompletos =
    nombreGeneral.trim() !== "" && detalle.trim() !== "";

  // Primer click → mostrar confirmación
  const handleTrySave = () => {
    if (!camposCompletos) return;
    setShowConfirm(true);
  };

  // Confirmación final
  const handleConfirmSave = () => {
    const descripcionFinal = `${nombreGeneral.trim()} - (${detalle.trim()})`;

    onGuardar(tipo.idtipo_reciclable, { descripcion: descripcionFinal });
    setShowConfirm(false);
    onCerrar();
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={content}>
        {!showConfirm ? (
          <>
            <h3>✏️ Editar tipo</h3>

            <label>Nombre general:</label>
            <input
              type="text"
              value={nombreGeneral}
              onChange={(e) => setNombreGeneral(e.target.value)}
              maxLength={30}
            />

            <label style={{ marginTop: "0.5rem" }}>Descripción:</label>
            <input
              type="text"
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              maxLength={160}
            />

            <small style={{ display: "block", marginTop: "0.5rem", opacity: 0.7 }}>
              Ejemplo final guardado: <br />
              <b>
                {nombreGeneral || "Reciclados"} - ({detalle || "papel, cartón, plástico"})
              </b>
            </small>

            <div style={{ display: "flex", marginTop: "1rem", gap: "0.5rem" }}>
              <button
                onClick={handleTrySave}
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
          </>
        ) : (
          <>
            <h3>⚠️ Confirmar modificación</h3>
            <p style={{ marginTop: "0.5rem" }}>
              ¿Está seguro de modificar? <br />
              <b>
                Al hacerlo también afectará el cronograma donde aparezca este
                tipo de residuo.
              </b>
            </p>

            <div style={{ display: "flex", marginTop: "1rem", gap: "0.5rem" }}>
              <button onClick={handleConfirmSave} style={btn("green")}>
                Confirmar
              </button>

              <button
                onClick={() => setShowConfirm(false)}
                style={btn("red")}
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// estilos
const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.5)",
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
  borderRadius: "8px",
});
