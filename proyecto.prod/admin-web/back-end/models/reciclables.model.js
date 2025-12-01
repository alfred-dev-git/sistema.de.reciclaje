import { pool } from "../config/db.js";

export const obtenerTiposReciclableDB = async () => {
  const [rows] = await pool.query(`
    SELECT 
      idtipo_reciclable, 
      descripcion
    FROM tipo_reciclable
    ORDER BY idtipo_reciclable ASC;
  `);
  return rows;
};

/** Crear un nuevo tipo */
export const crearTipoReciclableDB = async ({ descripcion }) => {
  const [result] = await pool.query(
    `INSERT INTO tipo_reciclable (descripcion) VALUES (?)`,
    [descripcion]
  );
  return { idtipo_reciclable: result.insertId, descripcion };
};

/** Editar un tipo existente */
export const modificarTipoReciclableDB = async (id, { descripcion }) => {
  await pool.query(
    `
    UPDATE tipo_reciclable 
    SET descripcion = ? 
    WHERE idtipo_reciclable = ?
  `,
    [descripcion, id]
  );
  return { idtipo_reciclable: id, descripcion };
};