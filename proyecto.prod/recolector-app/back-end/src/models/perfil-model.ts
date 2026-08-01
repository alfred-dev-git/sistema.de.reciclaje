import { RowDataPacket, ResultSetHeader } from "mysql2";
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
  municipio: string;
}

export interface Municipio extends RowDataPacket {
  idmunicipio: number;
  descripcion: string;
}

const normalizarTelefono = (tel: string) => {
  return tel.replace(/[^0-9]/g, "");
};

export interface UpdateUsuario {
  idusuario: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  dni?: string;
  idmunicipio?: number | null;
}

export const actualizarUsuarioDB = async (
  data: UpdateUsuario
): Promise<boolean> => {
  const {
    idusuario,
    nombre,
    apellido,
    email,
    telefono,
    fecha_nacimiento,
    idmunicipio,
  } = data;

  const telefonoNormalizado = telefono
    ? telefono.replace(/\D/g, "")
    : undefined;

  // Verificar duplicados
  const [dup] = await pool.query<RowDataPacket[]>(
    `
    SELECT idusuario
    FROM usuarios
    WHERE idusuario <> ?
      AND (email = ? OR telefono = ?)
    LIMIT 1
    `,
    [idusuario, email, telefonoNormalizado]
  );

  if (dup.length > 0) {
    throw new Error("DUPLICATE");
  }

  const fields: string[] = [];
  const values: any[] = [];

  if (nombre) {
    fields.push("nombre = ?");
    values.push(nombre);
  }

  if (apellido) {
    fields.push("apellido = ?");
    values.push(apellido);
  }

  if (email) {
    fields.push("email = ?");
    values.push(email.trim().toLowerCase());
  }

  if (telefono) {
    fields.push("telefono = ?");
    values.push(telefonoNormalizado);
  }

  if (fecha_nacimiento) {
    fields.push("fecha_nacimiento = ?");
    values.push(fecha_nacimiento);
  }

  if (idmunicipio !== undefined && idmunicipio !== null) {
    fields.push("municipio_idmunicipio = ?");
    values.push(idmunicipio);
  }

  if (fields.length === 0) return true;

  values.push(idusuario);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE usuarios SET ${fields.join(", ")} WHERE idusuario = ?`,
    values
  );

  return result.affectedRows > 0;
};

export const crearUsuarioDB = async (
  usuario: NuevoUsuario
): Promise<UsuarioCreado | null> => {
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

  // Verificar duplicados
  const [existe] = await pool.query<RowDataPacket[]>(
    `
    SELECT idusuario
    FROM usuarios
    WHERE DNI = ?
       OR email = ?
       OR telefono = ?
    LIMIT 1
    `,
    [dni, email, telefonoNormalizado]
  );

  if (existe.length > 0) {
    throw new Error(
      "DUPLICATE: El DNI, correo o teléfono ya están registrados"
    );
  }

  // Hashear contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear usuario
  const [result] = await pool.query<ResultSetHeader>(
    `
    INSERT INTO usuarios
    (
      DNI,
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      rol_idrol,
      municipio_idmunicipio,
      password,
      activo
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `,
    [
      dni,
      nombre,
      apellido,
      email,
      telefonoNormalizado,
      fecha_nacimiento,
      4,
      idmunicipio,
      hashedPassword,
    ]
  );

  if (result.affectedRows === 0) return null;

  const userId = result.insertId;

  // Crear recolector
  await pool.query<ResultSetHeader>(
    `
    INSERT INTO recolector (usuario_idusuario)
    VALUES (?)
    `,
    [userId]
  );

  // Retornar usuario creado
  const [rows] = await pool.query<UsuarioCreado[]>(
    `
    SELECT
      idusuario,
      nombre,
      email
    FROM usuarios
    WHERE idusuario = ?
    `,
    [userId]
  );

  return rows[0];
};

export const obtenerMunicipiosDB = async (): Promise<Municipio[]> => {
  const [rows] = await pool.query<Municipio[]>(
    `
    SELECT
      idmunicipio,
      descripcion
    FROM municipio
    ORDER BY descripcion ASC
    `
  );

  return rows;
};

export const obtenerPerfilDB = async (
  idRecolector: number
): Promise<PerfilUsuario | null> => {
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
      m.descripcion AS municipio
    FROM recolector r
    INNER JOIN usuarios u
      ON r.usuario_idusuario = u.idusuario
    INNER JOIN municipio m
      ON u.municipio_idmunicipio = m.idmunicipio
    WHERE r.idrecolector = ?
    `,
    [idRecolector]
  );

  return rows.length > 0 ? rows[0] : null;
};

// Obtener foto de perfil
export const obtenerFotoPerfilDB = async (
  idRecolector: number
): Promise<string | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
      u.foto_perfil
    FROM recolector r
    INNER JOIN usuarios u
      ON r.usuario_idusuario = u.idusuario
    WHERE r.idrecolector = ?
    `,
    [idRecolector]
  );

  if (rows.length === 0) return null;

  return rows[0].foto_perfil ?? null;
};

// Actualizar foto de perfil
export const actualizarFotoPerfilRutaDB = async (
  idRecolector: number,
  ruta: string
): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    `
    UPDATE usuarios u
    INNER JOIN recolector r
      ON r.usuario_idusuario = u.idusuario
    SET u.foto_perfil = ?
    WHERE r.idrecolector = ?
    `,
    [ruta, idRecolector]
  );

  return result.affectedRows > 0;
};