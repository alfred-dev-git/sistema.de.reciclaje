import { Router, Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { getDB } from "@/config/db";

const router = Router();

/**
 * POST /api/pedidos
 * Crea un nuevo pedido
 * Body:
 *  - usuario_idusuario (number, requerido)
 *  - id_direccion (number, requerido)
 *  - tipo_reciclable_idtipo_reciclable (number, requerido)
 *  - estado? (number, opcional; default 3)
 *  - estado_ruta? (number, opcional; default null)
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
    const estadoVal = Number.isFinite(Number(estado)) ? Number(estado) : 0;

    if (!Number.isFinite(uid) || !Number.isFinite(addrId) || !Number.isFinite(tipoId)) {
      return res.status(400).json({
        error:
          "Faltan/son inválidos: usuario_idusuario, id_direccion, tipo_reciclable_idtipo_reciclable",
      });
    }

    const db = getDB();

    // 🔹 Validar usuario
    const [[usr]]: any = await db.query(
      "SELECT idusuario FROM usuario WHERE idusuario = ? LIMIT 1",
      [uid]
    );
    if (!usr) return res.status(404).json({ error: "Usuario no existe" });

    // 🔹 Validar dirección
    const [[addr]]: any = await db.query(
      "SELECT iddirecciones, usuario_idusuario FROM direcciones WHERE iddirecciones = ? LIMIT 1",
      [addrId]
    );
    if (!addr) return res.status(404).json({ error: "Dirección no existe" });
    if (Number(addr.usuario_idusuario) !== uid) {
      return res.status(400).json({ error: "La dirección no pertenece al usuario" });
    }

    // 🔹 Validar tipo reciclable
    const [[tipo]]: any = await db.query(
      "SELECT idtipo_reciclable FROM tipo_reciclable WHERE idtipo_reciclable = ? LIMIT 1",
      [tipoId]
    );
    if (!tipo) return res.status(404).json({ error: "Tipo reciclable no existe" });

    // 🔹 Validar si ya existe una solicitud pendiente (estado = 0) para ese tipo de reciclable
    const [[pendiente]]: any = await db.query(
      `
      SELECT idpedidos 
      FROM pedidos 
      WHERE usuario_idusuario = ? 
        AND tipo_reciclable_idtipo_reciclable = ? 
        AND estado = 0
      LIMIT 1
      `,
      [uid, tipoId]
    );

    if (pendiente) {
      return res.status(400).json({
        error: "Ya existe una solicitud pendiente para este tipo de reciclable. Espere a que se complete o cancele antes de crear otra.",
      });
    }

    // 🔹 Insertar nuevo pedido
    const [result] = await db.execute(
      `
      INSERT INTO pedidos
      (fecha_emision, estado, estado_ruta, id_direccion, usuario_idusuario, tipo_reciclable_idtipo_reciclable)
      VALUES (CURDATE(), ?, ?, ?, ?, ?)
      `,
      [estadoVal, 0, addrId, uid, tipoId]
    );

    res.status(201).json({ idpedidos: (result as any).insertId });
  })
);
/**
 * GET /api/pedidos/users/:id/historial
 * Retorna todos los pedidos del usuario con sus detalles y tipo reciclable
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
        DATE_FORMAT(p.fecha_emision, '%Y-%m-%d') AS fecha_emision,
        p.estado,
        p.estado_ruta,
        p.id_direccion,
        a.calle,
        a.numero,
        a.latitud,
        a.longitud,
        p.tipo_reciclable_idtipo_reciclable AS tipo_id,
        tr.descripcion AS tipo_descripcion
      FROM pedidos p
      LEFT JOIN direcciones a
        ON a.iddirecciones = p.id_direccion
      LEFT JOIN tipo_reciclable tr
        ON tr.idtipo_reciclable = p.tipo_reciclable_idtipo_reciclable
      WHERE 
        p.usuario_idusuario = ?
        AND MONTH(p.fecha_emision) = MONTH(CURDATE())
        AND YEAR(p.fecha_emision) = YEAR(CURDATE())
      ORDER BY p.fecha_emision DESC, p.idpedidos DESC
      `,
      [userId]
    );

    res.json(rows);
  })
);


/**
 * GET /api/pedidos/detalle/:idPedido
 * Devuelve el detalle completo de un pedido
 */
router.get(
  "/detalle/:idPedido",
  asyncHandler(async (req: Request, res: Response) => {
    const idPedido = Number(req.params.idPedido);
    if (!Number.isFinite(idPedido)) {
      return res.status(400).json({ error: "idPedido inválido" });
    }

    const db = getDB();

    const [[pedido]]: any = await db.query(
      `
      SELECT
        p.idpedidos,
        DATE_FORMAT(p.fecha_emision, '%Y-%m-%d') AS fecha_emision,
        p.estado,
        p.estado_ruta,
        p.id_direccion,
        p.usuario_idusuario,
        p.tipo_reciclable_idtipo_reciclable AS tipo_id,
        tr.descripcion AS tipo_descripcion,
        a.calle,
        a.numero,
        a.latitud,
        a.longitud
      FROM pedidos p
      LEFT JOIN direcciones a
        ON a.iddirecciones = p.id_direccion
      LEFT JOIN tipo_reciclable tr
        ON tr.idtipo_reciclable = p.tipo_reciclable_idtipo_reciclable
      WHERE p.idpedidos = ?
      LIMIT 1
      `,
      [idPedido]
    );

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const [[detalle]]: any = await db.query(
      `
      SELECT
        DATE_FORMAT(fecha_entrega, '%Y-%m-%d') AS fecha_entrega,
        cant_bolson,
        total_puntos,
        observaciones
      FROM detalle_pedido
      WHERE pedidos_idpedidos = ?
      ORDER BY fecha_entrega DESC
      LIMIT 1
      `,
      [idPedido]
    );

    res.json({ ...pedido, ...detalle });
  })
);


// 🔹 Cancelar pedido (estado = 2)
router.put(
  "/:idPedido/cancelar",
  asyncHandler(async (req: Request, res: Response) => {
    const idPedido = Number(req.params.idPedido);
    if (!Number.isFinite(idPedido)) {
      return res.status(400).json({ error: "idPedido inválido" });
    }

    const db = getDB();

    // Verificar estado actual
    const [[pedido]]: any = await db.query(
      `SELECT estado FROM pedidos WHERE idpedidos = ? LIMIT 1`,
      [idPedido]
    );

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    if (![0, 3].includes(pedido.estado)) {
      return res
        .status(400)
        .json({ error: "El pedido no puede ser cancelado en este estado." });
    }

    // Actualizar estado a cancelado
    await db.query(
      `UPDATE pedidos SET estado = 2 WHERE idpedidos = ?`,
      [idPedido]
    );

    res.json({ success: true, message: "Pedido cancelado correctamente." });
  })
);

export default router;
