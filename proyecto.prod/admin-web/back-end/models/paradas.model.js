import { pool } from "../config/db.js";

/**
 * Obtiene todas las paradas (pedidos sin recolector asignado).
 * Solo trae pedidos donde estado = 0 y estado_ruta = 0
 */
export const obtenerPedidosSinAsignar = async () => {
  const [rows] = await pool.query(`
    SELECT 
      p.idpedidos,
      p.estado,
      p.estado_ruta,
      u.nombre,
      u.apellido,
      u.idusuario,
      d.calle,
      d.numero,
      d.latitud,
      d.longitud
    FROM pedidos p
    INNER JOIN direcciones d 
      ON p.id_direccion = d.iddirecciones
    INNER JOIN usuario u 
      ON p.usuario_idusuario = u.idusuario
    WHERE 
      p.estado = 0
      AND p.estado_ruta = 0
      AND YEAR(p.fecha_emision) = YEAR(CURDATE())
  `);

  return rows;
};
