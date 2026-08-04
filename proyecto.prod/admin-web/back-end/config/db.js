import mysql2 from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

// Validación de variables de entorno
if (!DB_HOST || !DB_PORT || !DB_USER || DB_PASSWORD === undefined || !DB_NAME) {
  throw new Error("Faltan variables de entorno para la base de datos");
}

// Crear y exportar un pool de conexiones
export const pool = mysql2.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD || undefined,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0, // 0 = sin límite
});
