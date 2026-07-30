import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export const obtenerCronogramaDB = async () => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      fr.dia_semana,
      fr.semana_mes,
      fr.hora_inicio,
      fr.hora_fin,
      tr.descripcion AS tipo_reciclable
    FROM frecuencia_recoleccion fr
    INNER JOIN tipo_reciclable tr
      ON fr.tipo_reciclable_idtipo_reciclable = tr.idtipo_reciclable
    WHERE fr.activo = 1
    ORDER BY
      fr.dia_semana ASC,
      fr.semana_mes ASC;
  `);

  return rows;
};