import { Request, Response } from "express";
import {
  obtenerHistorialCompletoDB,
  obtenerHistorialDB,
} from "../models/historial-model.js";

export const getHistorial = async (req: Request, res: Response): Promise<void> => {
  try {
    const idRecolector = req.user!.id;

    if (req.query.completo === "1") {
      const pagina = Math.max(1, Number(req.query.pagina) || 1);
      const limite = Math.min(8, Math.max(1, Number(req.query.limite) || 8));
      const mes = Number(req.query.mes);
      const anio = Number(req.query.anio);
      const tipo = typeof req.query.tipo === "string" ? req.query.tipo.trim() : "";

      const historial = await obtenerHistorialCompletoDB(idRecolector, {
        pagina,
        limite,
        mes: mes >= 1 && mes <= 12 ? mes : undefined,
        anio: anio >= 2000 && anio <= 2100 ? anio : undefined,
        tipo: tipo || undefined,
      });
      res.json(historial);
      return;
    }

    const historial = await obtenerHistorialDB(idRecolector);

    res.json(historial);
  } catch (error: any) {
    console.error("❌ Error al obtener historial:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
