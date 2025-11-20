import { Request, Response } from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import ms, { StringValue } from "ms";
import { sendPasswordResetEmail } from "../utils/mailer.js";

// Tipos
type Usuario = {
  idusuario: number;
  email: string;
  password: string;
  nombre: string;
  rol_idrol: number;
  activo: number;
};

type Recolector = {
  idrecolector: number;
  idusuario: number;
};

// genera código numérico
function genCode(len = 6) {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son obligatorios" });
    }

    //Buscar usuario
    const [results] = await pool.query<(RowDataPacket & Usuario)[]>(
      "SELECT idusuario, email, password, nombre, rol_idrol, activo FROM usuario WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = results[0];

    // Verificar si el usuario está desactivado
    if (user.activo === 0) {
      return res.status(403).json({
        message: "Cuenta deshabilitada. Contacte con soporte.",
      });
    }

    //Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Si es recolector, obtener su idrecolector (no estado)
    let idRecolector: number | null = null;

    if (user.rol_idrol === 4) {
      const [recolectorRows] = await pool.query<(RowDataPacket & Recolector)[]>(
        "SELECT idrecolector FROM recolector WHERE idusuario = ?",
        [user.idusuario]
      );

      if (recolectorRows.length > 0) {
        idRecolector = recolectorRows[0].idrecolector;
      }
    }

    //Configuración JWT
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRE) {
      throw new Error("Faltan variables JWT_SECRET o JWT_EXPIRE");
    }

    const secret = process.env.JWT_SECRET;
    const expireMs = ms(process.env.JWT_EXPIRE as StringValue);
    const expireSec = Math.floor(expireMs / 1000);

    //Payload del token
    const payload: JwtPayload = { id: idRecolector, email: user.email, };

    const token = jwt.sign(payload, secret, { expiresIn: expireSec });

    // Respuesta
  res.json({ message: "Login exitoso", token, user: { email: user.email, rol: user.rol_idrol, nombre: user.nombre, }, });

  } catch (err) {
    console.error("❌ Error en login:", err);
    res.status(500).json({ message: "Error de servidor" });
  }
};

/**
 * POST /api/auth/forgot
 * body: { email }
 */
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body ?? {};
    const emailNorm = String(email || "").trim().toLowerCase();
    if (!emailNorm) return res.json({ ok: true });

    const [rows] = await pool.query(
      `SELECT idusuario, email 
       FROM usuario 
       WHERE email = ? 
       LIMIT 1`,
      [emailNorm]
    );

    const user = (rows as any[])[0];

    if (user) {
      const code = genCode(6);
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // borro códigos viejos
      await pool.execute(
        `DELETE FROM password_reset_codes 
         WHERE usuario_id = ? AND used_at IS NULL`,
        [user.idusuario]
      );

      // guardo nuevo
      await pool.execute(
        `INSERT INTO password_reset_codes (usuario_id, code_hash, expires_at)
         VALUES (?, ?, ?)`,
        [user.idusuario, codeHash, expiresAt]
      );

      // envío email
      await sendPasswordResetEmail(emailNorm, code);
    }

    // no filtra si existe o no
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ forgotPassword error:", err);
    res.status(500).json({ error: "Error interno" });
  }
}

/**
 * POST /api/auth/reset
 * body: { email, code, new_password }
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, code, new_password } = req.body ?? {};
    const emailNorm = String(email || "").trim().toLowerCase();
    const plainCode = String(code || "").trim();
    const newPass = String(new_password || "");

    if (!emailNorm || !plainCode || newPass.length < 6) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const [rows] = await pool.query(
      `SELECT idusuario FROM usuario WHERE email = ? LIMIT 1`,
      [emailNorm]
    );

    const user = (rows as any[])[0];
    if (!user) return res.status(400).json({ error: "Código inválido" });

    // obtener último código
    const [codes] = await pool.query(
      `SELECT id, code_hash, expires_at, used_at
       FROM password_reset_codes
       WHERE usuario_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.idusuario]
    );

    const rec = (codes as any[])[0];

    if (!rec || rec.used_at)
      return res.status(400).json({ error: "Código inválido" });

    if (new Date(rec.expires_at) < new Date())
      return res.status(400).json({ error: "Código vencido" });

    const match = await bcrypt.compare(plainCode, rec.code_hash);
    if (!match) return res.status(400).json({ error: "Código inválido" });

    // actualizar contraseña
    const hash = await bcrypt.hash(newPass, 10);

    await pool.execute(
      `UPDATE usuario SET password = ? WHERE idusuario = ?`,
      [hash, user.idusuario]
    );

    // marcar como usado
    await pool.execute(
      `UPDATE password_reset_codes SET used_at = NOW() WHERE id = ?`,
      [rec.id]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("❌ resetPassword error:", err);
    res.status(500).json({ error: "Error interno" });
  }
}