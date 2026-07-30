import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export const getNotificacion = async () => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      titulo,
      mensaje
    FROM notificaciones
    WHERE fecha_envio >= (CURDATE() - INTERVAL 1 DAY)
    ORDER BY fecha_envio DESC;
  `);

  return rows;
};