import { Router, Request, Response, NextFunction } from 'express';
import asyncHandler from '@/utils/asyncHandler';
import dbFactory from '@/config/db';
import type { Pool } from 'mysql2/promise';

const getDB = (): Pool => (typeof dbFactory === 'function' ? (dbFactory as any)() : (dbFactory as any));

const router = Router();

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
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      usuario_idusuario,
      latitud,
      longitud,
      calle,
      numero,
      barrio,
      referencias
    } = req.body || {};

    if (!usuario_idusuario || !latitud || !longitud || !calle || !numero) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const cleanText = (t: string) =>
      t.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\.\-]/g, "").trim();

    const calleClean = cleanText(calle);

  const barrioClean =
    barrio && barrio.trim() !== "" ? cleanText(barrio) : "---";

  const referenciasClean =
    referencias && referencias.trim() !== "" ? referencias.trim() : "---";


    const db = getDB();

    // validar usuario existe
    const [[user]]: any = await db.query(
      `SELECT idusuario FROM usuario WHERE idusuario = ?`,
      [usuario_idusuario]
    );
    if (!user) {
      return res.status(400).json({ error: "usuario_idusuario inexistente" });
    }

    // evitar duplicado
    const [dup]: any = await db.query(
      `SELECT iddirecciones FROM direcciones 
       WHERE usuario_idusuario = ? AND calle = ? AND numero = ?`,
      [usuario_idusuario, calleClean, numero]
    );

    if (dup.length > 0) {
      return res.status(409).json({ error: "La dirección ya existe" });
    }

    // insertar
    const [result] = await db.execute(
      `INSERT INTO direcciones 
      (usuario_idusuario, latitud, longitud, calle, numero, barrio, referencias)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario_idusuario,
        latitud,
        longitud,
        calleClean,
        numero,
        barrioClean,
        referenciasClean
      ]
    );

    res.status(201).json({ id: (result as any).insertId });
  })
);


router.get(
  "/check-duplicate",
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, calle, numero } = req.query;

    const db = getDB();

    const [rows]: any = await db.query(
      `SELECT iddirecciones FROM direcciones 
       WHERE usuario_idusuario = ? AND calle = ? AND numero = ?`,
      [userId, calle, numero]
    );

    res.json({ duplicate: rows.length > 0 });
  })
);

export default router;
