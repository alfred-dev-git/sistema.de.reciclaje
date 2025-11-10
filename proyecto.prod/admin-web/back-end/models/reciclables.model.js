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
