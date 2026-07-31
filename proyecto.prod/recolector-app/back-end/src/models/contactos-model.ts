import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export const obtenerContactosAdminDB = async (idRecolector: number) => {

  // Paso 1: obtener municipio del recolector
  const [recolectorRows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
      r.idrecolector,
      u.idusuario,
      u.municipio_idmunicipio AS municipio
    FROM recolector r
    INNER JOIN usuarios u
      ON u.idusuario = r.usuarios_idusuario
    WHERE r.idrecolector = ?
    `,
    [idRecolector]
  );

  if (recolectorRows.length === 0) return [];

  const municipio = recolectorRows[0].municipio;

  // Paso 2: traer SOLO datos de contacto de admins del municipio
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
      nombre,
      apellido,
      email,
      telefono,
      rol_idrol
    FROM usuarios
    WHERE municipio_idmunicipio = ?
      AND rol_idrol IN (1, 2)
      AND activo = 1
    `,
    [municipio]
  );

  return rows;
};