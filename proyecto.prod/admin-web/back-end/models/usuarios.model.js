import { pool } from "../config/db.js";

/** Obtener todos los usuarios con rol 3 o 4 */
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
      foto_perfil,
      puntos,
      sexo,
      activo
    FROM usuario
    WHERE rol_idrol IN (3, 4)
    ORDER BY idusuario ASC;
  `);

  return rows;
};

/** Desactivar usuario (activo = 0) */
export const desactivarUsuarioDB = async (id) => {
  const [result] = await pool.query(
    `
    UPDATE usuario
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
    UPDATE usuario
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
