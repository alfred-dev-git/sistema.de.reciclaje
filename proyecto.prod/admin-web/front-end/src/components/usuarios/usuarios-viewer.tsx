import React, { useEffect, useState } from "react";
import {
  getUsuarios,
  desactivarUsuario,
  activarUsuario,
  Usuario,
} from "../../api/services/usuarios.service";

export const UsuariosViewer: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAccion, setLoadingAccion] = useState<number | null>(null);

  const [filtroRol, setFiltroRol] = useState<number | null>(null);
  const [verDesactivados, setVerDesactivados] = useState(false);

  // --------------------- CARGAR USUARIOS ---------------------
  const cargarUsuarios = async () => {
    setLoading(true);
    const res = await getUsuarios();

    if (res.success && res.data) {
      setUsuarios(res.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // --------------------- DESACTIVAR ---------------------
  const handleDesactivar = async (id: number) => {
    setLoadingAccion(id);
    const res = await desactivarUsuario(id);
    if (res.success) await cargarUsuarios();
    setLoadingAccion(null);
  };

  // --------------------- ACTIVAR ---------------------
  const handleActivar = async (id: number) => {
    setLoadingAccion(id);
    const res = await activarUsuario(id);
    if (res.success) await cargarUsuarios();
    setLoadingAccion(null);
  };

  // --------------------- FILTROS ---------------------
  const usuariosFiltrados = usuarios.filter((u) => {
    // 1. Filtrar por rol si está seleccionado
    if (filtroRol !== null && u.rol_idrol !== filtroRol) {
      return false;
    }

    // 2. Filtrar activos o desactivados
    if (verDesactivados) {
      return u.activo === 0;
    } else {
      return u.activo === 1;
    }
  });

  return (
    <div style={container}>
      <h2>👥 Gestión de Usuarios</h2>

      {/* FILTROS */}
      <div style={filterBar}>
        <select
          value={filtroRol ?? ""}
          onChange={(e) =>
            setFiltroRol(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">Todos los roles</option>
          <option value={3}>Contribuyentes</option>
          <option value={4}>Recolectores</option>
        </select>

        <button className="button" onClick={() => setVerDesactivados(!verDesactivados)}>
          {verDesactivados ? "Ver Activos" : "Ver Desactivados"}
        </button>

        <button className="button" onClick={cargarUsuarios}>🔄 Refrescar</button>
      </div>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table style={table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.idusuario}>
                <td>{u.idusuario}</td>
                <td>{u.nombre} {u.apellido}</td>
                <td>{u.email}</td>
                <td>{u.telefono}</td>
                <td style={{ color: u.activo ? "green" : "red" }}>
                  {u.activo ? "Activo" : "Desactivado"}
                </td>
                <td>
                  {u.activo ? (
                    <button
                      style={btn("red")}
                      onClick={() => handleDesactivar(u.idusuario)}
                      disabled={loadingAccion === u.idusuario}
                    >
                      {loadingAccion === u.idusuario ? "Procesando..." : "Desactivar"}
                    </button>
                  ) : (
                    <button
                      style={btn("green")}
                      onClick={() => handleActivar(u.idusuario)}
                      disabled={loadingAccion === u.idusuario}
                    >
                      {loadingAccion === u.idusuario ? "Procesando..." : "Activar"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ---------------------- ESTILOS ----------------------

const container: React.CSSProperties = {
  padding: "1rem",
};

const filterBar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "5px",
  border: "1px solid var(--border)",
  padding: "10px",
  borderRadius: "10px",
  marginBottom: "1rem",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const btn = (color: string) => ({
  backgroundColor: color === "green" ? "#4CAF50" : "#F44336",
  color: "white",
  padding: "0.4rem 0.8rem",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
});
export default UsuariosViewer;