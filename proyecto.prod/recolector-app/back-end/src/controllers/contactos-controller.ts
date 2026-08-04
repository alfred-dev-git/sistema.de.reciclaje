import { Request, Response } from "express";
import { obtenerContactosAdminDB } from "../models/contactos-model.js";

export const getContactosAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const idRecolector = req.user!.id; // ESTE VIENE DEL TOKEN (idrecolector)

    const contactos = await obtenerContactosAdminDB(idRecolector);

    res.json({
      success: true,
      message: "Contactos obtenidos",
      data: contactos,
    });
  } catch (error: any) {
    console.error("Error al obtener contactos:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
