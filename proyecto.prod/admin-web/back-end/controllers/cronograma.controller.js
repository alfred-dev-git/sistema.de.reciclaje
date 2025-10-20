import { obtenerCronogramaDB } from "../models/cronograma.model.js";

export const getCronograma = async (req, res) => {
  try {
    const cronograma = await obtenerCronogramaDB();
    res.json(cronograma);
  } catch (error) {
    console.error("❌ Error al obtener Cronograma:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
