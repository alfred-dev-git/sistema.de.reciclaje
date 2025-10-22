import { obtenerCantRutasPorRecolector } from "../models/rutas.recolectores.model.js";
import { asignarRutaARecolector } from "../models/rutas.recolectores.model.js";

/**
 * Endpoint para obtener todas las rutas pendientes y no, de los recolectores
 */
export const getCantRutas = async (req, res) => {
  try {
    const cantrutas = await obtenerCantRutasPorRecolector();
    console.log("Resultado de obtenerCantRutasPorRecolector:", cantrutas);
    res.json(cantrutas);
  } catch (error) {
    console.error("Error al obtener cantidad de rutass:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Endpoint asignar rutas pendientes al recolector
 */
export const asignarRuta = async (req, res) => {
  try {
    const { idrecolector, pedidos } = req.body;

    if (!idrecolector || !Array.isArray(pedidos) || pedidos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Datos incompletos: se requiere idrecolector y lista de pedidos",
      });
    }

    const resultado = await asignarRutaARecolector(idrecolector, pedidos);

    if (!resultado.success) {
      return res.status(500).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    console.error("❌ Error en postAsignarRuta:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al asignar la ruta",
    });
  }
};
//novedad_rutas