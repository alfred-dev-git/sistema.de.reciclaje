import React, { useEffect, useState } from "react";
import {
  getTiposReciclable,
  crearTipoReciclable,
  modificarTipoReciclable,
  TipoReciclable,
} from "../../api/services/reciclables.service";
import { NewTipoModal } from "./new-tipo-modal";
import { EditTipoModal } from "./edit-tipo-modal";

export const ReciclablesViewer = () => {
  const [tipos, setTipos] = useState<TipoReciclable[]>([]);
  const [loading, setLoading] = useState(true);

  const [showNew, setShowNew] = useState(false);
  const [editItem, setEditItem] = useState<TipoReciclable | null>(null);

  const fetchTipos = async () => {
    setLoading(true);
    const res = await getTiposReciclable();
    if (res.success && Array.isArray(res.data)) setTipos(res.data);
    else alert(res.message);
    setLoading(false);
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  const handleCrear = async (data: { descripcion: string }) => {
    const res = await crearTipoReciclable(data);
    alert(res.message);
    if (res.success) fetchTipos();
  };

  const handleEditar = async (id: number, data: { descripcion: string }) => {
    const res = await modificarTipoReciclable(id, data);
    alert(res.message);
    if (res.success) fetchTipos();
  };

  return (
    <div style={container}>
      <div style={headerBar}>
        <h2 className="titulo">♻️ Tipos de reciclables</h2>

        <button
          style={buttonPrimary}
          onClick={() => setShowNew(true)}
        >
          + Nuevo
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div style={listContainer}>
          {tipos.map((t) => (
            <div key={t.idtipo_reciclable} style={card}>
              <span style={{ fontSize: "1rem", fontWeight: 500 }}>
                {t.descripcion}
              </span>

              <button style={editButton} onClick={() => setEditItem(t)}>
                Editar
              </button>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <NewTipoModal
          onGuardar={handleCrear}
          onCerrar={() => setShowNew(false)}
        />
      )}

      <EditTipoModal
        visible={!!editItem}
        tipo={editItem}
        onGuardar={handleEditar}
        onCerrar={() => setEditItem(null)}
      />
    </div>
  );
};


const container: React.CSSProperties = {
  padding: "2rem",
  fontFamily: "Inter, sans-serif",
};

const headerBar: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.5rem",
};


const buttonPrimary: React.CSSProperties = {
  background: "#2ecc71",
  color: "white",
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  transition: "0.2s",
};

const listContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const card: React.CSSProperties = {
  background: "white",
  padding: "16px 20px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderLeft: "5px solid #27ae60",
};

const editButton: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "none",
  color: "white",
  background: "#3498db",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "13px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
};
export default ReciclablesViewer;