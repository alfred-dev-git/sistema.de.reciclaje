import { Router, Request, Response, NextFunction } from "express";
import asyncHandler from "@/utils/asyncHandler";
import dbFactory from "@/config/db";
import type { Pool } from "mysql2/promise";

const getDB = (): Pool => (typeof dbFactory === "function" ? (dbFactory as any)() : (dbFactory as any));

const router = Router();

/**
 * POST /api/detalle-pedido
 * Crea el detalle de un pedido ya existente.
 * Body:
 *  - pedidos_idpedidos (number, requerido)
 *  - fecha_entrega (string, opcional; default: CURDATE())
 *  - cant_bolson (number, requerido)
 *  - total_puntos (number, requerido)
 *  - observaciones (string, opcional)
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body || {};

    const pedidos_idpedidos =
      body.pedidos_idpedidos == null ? null : Number(body.pedidos_idpedidos);

    const cant_bolson =
      body.cant_bolson == null || Number.isNaN(Number(body.cant_bolson))
        ? null
        : Number(body.cant_bolson);

    const total_puntos =
      body.total_puntos == null || Number.isNaN(Number(body.total_puntos))
        ? null
        : Number(body.total_puntos);

    const fecha_entrega =
      body.fecha_entrega && typeof body.fecha_entrega === "string"
        ? body.fecha_entrega
        : null;

    const observaciones =
      body.observaciones == null || body.observaciones === ""
        ? null
        : String(body.observaciones);

    if (!pedidos_idpedidos || !cant_bolson || !total_puntos) {
      return res.status(400).json({
        error: "Los campos pedidos_idpedidos, cant_bolson y total_puntos son obligatorios",
      });
    }

    const db = getDB();

    // Validar que el pedido exista
    const [[pedido]]: any = await db.query(
      `SELECT idpedidos FROM pedidos WHERE idpedidos = ? LIMIT 1`,
      [pedidos_idpedidos]
    );

    if (!pedido) {
      return res.status(400).json({ error: "El pedido no existe" });
    }

    // Insertar detalle del pedido
    const [result] = await db.execute(
      `
      INSERT INTO detalle_pedido
        (fecha_entrega, cant_bolson, total_puntos, observaciones, pedidos_idpedidos)
      VALUES (?, ?, ?, ?, ?)
      `,
      [fecha_entrega ?? new Date(), cant_bolson, total_puntos, observaciones, pedidos_idpedidos]
    );

    res.status(201).json({ iddetalle_pedido: (result as any).insertId });
  })
);

router.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const db = getDB();
    const [rows] = await db.query("SELECT * FROM detalle");
    res.json(rows);
  })
);

export default router;
