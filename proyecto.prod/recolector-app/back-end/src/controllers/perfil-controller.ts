import { Request, Response } from "express";
import { obtenerPerfilDB, actualizarFotoPerfilRutaDB, obtenerMunicipiosDB, crearUsuarioDB, actualizarUsuarioDB } from "../models/perfil-model.js";
import { RowDataPacket, ResultSetHeader  } from "mysql2";
import { pool } from "../db.js";

export const actualizarPerfil = async (req: Request, res: Response) => {
  try {
    const idrecolector = req.user!.id; 

    if (!idrecolector) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // Obtener el idusuario real
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT idusuario FROM recolector WHERE idrecolector = ?",
      [idrecolector]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const idusuario = rows[0].idusuario;

    const {
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      municipio_idmunicipio
    } = req.body;
    const idMuni =
      municipio_idmunicipio === undefined ||
      municipio_idmunicipio === null ||
      municipio_idmunicipio === ""
        ? null
        : Number(municipio_idmunicipio);

    const ok = await actualizarUsuarioDB({
      idusuario, // <- el correcto ahora
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      idmunicipio: idMuni,
    });

    if (!ok) {
      return res.status(500).json({
        success: false,
        message: "No se pudo actualizar el perfil"
      });
    }

    // Obtener perfil actualizado
    const perfilActualizado = await obtenerPerfilDB(idusuario);

    return res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      data: perfilActualizado
    });

  } catch (error: any) {
    console.error("❌ Error al actualizar perfil:", error.message);

    if (error.message === "DUPLICATE") {
      return res.status(409).json({
        success: false,
        message: "El correo o teléfono ya están registrados"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    let {
      dni,
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      idmunicipio,
      password,
    } = req.body;

    email = email?.trim().toLowerCase();
    password = password?.trim();

    // Crear el usuario
    const nuevoUsuario = await crearUsuarioDB({
      dni,
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      idmunicipio,
      password,
    });

    if (!nuevoUsuario) {
      res.status(500).json({ message: "Error al registrar usuario" });
      return;
    }

    res.status(201).json({
      message: "Usuario creado correctamente",
      data: nuevoUsuario,
    });
   } catch (error: any) {
    console.error("❌ Error al crear usuario:", error.message);

    // Detectar error de duplicado
    if (error.message.includes("correo") || error.message.includes("teléfono")) {
      res.status(409).json({
        code: "DUPLICATE",
        message: "El DNI, correo o teléfono ya están registrados",
      });
      return;
    }

    // Otros errores
    res.status(500).json({
      code: "SERVER_ERROR",
      message: "Error interno del servidor",
    });
  }
};


// GET /api/perfil
export const getPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const idRecolector = req.user!.id; 
    const perfil = await obtenerPerfilDB(idRecolector);
    if (!perfil) {
      res.status(404).json({ message: "Perfil no encontrado" });
      return;
    }

    res.json(perfil);
  } catch (error: any) {
    console.error("❌ Error al obtener perfil:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getMunicipios = async (req: Request, res: Response): Promise<void> => {
  try {
    const municipios = await obtenerMunicipiosDB();
    res.json({
      success: true,
      message: "Municipios obtenidos correctamente",
      data: municipios,
    });
  } catch (error: any) {
    console.error("❌ Error al obtener municipios:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};
// POST /api/perfil/foto
export const updateFotoPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const idRecolector = req.user!.id;
    const { foto_perfil  } = req.body;
    
    if (!foto_perfil ) {
      res.status(400).json({ message: "No se recibió ninguna ruta de imagen" });
      return;
    }

    await actualizarFotoPerfilRutaDB(idRecolector, foto_perfil );

    res.json({ message: "✅ Ruta de imagen guardada correctamente", path: foto_perfil  });
  } catch (error: any) {
    console.error("❌ Error al guardar ruta de foto:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// GET /api/perfil/foto
export const getFotoPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const idRecolector = req.user!.id;
    const perfil = await obtenerPerfilDB(idRecolector);

    if (!perfil?.foto_perfil) {
      res.status(404).json({ message: "No tiene foto de perfil" });
      return;
    }

    // Convertir de hex a buffer
    const buffer = Buffer.from(perfil.foto_perfil.slice(2), "hex");

    res.setHeader("Content-Type", "image/jpeg");
    res.send(buffer);
  } catch (error: any) {
    console.error("❌ Error al obtener foto de perfil:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
