import { pool } from "../config/db.js";

export const obtenerCronogramaDB = async () => {
  const [rows] = await pool.query(`
    SELECT 
      c.dia_semana,
      c.semana_mes,
      c.hora_inicio,
      c.hora_fin,
      tr.descripcion AS tipo_reciclable
    FROM cronograma_recoleccion c
    INNER JOIN tipo_reciclable tr 
      ON c.tipo_reciclable_idtipo_reciclable = tr.idtipo_reciclable
    WHERE c.estado = 1
    ORDER BY 
      c.dia_semana ASC,
      c.semana_mes ASC;
  `);

  return rows;
};
