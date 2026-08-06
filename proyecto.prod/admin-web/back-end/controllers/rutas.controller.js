import {
  asignarRutaARecolector,
  cambiarRecolectorRuta,
  crearNotificacionRutaDB,
  obtenerCantRutasPorRecolector,
  cambiarFechaRuta,
  obtenerHistorialRutas,
} from "../models/rutas.recolectores.model.js";
import { pool } from "../config/db.js";

export const getCantRutas = async (_req, res) => {
  try {
    res.json(await obtenerCantRutasPorRecolector());
  } catch (error) {
    console.error("Error al obtener cantidad de rutas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const asignarRuta = async (req, res) => {
  try {
    const { idrecolector, pedidos, fecha_programada } = req.body;
    const fechaValida = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(fecha_programada || "");
    if (!idrecolector || !Array.isArray(pedidos) || pedidos.length === 0 || !fechaValida) {
      return res.status(400).json({
        success: false,
        message: "Se requiere recolector, al menos una solicitud y una fecha válida",
      });
    }

    const resultado = await asignarRutaARecolector(
      idrecolector,
      pedidos,
      req.user.idusuario,
      fecha_programada
    );
    if (!resultado.success) return res.status(409).json(resultado);
    res.json(resultado);
  } catch (error) {
    console.error("Error al asignar ruta:", error);
    res.status(500).json({ success: false, message: "Error interno al asignar la ruta" });
  }
};

export const actualizarFechaRuta = async (req, res) => {
  try {
    const { id_ruta, fecha_programada } = req.body;
    if (!id_ruta || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(fecha_programada || "")) {
      return res.status(400).json({ success: false, message: "Ruta o fecha inválida" });
    }
    const resultado = await cambiarFechaRuta(id_ruta, fecha_programada);
    res.status(resultado.success ? 200 : 404).json(resultado);
  } catch (error) {
    console.error("Error al cambiar la fecha de ruta:", error);
    res.status(500).json({ success: false, message: "Error interno al cambiar la fecha" });
  }
};

export const historialRutas = async (_req, res) => {
  try {
    res.json(await obtenerHistorialRutas());
  } catch (error) {
    console.error("Error al obtener historial de rutas:", error);
    res.status(500).json({ message: "Error al obtener el historial de rutas" });
  }
};

export const cambiarRecolector = async (req, res) => {
  try {
    const { id_ruta, id_recolector } = req.body;
    if (!id_ruta || !id_recolector) {
      return res.status(400).json({
        success: false,
        message: "Datos incompletos: se requiere id_ruta e id_recolector",
      });
    }

    const resultado = await cambiarRecolectorRuta(id_ruta, id_recolector);
    res.status(resultado.success ? 200 : 409).json(resultado);
  } catch (error) {
    console.error("Error al cambiar recolector:", error);
    res.status(500).json({ success: false, message: "Error interno al cambiar el recolector" });
  }
};

export const anularRuta = async (req, res) => {
  const { idRuta } = req.body;
  if (!idRuta) return res.status(400).json({ message: "Falta el ID de la ruta." });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [solicitudes] = await connection.query(
      `SELECT solicitud_recoleccion_idsolicitud_recoleccion
       FROM solicitud_rutas WHERE rutas_idrutas = ?`,
      [idRuta]
    );

    if (solicitudes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "No hay solicitudes asociadas a esta ruta." });
    }

    const [estadoAnulado] = await connection.query(
      `SELECT idestado_solicitud FROM estado_solicitud
       WHERE LOWER(descripcion) IN ('anulada', 'anulado', 'cancelada', 'cancelado')
       LIMIT 1`
    );
    if (estadoAnulado.length === 0) {
      await connection.rollback();
      return res.status(409).json({ message: "No existe el estado de solicitud Anulada" });
    }

    const ids = solicitudes.map((item) => item.solicitud_recoleccion_idsolicitud_recoleccion);
    const [pendientes] = await connection.query(
      `SELECT s.idsolicitud_recoleccion
       FROM solicitud_recoleccion s
       INNER JOIN estado_solicitud es
         ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
       WHERE s.idsolicitud_recoleccion IN (?) AND LOWER(es.descripcion) = 'pendiente'
       FOR UPDATE`,
      [ids]
    );

    const idsPendientes = pendientes.map((item) => item.idsolicitud_recoleccion);
    if (idsPendientes.length > 0) {
      await connection.query(
        `UPDATE solicitud_recoleccion
         SET estado_solicitud_idestado_solicitud = ?
         WHERE idsolicitud_recoleccion IN (?)`,
        [estadoAnulado[0].idestado_solicitud, idsPendientes]
      );
    }

    await connection.commit();
    res.json({
      success: true,
      message: `Ruta ${idRuta} anulada correctamente.`,
      pedidosAnulados: idsPendientes.length,
      pedidosIgnorados: ids.length - idsPendientes.length,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al anular la ruta:", error);
    res.status(500).json({ message: "Error al anular la ruta" });
  } finally {
    connection.release();
  }
};

export const notificarRuta = async (req, res) => {
  try {
    const { idRuta, mensaje, titulo } = req.body;
    if (!idRuta || !mensaje?.trim()) {
      return res.status(400).json({ success: false, message: "Se requiere una ruta y un mensaje" });
    }

    const resultado = await crearNotificacionRutaDB(idRuta, mensaje.trim(), titulo?.trim());
    if (!resultado.success) return res.status(404).json(resultado);
    res.json({
      success: true,
      message: "Notificación enviada a los usuarios de la ruta",
      id: resultado.insertId,
    });
  } catch (error) {
    console.error("Error al notificar la ruta:", error);
    res.status(500).json({ success: false, message: "Error al crear la notificación" });
  }
};
