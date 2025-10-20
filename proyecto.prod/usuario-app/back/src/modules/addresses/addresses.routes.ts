import { Router } from "express";
import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { getDB } from "@/config/db";

const router = Router();

/**
 * GET /api/users/:id/addresses
 * Devuelve { addresses: [{ id, usuario_idusuario, latitud, longitud, calle, numero, barrio, referencias }]}
 * Nota: id = iddirecciones (aliased como id)
 */
router.get(
  "/users/:id/addresses",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (!Number.isFinite(userId)) return res.status(400).json({ error: "userId inválido" });

    const db = getDB();
    const [rows] = await db.query(
      `SELECT
         iddirecciones AS id,
         usuario_idusuario,
         latitud, longitud, calle, numero, barrio, referencias
       FROM direcciones
       WHERE usuario_idusuario = ?`,
      [userId]
    );
    res.json({ addresses: rows });
  })
);

/**
 * POST /api/addresses
 * Body: { usuario_idusuario, latitud, longitud, calle?, numero?, barrio?, referencias? }
 * Devuelve: { id }  // id = insertId = iddirecciones
 */
router.post(
  "/addresses",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      usuario_idusuario, latitud, longitud,
      calle = null, numero = null, barrio = null, referencias = null
    } = req.body || {};

    if (!usuario_idusuario || latitud === undefined || longitud === undefined) {
      return res.status(400).json({ error: "Faltan campos: usuario_idusuario, latitud, longitud" });
    }

    const db = getDB();

    // validar usuario existe
    const [[user]]: any = await db.query(
      `SELECT idusuario FROM usuario WHERE idusuario = ?`,
      [usuario_idusuario]
    );
    if (!user) return res.status(400).json({ error: "usuario_idusuario inexistente" });

    const [result] = await db.execute(
      `INSERT INTO direcciones (usuario_idusuario, latitud, longitud, calle, numero, barrio, referencias)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usuario_idusuario, latitud, longitud, calle, numero, barrio, referencias]
    );
    const insertId = (result as any).insertId; // este es iddirecciones

    res.status(201).json({ id: insertId });
  })
);

export default router;
