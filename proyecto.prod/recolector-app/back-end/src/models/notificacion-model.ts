import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export const getNotificacion = async () => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT 
      n.titulo,
      n.mensaje
    FROM notificaciones n
    INNER JOIN cronograma_recoleccion c 
      ON n.cronograma_recoleccion_idcronograma_recoleccion = c.idcronograma_recoleccion
    WHERE 
      c.estado = 1
      AND n.fecha_envio >= (CURDATE() - INTERVAL 3 DAY)
    ORDER BY n.fecha_envio DESC;
  `);

  return rows;
};
