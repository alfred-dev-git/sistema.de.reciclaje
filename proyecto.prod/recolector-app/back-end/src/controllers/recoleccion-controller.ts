import { Request, Response } from "express";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../db.js";

async function obtenerEstadoId(connection: PoolConnection, descripcion: string) {
  const [rows] = await connection.query<RowDataPacket[]>(
    `SELECT idestado_solicitud
     FROM estado_solicitud
     WHERE LOWER(TRIM(descripcion)) = LOWER(?)
     LIMIT 1`,
    [descripcion]
  );
  return rows[0]?.idestado_solicitud as number | undefined;
}

async function bloquearSolicitudPropia(
  connection: PoolConnection,
  solicitudId: number,
  recolectorId: number
) {
  const [rows] = await connection.query<RowDataPacket[]>(
    `SELECT s.idsolicitud_recoleccion
     FROM solicitud_recoleccion s
     INNER JOIN estado_solicitud es
       ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
     INNER JOIN solicitud_rutas sr
       ON sr.solicitud_recoleccion_idsolicitud_recoleccion = s.idsolicitud_recoleccion
     INNER JOIN rutas r ON r.idrutas = sr.rutas_idrutas
     WHERE s.idsolicitud_recoleccion = ?
       AND r.recolector_idrecolector = ?
       AND LOWER(TRIM(es.descripcion)) = 'en ruta'
     LIMIT 1
     FOR UPDATE`,
    [solicitudId, recolectorId]
  );
  return rows.length > 0;
}

async function yaTieneDetalle(connection: PoolConnection, solicitudId: number) {
  const [rows] = await connection.query<RowDataPacket[]>(
    `SELECT 1
     FROM detalle_recoleccion
     WHERE solicitud_recoleccion_idsolicitud_recoleccion = ?
     LIMIT 1
     FOR UPDATE`,
    [solicitudId]
  );
  return rows.length > 0;
}

export const postMarcarCompletado = async (req: Request, res: Response) => {
  const solicitudId = Number(req.body?.idsolicitud_recoleccion);
  const cantidad = Number(req.body?.cant_bolson);
  const observaciones = String(req.body?.observaciones ?? "Completado").trim();

  if (!Number.isInteger(solicitudId) || !Number.isInteger(cantidad) || cantidad <= 0) {
    return res.status(400).json({ success: false, message: "Solicitud o cantidad inválida" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (!(await bloquearSolicitudPropia(connection, solicitudId, req.user!.id))) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "La solicitud no pertenece al recolector o ya no está En ruta",
      });
    }
    if (await yaTieneDetalle(connection, solicitudId)) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: "La solicitud ya fue procesada" });
    }

    const estadoId = await obtenerEstadoId(connection, "Completada");
    if (!estadoId) throw new Error("No existe el estado Completada");

    await connection.execute<ResultSetHeader>(
      `UPDATE solicitud_recoleccion
       SET estado_solicitud_idestado_solicitud = ?
       WHERE idsolicitud_recoleccion = ?`,
      [estadoId, solicitudId]
    );
    await connection.execute<ResultSetHeader>(
      `INSERT INTO detalle_recoleccion
       (fecha_entrega, cant_bolson, observaciones,
        solicitud_recoleccion_idsolicitud_recoleccion)
       VALUES (NOW(), ?, ?, ?)`,
      [cantidad, observaciones || "Completado", solicitudId]
    );

    await connection.commit();
    return res.json({ success: true, message: "Solicitud marcada como completada" });
  } catch (error: any) {
    await connection.rollback();
    console.error("Error en postMarcarCompletado:", error);
    return res.status(500).json({ success: false, message: error.message || "Error al completar la solicitud" });
  } finally {
    connection.release();
  }
};

export const postMarcarAusente = async (req: Request, res: Response) => {
  const solicitudId = Number(req.body?.idsolicitud_recoleccion);
  if (!Number.isInteger(solicitudId)) {
    return res.status(400).json({ success: false, message: "Solicitud inválida" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (!(await bloquearSolicitudPropia(connection, solicitudId, req.user!.id))) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "La solicitud no pertenece al recolector o ya no está En ruta",
      });
    }
    if (await yaTieneDetalle(connection, solicitudId)) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: "La solicitud ya fue procesada" });
    }

    const estadoId = await obtenerEstadoId(connection, "Ausente");
    if (!estadoId) throw new Error("No existe el estado Ausente");

    await connection.execute<ResultSetHeader>(
      `UPDATE solicitud_recoleccion
       SET estado_solicitud_idestado_solicitud = ?
       WHERE idsolicitud_recoleccion = ?`,
      [estadoId, solicitudId]
    );
    await connection.execute<ResultSetHeader>(
      `INSERT INTO detalle_recoleccion
       (fecha_entrega, cant_bolson, observaciones,
        solicitud_recoleccion_idsolicitud_recoleccion)
       VALUES (NOW(), 0, 'Usuario ausente', ?)`,
      [solicitudId]
    );

    await connection.commit();
    return res.json({ success: true, message: "Usuario ausente registrado" });
  } catch (error: any) {
    await connection.rollback();
    console.error("Error en postMarcarAusente:", error);
    return res.status(500).json({ success: false, message: error.message || "Error al registrar ausencia" });
  } finally {
    connection.release();
  }
};
