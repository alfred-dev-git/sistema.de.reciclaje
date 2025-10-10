import { RowDataPacket, ResultSetHeader  } from "mysql2";
import { pool } from "../db.js";

export interface PerfilUsuario extends RowDataPacket {
  DNI: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  foto_perfil: string | null;
  puntos: number;
  municipio: string; 
}

export const obtenerPerfilDB = async (idRecolector: number): Promise<PerfilUsuario | null> => {
  const [rows] = await pool.query<PerfilUsuario[]>(
    `
    SELECT 
      u.DNI,
      u.nombre,
      u.apellido,
      u.email,
      u.telefono,
      u.fecha_nacimiento,
      u.foto_perfil,
      u.puntos,
      m.descripcion AS municipio
    FROM recolector r
    INNER JOIN usuario u ON r.idusuario = u.idusuario
    INNER JOIN municipio m ON u.municipio_idmunicipio = m.idmunicipio
    WHERE r.idrecolector = ?
    `,
    [idRecolector]
  );

  return rows.length > 0 ? rows[0] : null;
};
// Obtener la foto de perfil de un recolector
export const obtenerFotoPerfilDB = async (idRecolector: number): Promise<string | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT u.foto_perfil
    FROM recolector r
    INNER JOIN usuario u ON r.idusuario = u.idusuario
    WHERE r.idrecolector = ?
    `,
    [idRecolector]
  );

  if (rows.length === 0) return null;
  return rows[0].foto_perfil ?? null; 
};

// Actualizar la foto de perfil de un recolector
export const actualizarFotoPerfilRutaDB = async (idRecolector: number, ruta: string): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    `
    UPDATE usuario u
    INNER JOIN recolector r ON r.idusuario = u.idusuario
    SET u.foto_perfil = ?
    WHERE r.idrecolector = ?
    `,
    [ruta, idRecolector]
  );

  return result.affectedRows > 0;
};