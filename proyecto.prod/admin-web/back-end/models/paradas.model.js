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



export const obtenerPedidosPorRecolector = async (idRecolector) => {
  const [rows] = await pool.query(
    `
    SELECT 
      p.idpedidos,
      p.estado,
      p.estado_ruta,
      p.fecha_emision,
      u.nombre,
      u.apellido,
      u.idusuario,
      d.calle,
      d.numero,
      d.latitud,
      d.longitud,
      ra.idrutas_asignadas AS id_ruta
    FROM pedidos p
    INNER JOIN pedidos_rutas pr 
      ON p.idpedidos = pr.pedidos_idpedidos
    INNER JOIN rutas_asignadas ra 
      ON pr.rutas_asignadas_idrutas_asignadas = ra.idrutas_asignadas
    INNER JOIN usuario u 
      ON p.usuario_idusuario = u.idusuario
    INNER JOIN direcciones d 
      ON p.id_direccion = d.iddirecciones
    WHERE 
      p.estado = 0
      AND p.estado_ruta = 1
      AND ra.recolector_idrecolector = ?
      AND YEAR(p.fecha_emision) = YEAR(CURDATE())
    `,
    [idRecolector]
  );

  return rows;
};
