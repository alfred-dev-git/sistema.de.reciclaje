import { Router, Request, Response, NextFunction } from "express";
import asyncHandler from "@/utils/asyncHandler";
import dbFactory from "@/config/db";
import type { Pool } from "mysql2/promise";

const getDB = (): Pool => (typeof dbFactory === "function" ? (dbFactory as any)() : (dbFactory as any));

const router = Router();

router.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const db = getDB();
    const [rows] = await db.query("SELECT * FROM residuos");
    res.json(rows);
  })
);

// Asegúrate de tipar los demás endpoints de forma similar
export default router;