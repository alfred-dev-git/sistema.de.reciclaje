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
};

type Recolector = {
  idrecolector: number;
  estado: number;
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

    // Buscar usuario
    const [results] = await pool.query<(RowDataPacket & Usuario)[]>(
      "SELECT * FROM usuario WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = results[0];

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Buscar si es recolector y obtener su estado
    const [recolectorRows] = await pool.query<(RowDataPacket & Recolector)[]>(
      "SELECT idrecolector, estado FROM recolector WHERE idusuario = ?",
      [user.idusuario]
    );

    if (recolectorRows.length === 0) {
      return res
        .status(401)
        .json({ message: "No se encontró un recolector asociado" });
    }

    const recolector = recolectorRows[0];

    // Verificar si está inhabilitado
    if (recolector.estado === 0) {
      return res
        .status(401)
        .json({ message: "Recolector inhabilitado. Contacte con soporte." });
    }

    // Validar configuración JWT
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRE) {
      throw new Error("Faltan variables JWT_SECRET o JWT_EXPIRE");
    }

    const secret = process.env.JWT_SECRET;
    const expireMs = ms(process.env.JWT_EXPIRE as StringValue);
    const expireSec = Math.floor(expireMs / 1000);

    // Token con ID del recolector
    const payload: JwtPayload = {
      id: recolector.idrecolector,
      email: user.email,
    };

    const token = jwt.sign(payload, secret, { expiresIn: expireSec });

    // Respuesta
    res.json({
      message: "Login exitoso",
      token,
      user: {
        email: user.email,
        rol: user.rol_idrol,
        nombre: user.nombre,       
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error de servidor" });
  }
};
