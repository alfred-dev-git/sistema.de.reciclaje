import { Request, Response } from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt, {JwtPayload } from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import ms, { StringValue } from 'ms';

// Tipo de usuario en la base de datos
type Usuario = {
  idusuario: number;
  email: string;
  password: string;
  nombre: string;
  rol_idrol: number;
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son obligatorios" });
    }

    // Tipamos correctamente los resultados
    const [results] = await pool.query<(RowDataPacket & Usuario)[]>(
      "SELECT * FROM usuario WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = results[0];

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }
    if (!process.env.JWT_EXPIRE) {
      throw new Error("EXPIRE no definido");
    }

    const secret = process.env.JWT_SECRET!;
    if (!secret) throw new Error("SECRET no definido");

    const expireMs = ms(process.env.JWT_EXPIRE as StringValue);

    if (!expireMs) {
      throw new Error("JWT_EXPIRE no es un valor válido");
    }
    const expireSec = Math.floor(expireMs / 1000);
    // Payload para el token
    const payload: JwtPayload = {
      id: user.idusuario,
      email: user.email,
    };

    const token = jwt.sign(payload, secret, { expiresIn: expireSec });

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
