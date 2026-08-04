import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '1d';

if (!JWT_SECRET) throw new Error("Falta JWT_SECRET");

export const signToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

export const decodeToken = (token) =>
  jwt.verify(token, JWT_SECRET);
