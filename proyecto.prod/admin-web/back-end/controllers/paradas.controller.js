import { obtenerPedidosSinAsignar } from "../models/paradas.model.js";

/**
 * Endpoint para obtener todas las rutas pendientes sin recolector asignado
 */
export const getParadas = async (req, res) => {
  try {
    const pedidos = await obtenerPedidosSinAsignar();
    res.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos sin asignar:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
