import { Request, Response } from "express";
import { obtenerHistorialDB } from "../models/historial-model.js";

export const getHistorial = async (req: Request, res: Response): Promise<void> => {
  try {
    const idRecolector = req.user!.id;

    const historial = await obtenerHistorialDB(idRecolector);

    res.json(historial);
  } catch (error: any) {
    console.error("❌ Error al obtener historial:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
