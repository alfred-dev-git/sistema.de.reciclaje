import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { getDB } from "@/config/db";

const router = Router();


router.get("/", asyncHandler(async (_req, res) => {
  const db = getDB();
  const [rows] = await db.query(
    `SELECT idtipo_reciclable AS id, descripcion
     FROM tipo_reciclable`
  );
  res.json({ items: rows });
}));

export default router;
