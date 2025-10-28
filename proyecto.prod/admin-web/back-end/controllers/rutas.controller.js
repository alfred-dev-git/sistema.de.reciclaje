import { obtenerCantRutasPorRecolector } from "../models/rutas.recolectores.model.js";
import { asignarRutaARecolector } from "../models/rutas.recolectores.model.js";
import { cambiarRecolectorRuta } from "../models/rutas.recolectores.model.js";
import { pool } from "../config/db.js";

/**
 * Endpoint para obtener todas las rutas pendientes y no, de los recolectores
 */
export const getCantRutas = async (req, res) => {
  try {
    const cantrutas = await obtenerCantRutasPorRecolector();
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

export const cambiarRecolector = async (req, res) => {
  try {
    const { id_ruta, id_recolector } = req.body;
    if (!id_ruta || !id_recolector) {
      return res.status(400).json({
        success: false,
        message: "Datos incompletos: se requiere idRuta e idRecolector",
      });
    }

    const resultado = await cambiarRecolectorRuta(id_ruta, id_recolector);

    // 🟢 Evitamos el 404 para errores lógicos
    if (!resultado.success) {
      return res.status(200).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    console.error("❌ Error en cambiarRecolector:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al cambiar el recolector",
    });
  }
};




export const anularRuta = async (req, res) => {
  const { idRuta } = req.body;

  if (!idRuta) {
    return res.status(400).json({ message: "Falta el ID de la ruta." });
  }

  const connection = await pool.getConnection();
  try {
    // 1️⃣ Obtener todos los pedidos asociados a la ruta
    const [pedidos] = await connection.query(
      "SELECT pedidos_idpedidos FROM pedidos_rutas WHERE rutas_asignadas_idrutas_asignadas = ?",
      [idRuta]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({ message: "No hay pedidos asociados a esta ruta." });
    }

    // 2️⃣ Obtener solo los IDs de pedidos
    const idsPedidos = pedidos.map((p) => p.pedidos_idpedidos);

    // 3️⃣ Filtrar los que NO estén completados (estado = 0)
    const [pendientes] = await connection.query(
      "SELECT idpedidos FROM pedidos WHERE idpedidos IN (?) AND estado = 0",
      [idsPedidos]
    );

    if (pendientes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No hay pedidos pendientes para anular (todos completados).",
      });
    }

    const idsPendientes = pendientes.map((p) => p.idpedidos);

    // 4️⃣ Actualizar solo los pendientes → estado = 2 (anulado)
    await connection.query(
      "UPDATE pedidos SET estado = 2 WHERE idpedidos IN (?)",
      [idsPendientes]
    );

    res.json({
      success: true,
      message: `Ruta ${idRuta} anulada correctamente.`,
      pedidosAnulados: idsPendientes.length,
      pedidosIgnorados: idsPedidos.length - idsPendientes.length,
    });
  } catch (error) {
    console.error("Error al anular ruta:", error);
    res.status(500).json({ message: "Error al anular la ruta", error });
  } finally {
    connection.release();
  }
};


//novedad_rutas