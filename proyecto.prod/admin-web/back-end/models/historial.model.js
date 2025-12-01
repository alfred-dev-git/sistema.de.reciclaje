import { pool } from "../config/db.js";

export const obtenerHistorialDB = async (q = '') => {
  const args = [];
  let where = '';

  if (q.trim()) {
    where = `WHERE CONCAT(u.nombre, ' ', u.apellido) LIKE ?`;
    args.push(`${q}%`);
  }

  const sql = `
    SELECT 
      dp.iddetalle_pedido,
      p.idpedidos,
      p.fecha_emision,
      dp.fecha_entrega,
      dp.cant_bolson,
      dp.total_puntos,
      dp.observaciones,
      p.estado,
      p.estado_ruta,
      CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre,
      tr.descripcion AS tipo_reciclable
    FROM pedidos p
    JOIN usuario u ON u.idusuario = p.usuario_idusuario
    LEFT JOIN detalle_pedido dp ON dp.pedidos_idpedidos = p.idpedidos
    LEFT JOIN tipo_reciclable tr ON tr.idtipo_reciclable = p.tipo_reciclable_idtipo_reciclable
    ${where}
    ORDER BY p.fecha_emision DESC, dp.iddetalle_pedido DESC
    LIMIT 1000;
  `;

  const [rows] = await pool.query(sql, args);
  return rows;
};
