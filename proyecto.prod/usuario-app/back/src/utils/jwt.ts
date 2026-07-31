// utils/jwt.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES as string;

export const signToken = (payload: any) => {
  const secret = JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET no configurado");
  return jwt.sign(payload, secret, {
    expiresIn: JWT_EXPIRES,
  } as jwt.SignOptions);
};

export function verifyToken<T = any>(token: string): T {
  const secret = JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET no configurado");
  return jwt.verify(token, secret) as T;
}
