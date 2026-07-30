import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export const obtenerHistorialDB = async (idRecolector: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
        sr.idsolicitud_recoleccion,
        sr.estado_solicitud_idestado_solicitud AS estado,
        dr.fecha_entrega,
        dr.cant_bolson,
        d.calle,
        d.numero,
        tr.descripcion AS tipo_reciclable
    FROM detalle_recoleccion dr
    INNER JOIN solicitud_recoleccion sr
        ON dr.solicitud_recoleccion_idsolicitud_recoleccion = sr.idsolicitud_recoleccion
    INNER JOIN direcciones d
        ON sr.direcciones_iddirecciones = d.iddirecciones
    INNER JOIN tipo_reciclable tr
        ON sr.tipo_reciclable_idtipo_reciclable = tr.idtipo_reciclable
    INNER JOIN solicitud_rutas sru
        ON sr.idsolicitud_recoleccion = sru.solicitud_recoleccion_idsolicitud_recoleccion
    INNER JOIN rutas r
        ON sru.rutas_idrutas = r.idrutas
    WHERE r.recolector_idrecolector = ?
      AND MONTH(dr.fecha_entrega) = MONTH(CURRENT_DATE())
      AND YEAR(dr.fecha_entrega) = YEAR(CURRENT_DATE())
    ORDER BY dr.fecha_entrega DESC
    LIMIT 30;
    `,
    [idRecolector]
  );

  return rows;
};