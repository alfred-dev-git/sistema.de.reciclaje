import { Request, Response } from "express";
import { obtenerPedidosAsignadosDB } from "../models/paradas-model.js";

export const getPedidosAsignados = async (req: Request, res: Response): Promise<void> => {
  try {
    const idRecolector = req.user!.id;

    const pedidos = await obtenerPedidosAsignadosDB(idRecolector);

    res.json(pedidos);

  } catch (error: any) {
    console.error("Error al obtener pedidos asignados:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
