import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export const getNotificacion = async (idRecolector: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
      0 AS id,
      'Rutas asignadas' AS titulo,
      CONCAT('Tenés ', GROUP_CONCAT(DISTINCT CONCAT('la ruta #', r.idrutas, ' para el ', DATE_FORMAT(r.fecha_creacion, '%d/%m/%Y a las %H:%i')) ORDER BY r.fecha_creacion SEPARATOR '; ')) AS mensaje,
      MAX(r.fecha_creacion) AS fecha_envio,
      NULL AS id_ruta
    FROM rutas r
    INNER JOIN solicitud_rutas sr ON sr.rutas_idrutas = r.idrutas
    INNER JOIN solicitud_recoleccion s ON s.idsolicitud_recoleccion = sr.solicitud_recoleccion_idsolicitud_recoleccion
    INNER JOIN estado_solicitud es ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
    WHERE r.recolector_idrecolector = ?
      AND LOWER(TRIM(es.descripcion)) IN ('pendiente', 'en ruta')
    HAVING COUNT(DISTINCT r.idrutas) > 0;
    `,
    [idRecolector]
  );

  return rows;
};
