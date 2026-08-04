import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import { sendMail } from '@/utils/mailer';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = (process.env.JWT_EXPIRES ?? "7d") as SignOptions["expiresIn"];

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: object) {
  const secret = JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET no configurado");
  return jwt.sign(payload as any, secret, { expiresIn: JWT_EXPIRES });
}

export function verifyToken<T extends JwtPayload | string = JwtPayload>(token: string) {
  const secret = JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET no configurado");
  return jwt.verify(token, secret) as T;
}

export async function sendPasswordResetEmail(email: string, code: string): Promise<void> {
  const subject = 'Restablecer contraseña';
  const html = `<p>Tu código para restablecer la contraseña es: <strong>${code}</strong></p>`;
  await sendMail(email, subject, html);
}
