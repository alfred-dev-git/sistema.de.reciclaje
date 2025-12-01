import { obtenerPedidosSinAsignar } from "../models/paradas.model.js";
import { obtenerPedidosPorRecolector } from "../models/paradas.model.js";

/**
 * Endpoint para obtener todas las rutas pendientes sin recolector asignado
 */
export const getParadas = async (req, res) => {
  try {
    const idAdmin = req.user.idusuario;
    const pedidos = await obtenerPedidosSinAsignar(idAdmin);
    res.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos sin asignar:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


/**
 * Endpoint para obtener todas las paradas asignadas a un recolector
 * Solo trae pedidos donde estado = 0 (pendiente) y estado_ruta = 1 (con ruta armada)
 */
export const getParadasRecolector = async (req, res) => {
  try {
    const { idRecolector } = req.query;
    if (!idRecolector) {
      return res.status(400).json({ message: "Falta el parámetro idRecolector" });
    }

    const pedidos = await obtenerPedidosPorRecolector(idRecolector);
    res.json(pedidos);
  } catch (error) {
    console.error("❌ Error al obtener pedidos del recolector:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
