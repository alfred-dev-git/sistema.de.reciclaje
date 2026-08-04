import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export const getNotificacion = async (idRecolector: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
      n.idnotificaciones AS id,
      titulo,
      mensaje,
      fecha_envio,
      n.rutas_idrutas AS id_ruta
    FROM notificaciones n
    INNER JOIN rutas r ON r.idrutas = n.rutas_idrutas
    WHERE r.recolector_idrecolector = ?
      AND n.fecha_envio >= (CURDATE() - INTERVAL 1 DAY)
    ORDER BY n.fecha_envio DESC, n.idnotificaciones DESC
    LIMIT 1;
    `,
    [idRecolector]
  );

  return rows;
};
