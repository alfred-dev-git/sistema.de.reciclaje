import { pool } from "../config/db.js";

/** Obtener contribuyentes y recolectores */
export const obtenerUsuariosDB = async () => {
  const [rows] = await pool.query(`
    SELECT 
      idusuario,
      DNI,
      CUIT,
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      rol_idrol,
      municipio_idmunicipio,
      u.foto_perfil,
      u.sexo,
      u.activo,
      r.descripcion AS rol
    FROM usuarios u
    INNER JOIN rol r ON r.idrol = u.rol_idrol
    WHERE LOWER(r.descripcion) IN ('contribuyente', 'recolector')
    ORDER BY u.idusuario ASC;
  `);

  return rows;
};

/** Desactivar usuario (activo = 0) */
export const desactivarUsuarioDB = async (id) => {
  const [result] = await pool.query(
    `
    UPDATE usuarios
    SET activo = 0
    WHERE idusuario = ?
    `,
    [id]
  );

  return {
    idusuario: id,
    activo: 0,
  };
};

/** Activar usuario (activo = 1) */
export const activarUsuarioDB = async (id) => {
  const [result] = await pool.query(
    `
    UPDATE usuarios
    SET activo = 1
    WHERE idusuario = ?
    `,
    [id]
  );

  return {
    idusuario: id,
    activo: 1,
  };
};
