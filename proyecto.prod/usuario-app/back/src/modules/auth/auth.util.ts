import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_cambialo";
const JWT_EXPIRES = (process.env.JWT_EXPIRES ?? "7d") as SignOptions["expiresIn"];

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: object) {
  return jwt.sign(payload as any, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken<T extends JwtPayload | string = JwtPayload>(token: string) {
  return jwt.verify(token, JWT_SECRET) as T;
}
