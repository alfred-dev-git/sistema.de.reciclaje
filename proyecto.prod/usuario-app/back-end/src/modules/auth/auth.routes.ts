import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { asyncHandler } from "@/utils/asyncHandler";
import { getDB } from "@/config/db";
import { signToken } from "@/utils/jwt";

const router = Router();

/**
 * POST /api/auth/register
 * Tabla: usuario(idusuario, DNI, nombre, apellido, email, password,
 *                telefono, fecha_nacimiento, rol_idrol,
 *                municipio_idmunicipio, puntos, sexo)
 *
 * Requeridos: dni, nombre, apellido, email, password, telefono, fecha_nacimiento, sexo
 * Defaults si no vienen: rol_idrol=2, municipio_idmunicipio=1, puntos=0
 */
router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      dni,
      nombre,
      apellido,
      email,
      password,
      telefono,
      fecha_nacimiento,
      sexo,
      rol_idrol,
      municipio_idmunicipio,
      puntos,
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
    const dniNorm = String(dni).trim();

    const db = getDB();

    // Duplicado por email
    const [dupEmail] = await db.query(
      `SELECT 1 FROM usuario WHERE email = ? LIMIT 1`,
      [emailNorm]
    );
    if ((dupEmail as any[]).length > 0) {
      return res.status(409).json({ error: "Email ya registrado" });
    }

    // (opcional) Duplicado por DNI si querés que sea único
    const [dupDni] = await db.query(
      `SELECT 1 FROM usuario WHERE DNI = ? LIMIT 1`,
      [dniNorm]
    );
    if ((dupDni as any[]).length > 0) {
      return res.status(409).json({ error: "DNI ya registrado" });
    }

    // Hash de password
    const hash = await bcrypt.hash(String(password), 10);

    // Defaults seguros (respetamos lo que ya venías usando)
    const rol = Number.isFinite(Number(rol_idrol)) ? Number(rol_idrol) : 2;
    const muni = Number.isFinite(Number(municipio_idmunicipio))
      ? Number(municipio_idmunicipio)
      : 1;
    const pts = Number.isFinite(Number(puntos)) ? Number(puntos) : 0;

    // Inserción explícita (agregamos DNI)
    const [result] = await db.execute(
      `INSERT INTO usuario
       (DNI, nombre, apellido, email, password, telefono, fecha_nacimiento, rol_idrol, municipio_idmunicipio, puntos, sexo)
       VALUES (?,   ?,      ?,        ?,     ?,        ?,        ?,               ?,        ?,                    ?,      ?)`,
      [
        dniNorm,
        nombre,
        apellido,
        emailNorm,
        hash,
        String(telefono),
        String(fecha_nacimiento), // "YYYY-MM-DD"
        rol,
        muni,
        pts,
        String(sexo), // "M"|"F"|"O"
      ]
    );

    const id = (result as any).insertId;

    // Respuesta + token
    const user = {
      id,
      dni: dniNorm,
      nombre,
      apellido,
      email: emailNorm,
      telefono: String(telefono),
      fecha_nacimiento: String(fecha_nacimiento),
      rol_idrol: rol,
      municipio_idmunicipio: muni,
      puntos: pts,
      sexo: String(sexo),
    };

    const token = signToken({ uid: id });
    res.status(201).json({ user, token });
  })
);

/**
 * POST /api/auth/login
 * (incluimos DNI en la respuesta)
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
      `SELECT
         idusuario, DNI, nombre, apellido, email, telefono,
         password AS password_hash,
         puntos, rol_idrol, municipio_idmunicipio, fecha_nacimiento, sexo
       FROM usuario
       WHERE email = ?
       LIMIT 1`,
      [emailNorm]
    );

    const row = (rows as any[])[0];
    if (!row) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(String(password), String(row.password_hash));
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const user = {
      id: row.idusuario,
      dni: row.dni,
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      telefono: row.telefono,
      puntos: row.puntos,
      rol_idrol: row.rol_idrol,
      municipio_idmunicipio: row.municipio_idmunicipio,
      fecha_nacimiento: row.fecha_nacimiento,
      sexo: row.sexo,
    };

    const token = signToken({ uid: user.id });
    res.json({ user, token });
  })
);

export default router;
