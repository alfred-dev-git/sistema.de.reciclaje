import { Request, Response } from "express";
import { obtenerPerfilDB, actualizarFotoPerfilRutaDB  } from "../models/perfil-model.js";
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
