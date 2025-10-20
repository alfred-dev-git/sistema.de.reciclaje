import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken<T = any>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}
