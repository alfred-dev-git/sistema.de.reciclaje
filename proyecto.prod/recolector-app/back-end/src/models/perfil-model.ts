import { RowDataPacket, ResultSetHeader  } from "mysql2";
import { pool } from "../db.js";
import bcrypt from "bcrypt";

export interface NuevoUsuario {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  idmunicipio: number;
  password: string;
}

export interface UsuarioCreado extends RowDataPacket {
  idusuario: number;
  nombre: string;
  email: string;
}

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
export interface Municipio extends RowDataPacket {
  idmunicipio: number;
  descripcion: string;
}

const normalizarTelefono = (tel: string) => {
  return tel.replace(/[^0-9]/g, ""); // deja solo números
};

export const crearUsuarioDB = async (usuario: NuevoUsuario): Promise<UsuarioCreado | null> => {
  const {
    dni,
    nombre,
    apellido,
    email,
    telefono,
    fecha_nacimiento,
    idmunicipio,
    password,
  } = usuario;
  
  const telefonoNormalizado = normalizarTelefono(telefono);

  // Validar duplicados de email o teléfono
  const [existe] = await pool.query<RowDataPacket[]>(
    `SELECT idusuario FROM usuario WHERE DNI = ? OR email = ? OR telefono = ? LIMIT 1`,
    [dni, email, telefonoNormalizado]
  );

  if (existe.length > 0) {
    throw new Error("DUPLICATE: El DNI, correo o teléfono ya están registrados");
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);
  // Insertar usuario
  const [result] = await pool.query<ResultSetHeader>(
    `
    INSERT INTO usuario 
      (DNI, nombre, apellido, email, telefono, fecha_nacimiento, rol_idrol, municipio_idmunicipio, password, puntos, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)
    `,
    [
      dni,
      nombre,
      apellido,
      email,
      telefonoNormalizado,
      fecha_nacimiento,
      4, // idrol = 4 (recolector)
      idmunicipio,
      hashedPassword,
    ]
  );

  if (result.affectedRows === 0) return null;

  const userId = result.insertId;

  //Crear registro en tabla recolector
  await pool.query<ResultSetHeader>(
    `INSERT INTO recolector (idusuario) VALUES (?)`,
    [userId]
  );

  // Retornar el usuario creado
  const [rows] = await pool.query<UsuarioCreado[]>(
    `SELECT idusuario, nombre, email FROM usuario WHERE idusuario = ?`,
    [userId]
  );

  return rows[0];
};


export const obtenerMunicipiosDB = async (): Promise<Municipio[]> => {
  const [rows] = await pool.query<Municipio[]>(
    `SELECT idmunicipio, descripcion FROM municipio ORDER BY descripcion ASC`
  );
  return rows;
};

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