import { obtenerTiposReciclableDB } from "../models/reciclables.model.js";

export const getTiposReciclable = async (req, res) => {
  try {
    const tipos = await obtenerTiposReciclableDB();
    res.json(tipos);
  } catch (error) {
    console.error("❌ Error al obtener tipos de reciclable:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
