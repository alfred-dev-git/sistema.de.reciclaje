import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Token requerido" });
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET no configurado");

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { uid?: number };
    if (!Number.isInteger(decoded.uid)) throw new Error("Token sin usuario");
    req.user = { uid: decoded.uid! };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}
