import { Request, Response } from "express";
import { pool } from "../db.js";

/**
 * Marcar solicitud como completada
 */
export const postMarcarCompletado = async (
  req: Request,
  res: Response
) => {
  const {
    idsolicitud_recoleccion,
    estado,
    cant_bolson,
    observaciones,
  } = req.body;

  if (
    !idsolicitud_recoleccion ||
    estado === undefined ||
    cant_bolson === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Faltan parámetros",
    });
  }

  try {
    // Actualizar estado de la solicitud
    await pool.execute(
      `
      UPDATE solicitud_recoleccion
      SET estado_solicitud_idestado_solicitud = ?
      WHERE idsolicitud_recoleccion = ?
      `,
      [estado, idsolicitud_recoleccion]
    );

    // Registrar detalle de la recolección
    await pool.execute(
      `
      INSERT INTO detalle_recoleccion
      (
        fecha_entrega,
        cant_bolson,
        observaciones,
        solicitud_recoleccion_idsolicitud_recoleccion
      )
      VALUES (NOW(), ?, ?, ?)
      `,
      [
        cant_bolson,
        observaciones || "Completado",
        idsolicitud_recoleccion,
      ]
    );

    res.json({
      success: true,
      message: "Solicitud marcada como completada",
    });
  } catch (error: any) {
    console.error("Error en postMarcarCompletado:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Error al completar la solicitud",
    });
  }
};

/**
 * Marcar solicitud como ausente
 */
export const postMarcarAusente = async (
  req: Request,
  res: Response
) => {
  const { idsolicitud_recoleccion, estado } = req.body;

  if (!idsolicitud_recoleccion || estado === undefined) {
    return res.status(400).json({
      success: false,
      message: "Faltan parámetros",
    });
  }

  try {
    // Actualizar estado de la solicitud
    await pool.execute(
      `
      UPDATE solicitud_recoleccion
      SET estado_solicitud_idestado_solicitud = ?
      WHERE idsolicitud_recoleccion = ?
      `,
      [estado, idsolicitud_recoleccion]
    );

    // Registrar el detalle
    await pool.execute(
      `
      INSERT INTO detalle_recoleccion
      (
        fecha_entrega,
        cant_bolson,
        observaciones,
        solicitud_recoleccion_idsolicitud_recoleccion
      )
      VALUES (NOW(), 0, 'Usuario ausente', ?)
      `,
      [idsolicitud_recoleccion]
    );

    res.json({
      success: true,
      message: "Usuario ausente registrado",
    });
  } catch (error: any) {
    console.error("Error en postMarcarAusente:", error);

    res.status(500).json({
      success: false,
      message: "Error al registrar ausencia",
    });
  }
};