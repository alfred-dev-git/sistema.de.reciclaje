import { pool } from "../config/db.js";

export const obtenerPerfilDB = async (idusuario) => {
  const [rows] = await pool.query(
    `
    SELECT 
      u.nombre,
      u.apellido,
      u.email,
      u.telefono,
      u.DNI AS dni,
      m.descripcion AS municipio,
      m.idmunicipio AS municipio_idmunicipio
    FROM usuario u
    LEFT JOIN municipio m ON u.municipio_idmunicipio = m.idmunicipio
    WHERE u.idusuario = ?
    LIMIT 1;
    `,
    [idusuario]
  );

  return rows[0] || null;
};

export const obtenerMunicipiosDB = async () => {
  const [rows] = await pool.query(
    `SELECT idmunicipio, descripcion FROM municipio ORDER BY descripcion ASC`
  );
  return rows;
};


export const actualizarPerfilDB = async (idusuario, fields) => {
  const columns = Object.keys(fields);
  const values = Object.values(fields);

  // Genera dinámicamente el SET del UPDATE
  const setClause = columns.map(col => `${col} = ?`).join(", ");

  await pool.query(
    `
      UPDATE usuario 
      SET ${setClause}
      WHERE idusuario = ?
    `,
    [...values, idusuario]
  );
};