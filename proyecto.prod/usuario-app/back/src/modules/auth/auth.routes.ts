import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import asyncHandler from "@/utils/asyncHandler";
import getDB from "@/config/db";
import { signToken } from "@/utils/jwt";
import { sendPasswordResetEmail } from "./auth.util";
import { requireAuth } from "@/middlewares/auth";

const router = Router();

function genCode(len = 6) {
  let code = "";
  for (let i = 0; i < len; i++) code += Math.floor(Math.random() * 10);
  return code;
}

function sexoToDb(value: unknown) {
  const values: Record<string, number> = { M: 1, F: 2, O: 3 };
  return values[String(value).toUpperCase()] ?? 3;
}

function sexoFromDb(value: unknown) {
  const values: Record<number, "M" | "F" | "O"> = { 1: "M", 2: "F", 3: "O" };
  return values[Number(value)] ?? "O";
}

router.get(
  "/municipios",
  asyncHandler(async (_req: Request, res: Response) => {
    const [rows] = await getDB().query(
      `SELECT idmunicipio AS id, descripcion FROM municipio ORDER BY descripcion ASC`
    );
    res.json({ items: rows });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const [rows] = await getDB().query(
      `SELECT u.idusuario AS id, u.DNI AS dni, u.CUIT AS cuit, u.nombre,
              u.apellido, u.email, u.telefono, u.fecha_nacimiento,
              u.municipio_idmunicipio, u.sexo, u.foto_perfil, u.activo,
              r.descripcion AS rol
       FROM usuarios u
       INNER JOIN rol r ON r.idrol = u.rol_idrol
       INNER JOIN contribuyente c ON c.usuarios_idusuario = u.idusuario
       WHERE u.idusuario = ? LIMIT 1`,
      [req.user!.uid]
    );
    const user = (rows as Record<string, unknown>[])[0];
    if (!user || Number(user.activo) !== 1 || String(user.rol).toLowerCase() !== "contribuyente") {
      return res.status(401).json({ error: "Sesión inválida" });
    }
    user.sexo = sexoFromDb(user.sexo);
    delete user.rol;
    res.json({ user });
  })
);

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
      municipio_idmunicipio,
    } = req.body ?? {};

    if (!dni || !nombre || !apellido || !email || !password || !telefono || !fecha_nacimiento || !sexo || !municipio_idmunicipio) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const dniNorm = String(dni).replace(/\D+/g, "");
    const emailNorm = String(email).trim().toLowerCase();
    if (!/^\d{7,8}$/.test(dniNorm)) {
      return res.status(400).json({ error: "El DNI debe tener 7 u 8 números" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const db = getDB();
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [duplicates] = await connection.query(
        `SELECT idusuario FROM usuarios WHERE email = ? OR DNI = ? LIMIT 1`,
        [emailNorm, dniNorm]
      );
      if ((duplicates as unknown[]).length > 0) {
        await connection.rollback();
        return res.status(409).json({ error: "Email o DNI ya registrado" });
      }

      const [roles] = await connection.query(
        `SELECT idrol FROM rol WHERE LOWER(descripcion) = 'contribuyente' LIMIT 1`
      );
      const rol = (roles as { idrol: number }[])[0];
      if (!rol) throw new Error("No existe el rol Contribuyente");

      const [municipios] = await connection.query(
        `SELECT idmunicipio FROM municipio WHERE idmunicipio = ? LIMIT 1`,
        [Number(municipio_idmunicipio)]
      );
      if ((municipios as unknown[]).length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "Municipio inválido" });
      }

      const hash = await bcrypt.hash(String(password), 10);
      const [result] = await connection.execute(
        `INSERT INTO usuarios
          (DNI, CUIT, nombre, apellido, email, password, telefono, fecha_nacimiento,
           rol_idrol, municipio_idmunicipio, foto_perfil, sexo, activo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, 1)`,
        [
          dniNorm,
          cuit ? String(cuit) : null,
          String(nombre).trim(),
          String(apellido).trim(),
          emailNorm,
          hash,
          String(telefono),
          String(fecha_nacimiento),
          rol.idrol,
          Number(municipio_idmunicipio),
          sexoToDb(sexo),
        ]
      );
      const id = (result as { insertId: number }).insertId;
      await connection.execute(
        `INSERT INTO contribuyente (usuarios_idusuario) VALUES (?)`,
        [id]
      );
      await connection.commit();

      const user = {
        id,
        dni: dniNorm,
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        email: emailNorm,
        telefono: String(telefono),
        fecha_nacimiento: String(fecha_nacimiento),
        municipio_idmunicipio: Number(municipio_idmunicipio),
        sexo: String(sexo).toUpperCase(),
        activo: 1,
      };
      res.status(201).json({ user, token: signToken({ uid: id }) });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  })
);

