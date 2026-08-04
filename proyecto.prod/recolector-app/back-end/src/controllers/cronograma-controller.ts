import { Request, Response } from "express";
import { obtenerCronogramaDB } from "../models/cronograma-model.js";

export const getCronograma = async (req: Request, res: Response): Promise<void> => {
  try {
    const cronograma = await obtenerCronogramaDB();
    res.json(cronograma);
  } catch (error: any) {
    console.error("❌ Error al obtener Cronograma:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

