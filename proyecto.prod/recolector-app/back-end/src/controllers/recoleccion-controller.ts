import { Request, Response } from "express";
import { pool } from "../db.js";

/**
 * Función auxiliar para calcular los puntos equivalentes(todavia no se usa)
 */
const calcularTotalPuntos = async (idpedidos: number, cant_bolson: number): Promise<number> => {
  // obtener el tipo de reciclable del pedido
  const [pedidoRows]: any = await pool.query(
    "SELECT tipo_reciclable_idtipo_reciclable FROM pedidos WHERE idpedidos = ?",
    [idpedidos]
  );

  if (pedidoRows.length === 0) {
    throw new Error("Pedido no encontrado");
  }

  const idTipoReciclable = pedidoRows[0].tipo_reciclable_idtipo_reciclable;

  // obtener punto_equivalente desde puntos_equivalencia
  const [equivRows]: any = await pool.query(
    "SELECT punto_equivalente FROM puntos_equivalencia WHERE tipo_reciclable_idtipo_reciclable = ?",
    [idTipoReciclable]
  );

  if (equivRows.length === 0) {
    throw new Error("No existe equivalencia para ese tipo de reciclable");
  }

  const puntoEquivalente = equivRows[0].punto_equivalente;

  return cant_bolson * puntoEquivalente;
};


/**
 * 🔹 Marcar pedido como completado
 */
export const postMarcarCompletado = async (req: Request, res: Response) => {
  const { idpedidos, estado, cant_bolson, observaciones } = req.body;

  if (!idpedidos || estado === undefined || cant_bolson === undefined) {
    return res.status(400).json({ success: false, message: "Faltan parámetros" });
  }

  try {
    // 🔹 ANULAR cálculo → siempre 0
    const total_puntos = 0;

    // actualizar estado en pedidos
    await pool.execute(
      "UPDATE pedidos SET estado = ? WHERE idpedidos = ?",
      [estado, idpedidos]
    );

    // insertar el detalle con 0 puntos
    await pool.execute(
      `INSERT INTO detalle_pedido 
        (fecha_entrega, cant_bolson, total_puntos, observaciones, pedidos_idpedidos) 
       VALUES (NOW(), ?, ?, ?, ?)`,
      [cant_bolson, total_puntos, observaciones || "Completado", idpedidos]
    );

    res.json({ success: true, message: "Pedido marcado como completado", total_puntos });
  } catch (error: any) {
    console.error("Error en postMarcarCompletado:", error);
    res.status(500).json({ success: false, message: error.message || "Error al completar el pedido" });
  }
};


/**
 * 🔹 Marcar pedido como ausente
 */
export const postMarcarAusente = async (req: Request, res: Response) => {
  const { idpedidos, estado } = req.body;

  if (!idpedidos || estado === undefined) {
    return res.status(400).json({ success: false, message: "Faltan parámetros" });
  }

  try {
    // actualizar estado en pedidos
    await pool.execute(
      "UPDATE pedidos SET estado = ? WHERE idpedidos = ?",
      [estado, idpedidos]
    );

    // opcional: insertar un detalle con total_puntos = 0
    await pool.execute(
      `INSERT INTO detalle_pedido 
        (fecha_entrega, cant_bolson, total_puntos, observaciones, pedidos_idpedidos) 
       VALUES (NOW(), 0, 0, 'Usuario ausente', ?)`,
      [idpedidos]
    );

    res.json({ success: true, message: "Usuario ausente registrado" });
  } catch (error: any) {
    console.error("Error en postMarcarAusente:", error);
    res.status(500).json({ success: false, message: "Error al registrar ausencia" });
  }
};
