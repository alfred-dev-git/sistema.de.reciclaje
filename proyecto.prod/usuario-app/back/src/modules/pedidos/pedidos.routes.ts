import { Router, Request, Response } from "express";
import asyncHandler from "@/utils/asyncHandler";
import getDB from "@/config/db";
import { requireAuth } from "@/middlewares/auth";

const router = Router();
router.use(requireAuth);

async function getContributorId(userId: number) {
  const [rows] = await getDB().query(
    `SELECT idcontribuyente FROM contribuyente WHERE usuarios_idusuario = ? LIMIT 1`,
    [userId]
  );
  return (rows as { idcontribuyente: number }[])[0]?.idcontribuyente;
}

async function getStateId(description: string) {
  const [rows] = await getDB().query(
    `SELECT idestado_solicitud FROM estado_solicitud WHERE LOWER(descripcion) = LOWER(?) LIMIT 1`,
    [description]
  );
  return (rows as { idestado_solicitud: number }[])[0]?.idestado_solicitud;
}

router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const addressId = Number(req.body?.id_direccion);
    const typeId = Number(req.body?.tipo_reciclable_idtipo_reciclable);
    if (!Number.isInteger(addressId) || !Number.isInteger(typeId)) {
      return res.status(400).json({ error: "Dirección y tipo de reciclable son requeridos" });
    }

    const contributorId = await getContributorId(req.user!.uid);
    if (!contributorId) return res.status(404).json({ error: "Contribuyente no encontrado" });

    const db = getDB();
    const [[address]] = await db.query(
      `SELECT iddirecciones FROM direcciones
       WHERE iddirecciones = ? AND contribuyente_idcontribuyente = ? LIMIT 1`,
      [addressId, contributorId]
    ) as [{ iddirecciones: number }[], unknown];
    if (!address) return res.status(404).json({ error: "La dirección no pertenece al usuario" });

    const [[type]] = await db.query(
      `SELECT idtipo_reciclable FROM tipo_reciclable WHERE idtipo_reciclable = ? LIMIT 1`,
      [typeId]
    ) as [{ idtipo_reciclable: number }[], unknown];
    if (!type) return res.status(404).json({ error: "Tipo de reciclable inexistente" });

    const pendingStateId = await getStateId("Pendiente");
    if (!pendingStateId) throw new Error("No existe el estado Pendiente");

    const [pending] = await db.query(
      `SELECT idsolicitud_recoleccion FROM solicitud_recoleccion
       WHERE contribuyente_idcontribuyente = ?
         AND tipo_reciclable_idtipo_reciclable = ?
         AND estado_solicitud_idestado_solicitud = ?
       LIMIT 1`,
      [contributorId, typeId, pendingStateId]
    );
    if ((pending as unknown[]).length > 0) {
      return res.status(409).json({
        error: "Ya existe una solicitud pendiente para este tipo de reciclable.",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO solicitud_recoleccion
        (fecha_emision, tipo_reciclable_idtipo_reciclable,
         contribuyente_idcontribuyente, direcciones_iddirecciones,
         estado_solicitud_idestado_solicitud)
       VALUES (NOW(), ?, ?, ?, ?)`,
      [typeId, contributorId, addressId, pendingStateId]
    );
    const id = (result as { insertId: number }).insertId;
    res.status(201).json({ id, idpedidos: id });
  })
);

router.get(
  "/users/:id/historial",
  asyncHandler(async (req: Request, res: Response) => {
    if (Number(req.params.id) !== req.user!.uid) {
      return res.status(403).json({ error: "No podés consultar solicitudes de otro usuario" });
    }
    const contributorId = await getContributorId(req.user!.uid);
    if (!contributorId) return res.status(404).json({ error: "Contribuyente no encontrado" });

    const [rows] = await getDB().query(
      `SELECT
         s.idsolicitud_recoleccion AS idpedidos,
         DATE_FORMAT(s.fecha_emision, '%Y-%m-%d') AS fecha_emision,
         es.descripcion AS estado,
         d.iddirecciones AS id_direccion,
         d.calle, d.numero, d.latitud, d.longitud,
         s.tipo_reciclable_idtipo_reciclable AS tipo_id,
         tr.descripcion AS tipo_descripcion,
         CASE WHEN sr.rutas_idrutas IS NULL THEN 0 ELSE 1 END AS tiene_ruta
       FROM solicitud_recoleccion s
       INNER JOIN estado_solicitud es
         ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
       INNER JOIN direcciones d ON d.iddirecciones = s.direcciones_iddirecciones
       INNER JOIN tipo_reciclable tr
         ON tr.idtipo_reciclable = s.tipo_reciclable_idtipo_reciclable
       LEFT JOIN solicitud_rutas sr
         ON sr.solicitud_recoleccion_idsolicitud_recoleccion = s.idsolicitud_recoleccion
       WHERE s.contribuyente_idcontribuyente = ?
       ORDER BY s.fecha_emision DESC, s.idsolicitud_recoleccion DESC`,
      [contributorId]
    );
    res.json(rows);
  })
);

router.get(
  "/detalle/:idPedido",
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.idPedido);
    const contributorId = await getContributorId(req.user!.uid);
    if (!Number.isInteger(id) || !contributorId) return res.status(400).json({ error: "Solicitud inválida" });

    const [rows] = await getDB().query(
      `SELECT
         s.idsolicitud_recoleccion AS idpedidos,
         DATE_FORMAT(s.fecha_emision, '%Y-%m-%d') AS fecha_emision,
         es.descripcion AS estado,
         tr.descripcion AS tipo_descripcion,
         d.calle, d.numero, d.latitud, d.longitud,
         DATE_FORMAT(dr.fecha_entrega, '%Y-%m-%d') AS fecha_entrega,
         dr.cant_bolson, dr.observaciones
       FROM solicitud_recoleccion s
       INNER JOIN estado_solicitud es
         ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
       INNER JOIN tipo_reciclable tr
         ON tr.idtipo_reciclable = s.tipo_reciclable_idtipo_reciclable
       INNER JOIN direcciones d ON d.iddirecciones = s.direcciones_iddirecciones
       LEFT JOIN detalle_recoleccion dr
         ON dr.solicitud_recoleccion_idsolicitud_recoleccion = s.idsolicitud_recoleccion
       WHERE s.idsolicitud_recoleccion = ? AND s.contribuyente_idcontribuyente = ?
       ORDER BY dr.fecha_entrega DESC LIMIT 1`,
      [id, contributorId]
    );
    const detail = (rows as Record<string, unknown>[])[0];
    if (!detail) return res.status(404).json({ error: "Solicitud no encontrada" });
    res.json(detail);
  })
);

router.put(
  "/:idPedido/cancelar",
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.idPedido);
    const contributorId = await getContributorId(req.user!.uid);
    if (!Number.isInteger(id) || !contributorId) return res.status(400).json({ error: "Solicitud inválida" });

    const pendingStateId = await getStateId("Pendiente");
    if (!pendingStateId) throw new Error("No existe el estado Pendiente");

    const cancelledStateId = await getStateId("Cancelada");
    if (!cancelledStateId) throw new Error("No existe el estado Cancelada");

    const [result] = await getDB().execute(
      `UPDATE solicitud_recoleccion
       SET estado_solicitud_idestado_solicitud = ?
       WHERE idsolicitud_recoleccion = ?
         AND contribuyente_idcontribuyente = ?
         AND estado_solicitud_idestado_solicitud = ?
         AND NOT EXISTS (
           SELECT 1
           FROM solicitud_rutas
           WHERE solicitud_recoleccion_idsolicitud_recoleccion = ?
         )`,
      [cancelledStateId, id, contributorId, pendingStateId, id]
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return res.status(409).json({ error: "La solicitud no existe o ya no puede cancelarse" });
    }
    res.json({ success: true, message: "Solicitud cancelada correctamente." });
  })
);

export default router;
