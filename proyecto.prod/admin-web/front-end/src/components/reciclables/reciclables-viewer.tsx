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
    <div>
      <h2>♻️ Tipos de reciclables</h2>

      <button onClick={() => setShowNew(true)} style={{ marginBottom: "1rem" }}>
        ➕ Nuevo
      </button>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ul>
          {tipos.map((t) => (
            <li key={t.idtipo_reciclable}>
              {t.descripcion}{" "}
              <button onClick={() => setEditItem(t)}>✏️</button>
            </li>
          ))}
        </ul>
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
export default ReciclablesViewer;