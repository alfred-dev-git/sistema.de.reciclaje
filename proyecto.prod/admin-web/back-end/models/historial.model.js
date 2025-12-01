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

      -- usuario que hizo el pedido
      CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre,

      -- tipo de reciclable
      tr.descripcion AS tipo_reciclable,

      -- recolector asignado (si existe)
      CONCAT(ur.nombre, ' ', ur.apellido) AS recolector_nombre

    FROM pedidos p
    JOIN usuario u ON u.idusuario = p.usuario_idusuario
    LEFT JOIN detalle_pedido dp ON dp.pedidos_idpedidos = p.idpedidos
    LEFT JOIN tipo_reciclable tr ON tr.idtipo_reciclable = p.tipo_reciclable_idtipo_reciclable

    -- nuevos JOINs
    LEFT JOIN pedidos_rutas pr ON pr.pedidos_idpedidos = p.idpedidos
    LEFT JOIN rutas_asignadas ra ON ra.idrutas_asignadas = pr.rutas_asignadas_idrutas_asignadas
    LEFT JOIN recolector r ON r.idrecolector = ra.recolector_idrecolector
    LEFT JOIN usuario ur ON ur.idusuario = r.idusuario

    ${where}
    ORDER BY p.fecha_emision DESC, dp.iddetalle_pedido DESC
    LIMIT 1000;
  `;

  const [rows] = await pool.query(sql, args);
  return rows;
};

