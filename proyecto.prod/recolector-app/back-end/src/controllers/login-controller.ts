import { Request, Response } from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import ms, { StringValue } from "ms";

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
