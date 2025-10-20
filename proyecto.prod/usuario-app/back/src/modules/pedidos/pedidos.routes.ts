import { Router, Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { getDB } from "@/config/db";

const router = Router();

/**
 * POST /api/pedidos
 * Body:
 *  - usuario_idusuario (number, requerido)
 *  - id_direccion (number, requerido)
 *  - tipo_reciclable_idtipo_reciclable (number, requerido)
 *  - estado? (number, opcional; default 3)
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      usuario_idusuario,
      id_direccion,
      tipo_reciclable_idtipo_reciclable,
      estado,
    } = req.body ?? {};

    const uid = Number(usuario_idusuario);
    const addrId = Number(id_direccion);
    const tipoId = Number(tipo_reciclable_idtipo_reciclable);
    const estadoVal = Number.isFinite(Number(estado)) ? Number(estado) : 3;

    if (!Number.isFinite(uid) || !Number.isFinite(addrId) || !Number.isFinite(tipoId)) {
      return res.status(400).json({
        error: "Faltan/son inválidos: usuario_idusuario, id_direccion, tipo_reciclable_idtipo_reciclable",
      });
    }

    const db = getDB();

    // Validaciones mínimas (usuario, dirección pertenece al usuario, tipo existe)
    const [[usr]]: any = await db.query(
      "SELECT idusuario FROM usuario WHERE idusuario = ? LIMIT 1",
      [uid]
    );
    if (!usr) return res.status(404).json({ error: "Usuario no existe" });

    const [[addr]]: any = await db.query(
      "SELECT iddirecciones, usuario_idusuario FROM direcciones WHERE iddirecciones = ? LIMIT 1",
      [addrId]
    );
    if (!addr) return res.status(404).json({ error: "Dirección no existe" });
    if (Number(addr.usuario_idusuario) !== uid) {
      return res.status(400).json({ error: "La dirección no pertenece al usuario" });
    }

    const [[tipo]]: any = await db.query(
      "SELECT idtipo_reciclable FROM tipo_reciclable WHERE idtipo_reciclable = ? LIMIT 1",
      [tipoId]
    );
    if (!tipo) return res.status(404).json({ error: "Tipo reciclable no existe" });

    // Inserción según tu esquema (con estado)
    const [result] = await db.execute(
      `INSERT INTO pedidos
       (fecha_emision, estado, id_direccion, usuario_idusuario, tipo_reciclable_idtipo_reciclable)
       VALUES (CURDATE(), ?, ?, ?, ?)`,
      [estadoVal, addrId, uid, tipoId]
    );

    res.status(201).json({ idpedidos: (result as any).insertId });
  })
);

/**
 * GET /api/pedidos/users/:id/historial
 * Trae pedidos del usuario + dirección + tipo + (si existe) detalle_pedido.
 * No cambiamos nombres de columnas de la respuesta para no romper front.
 */
router.get(
  "/users/:id/historial",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ error: "id inválido" });
    }

    const db = getDB();

    const [rows] = await db.query(
      `
      SELECT
        p.idpedidos,
        p.fecha_emision,
        p.estado,  -- 1 retirado, 2 cancelado, 3 en proceso
        p.id_direccion,
        a.calle, a.numero, a.latitud, a.longitud,
        p.tipo_reciclable_idtipo_reciclable AS tipo_id,
        tr.descripcion AS tipo_descripcion,
        d.fecha_entrega,
        d.cant_bolson,
        d.estado       AS detalle_estado,
        d.observaciones,
        0 AS total_puntos
      FROM pedidos p
      LEFT JOIN direcciones a
        ON a.iddirecciones = p.id_direccion
      LEFT JOIN tipo_reciclable tr
        ON tr.idtipo_reciclable = p.tipo_reciclable_idtipo_reciclable
      LEFT JOIN detalle_pedido d
        ON d.pedidos_idpedidos = p.idpedidos
      WHERE p.usuario_idusuario = ?
      ORDER BY p.fecha_emision DESC, p.idpedidos DESC
      `,
      [userId]
    );

    res.json(rows);
  })
);

export default router;
