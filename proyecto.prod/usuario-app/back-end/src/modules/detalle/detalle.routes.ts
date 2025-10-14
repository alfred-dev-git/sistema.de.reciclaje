import { Router } from "express";
import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { getDB } from "@/config/db";

const router = Router();


router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body || {};

    const pedidos_idpedidos =
      body.pedidos_idpedidos == null ? null : Number(body.pedidos_idpedidos);
    const tipo_reciclable_idtipo_reciclable =
      body.tipo_reciclable_idtipo_reciclable == null
        ? null
        : Number(body.tipo_reciclable_idtipo_reciclable);
    const puntoRecoleccion =
      body.puntoRecoleccion == null ? null : Number(body.puntoRecoleccion);

    if (!pedidos_idpedidos || !tipo_reciclable_idtipo_reciclable || !puntoRecoleccion) {
      return res.status(400).json({
        error:
          "pedidos_idpedidos, tipo_reciclable_idtipo_reciclable y puntoRecoleccion son obligatorios",
      });
    }

    const observaciones =
      body.observaciones == null || body.observaciones === ""
        ? null
        : String(body.observaciones);

    const peso_kg =
      body.peso_kg == null || Number.isNaN(Number(body.peso_kg))
        ? 0
        : Number(body.peso_kg);

    const id_recolector =
      body.id_recolector == null || body.id_recolector === ""
        ? null
        : Number(body.id_recolector);

    const orden =
      body.orden == null || Number.isNaN(Number(body.orden))
        ? null
        : Number(body.orden);

    const db = getDB();

    const [[ped]]: any = await db.query(
      `SELECT idpedidos FROM pedidos WHERE idpedidos = ?`,
      [pedidos_idpedidos]
    );
    if (!ped) return res.status(400).json({ error: "Pedido inexistente" });

    const [[tip]]: any = await db.query(
      `SELECT idtipo_reciclable FROM tipo_reciclable WHERE idtipo_reciclable = ?`,
      [tipo_reciclable_idtipo_reciclable]
    );
    if (!tip) return res.status(400).json({ error: "Tipo de residuo inexistente" });

    const [[addr]]: any = await db.query(
      `SELECT iddirecciones FROM direcciones WHERE iddirecciones = ?`,
      [puntoRecoleccion]
    );
    if (!addr) return res.status(400).json({ error: "Dirección inexistente" });

    const [result] = await db.execute(
      `INSERT INTO detalle_pedido
        (orden, observaciones, peso_kg, pedidos_idpedidos, tipo_reciclable_idtipo_reciclable, id_recolector, puntoRecoleccion)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orden, observaciones, peso_kg, pedidos_idpedidos, tipo_reciclable_idtipo_reciclable, id_recolector, puntoRecoleccion]
    );

    res.status(201).json({ id: (result as any).insertId });
  })
);

export default router;