router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    const [rows] = await getDB().query(
      `SELECT u.idusuario, u.DNI, u.CUIT, u.nombre, u.apellido, u.email,
              u.telefono, u.password AS password_hash, u.municipio_idmunicipio,
              u.fecha_nacimiento, u.sexo, u.foto_perfil, u.activo,
              r.descripcion AS rol
       FROM usuarios u
       INNER JOIN rol r ON r.idrol = u.rol_idrol
       INNER JOIN contribuyente c ON c.usuarios_idusuario = u.idusuario
       WHERE u.email = ?
       LIMIT 1`,
      [String(email).trim().toLowerCase()]
    );
    const row = (rows as Record<string, unknown>[])[0];
    if (!row || !(await bcrypt.compare(String(password), String(row.password_hash)))) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    if (Number(row.activo) !== 1) {
      return res.status(403).json({ error: "Tu cuenta está inactiva. Contactá con soporte." });
    }
    if (String(row.rol).toLowerCase() !== "contribuyente") {
      return res.status(403).json({ error: "Tu rol no tiene permiso para esta app." });
    }

    const user = {
      id: Number(row.idusuario),
      dni: row.DNI,
      cuit: row.CUIT,
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      telefono: row.telefono,
      municipio_idmunicipio: row.municipio_idmunicipio,
      fecha_nacimiento: row.fecha_nacimiento,
      sexo: sexoFromDb(row.sexo),
      foto_perfil: row.foto_perfil,
      activo: row.activo,
    };
    res.json({ user, token: signToken({ uid: user.id }) });
  })
);

router.post(
  "/forgot",
  asyncHandler(async (req: Request, res: Response) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.json({ ok: true });

    const db = getDB();
    const [rows] = await db.query(
      `SELECT idusuario FROM usuarios WHERE email = ? LIMIT 1`,
      [email]
    );
    const user = (rows as { idusuario: number }[])[0];
    if (user) {
      const code = genCode();
      const hash = await bcrypt.hash(code, 10);
      await db.execute(
        `DELETE FROM \`codigo_recuperacion_contraseña\`
         WHERE usuario_id = ? AND COALESCE(usado, 0) = 0`,
        [user.idusuario]
      );
      await db.execute(
        `INSERT INTO \`codigo_recuperacion_contraseña\`
          (usuario_id, code_hasheo, expiracion, usado)
         VALUES (?, ?, ?, 0)`,
        [user.idusuario, hash, new Date(Date.now() + 15 * 60 * 1000)]
      );
      await sendPasswordResetEmail(email, code);
    }
    res.json({ ok: true });
  })
);

router.post(
  "/reset",
  asyncHandler(async (req: Request, res: Response) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const code = String(req.body?.code || "").trim();
    const newPassword = String(req.body?.new_password || "");
    if (!email || !code || newPassword.length < 6) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const db = getDB();
    const [rows] = await db.query(`SELECT idusuario FROM usuarios WHERE email = ? LIMIT 1`, [email]);
    const user = (rows as { idusuario: number }[])[0];
    if (!user) return res.status(400).json({ error: "Código inválido" });

    const [codes] = await db.query(
      `SELECT id, code_hasheo, expiracion, usado
       FROM \`codigo_recuperacion_contraseña\`
       WHERE usuario_id = ? ORDER BY creado DESC LIMIT 1`,
      [user.idusuario]
    );
    const record = (codes as Record<string, unknown>[])[0];
    if (!record || Number(record.usado) === 1 || new Date(String(record.expiracion)) < new Date()) {
      return res.status(400).json({ error: "Código inválido o vencido" });
    }
    if (!(await bcrypt.compare(code, String(record.code_hasheo)))) {
      return res.status(400).json({ error: "Código inválido" });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute(`UPDATE usuarios SET password = ? WHERE idusuario = ?`, [await bcrypt.hash(newPassword, 10), user.idusuario]);
      await connection.execute(`UPDATE \`codigo_recuperacion_contraseña\` SET usado = 1 WHERE id = ?`, [record.id]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    res.json({ ok: true });
  })
);

export default router;
