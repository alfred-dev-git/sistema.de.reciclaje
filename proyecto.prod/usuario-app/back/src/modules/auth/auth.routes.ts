import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { asyncHandler } from "@/utils/asyncHandler";
import { getDB } from "@/config/db";
import { signToken } from "@/utils/jwt";
import { sendPasswordResetEmail } from "@/utils/mailer";

const router = Router();

/* Utilidad: OTP numérico */
function genCode(len = 6) {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}

/**
 * POST /api/auth/register
 * Requeridos: dni, nombre, apellido, email, password, telefono, fecha_nacimiento, sexo
 * Defaults: rol_idrol=3 (user), municipio_idmunicipio=1, puntos=0
 */
router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      dni,
      cuit,
      nombre,
      apellido,
      email,
      password,
      telefono,
      fecha_nacimiento,
      sexo,
      rol_idrol,
      municipio_idmunicipio,
      foto_perfil,
    } = req.body ?? {};

    if (
      !dni ||
      !nombre ||
      !apellido ||
      !email ||
      !password ||
      !telefono ||
      !fecha_nacimiento ||
      !sexo
    ) {
      return res.status(400).json({
        error:
          "Faltan campos requeridos: dni, nombre, apellido, email, password, telefono, fecha_nacimiento, sexo",
      });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const db = getDB();

    // Validar duplicado
    const [dup] = await db.query(
      `SELECT 1 FROM usuario WHERE email = ? LIMIT 1`,
      [emailNorm]
    );
    if ((dup as any[]).length > 0) {
      return res.status(409).json({ error: "Email ya registrado" });
    }

    const hash = await bcrypt.hash(String(password), 10);
    const rol = Number.isFinite(Number(rol_idrol)) ? Number(rol_idrol) : 3;
    const muni = Number.isFinite(Number(municipio_idmunicipio))
      ? Number(municipio_idmunicipio)
      : 1;
    const puntos = 0;
    const activo = 1;

    const [result] = await db.execute(
      `
      INSERT INTO usuario
        (DNI, CUIT, nombre, apellido, email, password, telefono, fecha_nacimiento,
         rol_idrol, municipio_idmunicipio, foto_perfil, puntos, sexo, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        String(dni),
        cuit ? String(cuit) : null,
        nombre,
        apellido,
        emailNorm,
        hash,
        String(telefono),
        String(fecha_nacimiento),
        rol,
        muni,
        foto_perfil ?? null,
        puntos,
        String(sexo),
        activo,
      ]
    );

    const id = (result as any).insertId;

    const user = {
      id,
      dni: String(dni),
      nombre,
      apellido,
      email: emailNorm,
      telefono: String(telefono),
      fecha_nacimiento: String(fecha_nacimiento),
      rol_idrol: rol,
      municipio_idmunicipio: muni,
      puntos,
      sexo: String(sexo),
      activo,
    };

    const token = signToken({ uid: id });
    res.status(201).json({ user, token });
  })
);

/**
 * POST /api/auth/login
 * Solo permite ingresar si usuario.activo = 1 y rol_idrol = 3
 */
router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "email y password son requeridos" });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const db = getDB();

    const [rows] = await db.query(
      `
      SELECT
        idusuario, DNI, CUIT, nombre, apellido, email, telefono,
        password AS password_hash,
        puntos, rol_idrol, municipio_idmunicipio,
        fecha_nacimiento, sexo, foto_perfil, activo
      FROM usuario
      WHERE email = ?
      LIMIT 1
      `,
      [emailNorm]
    );

    const row = (rows as any[])[0];
    if (!row) return res.status(401).json({ error: "Credenciales inválidas" });

    if (Number(row.activo) !== 1) {
      return res.status(403).json({ error: "Tu cuenta está inactiva. Contactá con soporte." });
    }

    const ok = await bcrypt.compare(String(password), String(row.password_hash));
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    if (Number(row.rol_idrol) !== 3) {
      return res.status(403).json({ error: "Tu rol no tiene permiso para esta app." });
    }

    const user = {
      id: row.idusuario,
      dni: row.DNI,
      cuit: row.CUIT,
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      telefono: row.telefono,
      puntos: row.puntos,
      rol_idrol: row.rol_idrol,
      municipio_idmunicipio: row.municipio_idmunicipio,
      fecha_nacimiento: row.fecha_nacimiento,
      sexo: row.sexo,
      foto_perfil: row.foto_perfil,
      activo: row.activo,
    };

    const token = signToken({ uid: user.id });
    res.json({ user, token });
  })
);


/**
 * POST /api/auth/forgot
 * body: { email }
 * - Genera un código (OTP) de 6 dígitos, vence a los 15 minutos
 * - Guarda hash del código
 * - Envía el código por email (o log por consola en dev)
 * - Siempre responde 200 para no filtrar si el email existe o no
 */
router.post(
  "/forgot",
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body ?? {};
    const emailNorm = String(email || "").trim().toLowerCase();
    if (!emailNorm) return res.json({ ok: true });

    const db = getDB();
    const [rows] = await db.query(
      `SELECT idusuario, email FROM usuario WHERE email = ? LIMIT 1`,
      [emailNorm]
    );
    const user = (rows as any[])[0];

    if (user) {
      const code = genCode(6);
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

      // Anulo códigos anteriores sin usar
      await db.execute(
        `DELETE FROM password_reset_codes WHERE usuario_id = ? AND used_at IS NULL`,
        [user.idusuario]
      );

      await db.execute(
        `INSERT INTO password_reset_codes (usuario_id, code_hash, expires_at)
         VALUES (?, ?, ?)`,
        [user.idusuario, codeHash, expiresAt]
      );

      await sendPasswordResetEmail(emailNorm, code);
    }

    // Respuesta genérica
    res.json({ ok: true });
  })
);

/**
 * POST /api/auth/reset
 * body: { email, code, new_password }
 * - Valida código, vencimiento y marca como usado
 * - Actualiza password del usuario
 */
router.post(
  "/reset",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, code, new_password } = req.body ?? {};
    const emailNorm = String(email || "").trim().toLowerCase();
    const plainCode = String(code || "").trim();
    const newPass = String(new_password || "");

    if (!emailNorm || !plainCode || newPass.length < 6) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const db = getDB();
    const [rows] = await db.query(
      `SELECT idusuario FROM usuario WHERE email = ? LIMIT 1`,
      [emailNorm]
    );
    const user = (rows as any[])[0];
    if (!user) return res.status(400).json({ error: "Código inválido" });

    const [codes] = await db.query(
      `SELECT id, code_hash, expires_at, used_at
       FROM password_reset_codes
       WHERE usuario_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.idusuario]
    );
    const rec = (codes as any[])[0];
    if (!rec || rec.used_at) return res.status(400).json({ error: "Código inválido" });

    const now = new Date();
    if (new Date(rec.expires_at) < now) {
      return res.status(400).json({ error: "Código vencido" });
    }

    const match = await bcrypt.compare(plainCode, rec.code_hash);
    if (!match) return res.status(400).json({ error: "Código inválido" });

    const hash = await bcrypt.hash(newPass, 10);

    await db.execute(
      `UPDATE usuario SET password = ? WHERE idusuario = ?`,
      [hash, user.idusuario]
    );

    await db.execute(
      `UPDATE password_reset_codes SET used_at = NOW() WHERE id = ?`,
      [rec.id]
    );

    res.json({ ok: true });
  })
);

export default router;
