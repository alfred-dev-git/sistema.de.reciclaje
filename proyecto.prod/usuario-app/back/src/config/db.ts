import { createPool, Pool } from "mysql2/promise";
import "dotenv/config";

let pool: Pool;

export function getDB() {
  if (!pool) {
    pool = createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || undefined,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT ?? 3306),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: "Z"
    });
  }
  return pool;
}
