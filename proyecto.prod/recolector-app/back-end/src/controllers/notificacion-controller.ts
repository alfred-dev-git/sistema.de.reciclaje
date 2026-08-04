import { Request, Response } from "express";
import { getNotificacion } from "../models/notificacion-model.js";

export const notificacionRes = async (req: Request, res: Response): Promise<void> => {
  try {

    const notificacion = await getNotificacion(req.user!.id);

    res.json(notificacion);
  } catch (error: any) {
    console.error("❌ Error al obtener notificaciones:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
