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

router.get(
  "/users/:id/addresses",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.uid;
    if (Number(req.params.id) !== userId) {
      return res.status(403).json({ error: "No podés consultar direcciones de otro usuario" });
    }
    const contributorId = await getContributorId(userId);
    if (!contributorId) return res.status(404).json({ error: "Contribuyente no encontrado" });

    const [rows] = await getDB().query(
      `SELECT iddirecciones AS id, latitud, longitud, calle, numero, barrio, referencias
       FROM direcciones WHERE contribuyente_idcontribuyente = ?
       ORDER BY iddirecciones DESC`,
      [contributorId]
    );
    res.json({ addresses: rows });
  })
);

router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { latitud, longitud, calle, numero, barrio, referencias } = req.body ?? {};
    const lat = Number(latitud);
    const lng = Number(longitud);
    if (!calle || !numero || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "Faltan campos obligatorios o las coordenadas son inválidas" });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: "Coordenadas fuera de rango" });
    }

    const contributorId = await getContributorId(req.user!.uid);
    if (!contributorId) return res.status(404).json({ error: "Contribuyente no encontrado" });

    const cleanText = (text: unknown) =>
      String(text ?? "").replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.\-]/g, "").trim();
    const calleClean = cleanText(calle);
    const numeroClean = cleanText(numero);
    const barrioClean = cleanText(barrio) || "---";
    const referenciasClean = String(referencias ?? "").trim() || "---";
    if (!calleClean || !numeroClean) return res.status(400).json({ error: "Dirección inválida" });

    const db = getDB();
    const [duplicates] = await db.query(
      `SELECT iddirecciones FROM direcciones
       WHERE contribuyente_idcontribuyente = ? AND calle = ? AND numero = ? LIMIT 1`,
      [contributorId, calleClean, numeroClean]
    );
    if ((duplicates as unknown[]).length > 0) {
      return res.status(409).json({ error: "La dirección ya existe" });
    }

    const [result] = await db.execute(
      `INSERT INTO direcciones
        (latitud, longitud, calle, numero, barrio, referencias, contribuyente_idcontribuyente)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [lat, lng, calleClean, numeroClean, barrioClean, referenciasClean, contributorId]
    );
    res.status(201).json({ id: (result as { insertId: number }).insertId });
  })
);

router.get(
  "/check-duplicate",
  asyncHandler(async (req: Request, res: Response) => {
    const contributorId = await getContributorId(req.user!.uid);
    if (!contributorId) return res.status(404).json({ error: "Contribuyente no encontrado" });
    const [rows] = await getDB().query(
      `SELECT iddirecciones FROM direcciones
       WHERE contribuyente_idcontribuyente = ? AND calle = ? AND numero = ? LIMIT 1`,
      [contributorId, req.query.calle, req.query.numero]
    );
    res.json({ duplicate: (rows as unknown[]).length > 0 });
  })
);

export default router;
