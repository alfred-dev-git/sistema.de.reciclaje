import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export const getNotificacion = async () => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      DATE_FORMAT(fr.fecha, '%d/%m/%Y') AS fecha,
      tr.descripcion AS tipo_reciclable
    FROM fecha_recoleccion fr
    INNER JOIN tipo_reciclable tr 
      ON fr.tipo_reciclable_idtipo_reciclable = tr.idtipo_reciclable
    WHERE fr.estado = 1
    ORDER BY fr.fecha ASC
    LIMIT 10;
    `
  );
  return rows;
};
