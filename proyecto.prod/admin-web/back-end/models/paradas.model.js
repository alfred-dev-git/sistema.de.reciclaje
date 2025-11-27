import { pool } from "../config/db.js";

/**
 * Obtiene todas las paradas (pedidos sin recolector asignado).
 * Solo trae pedidos donde estado = 0 y estado_ruta = 0
 */
export const obtenerPedidosSinAsignar = async (idAdmin) => {
  // 1. Obtener municipio del admin
  const [adminRows] = await pool.query(
    `SELECT municipio_idmunicipio 
     FROM usuario 
     WHERE idusuario = ? AND rol_idrol = 2`,
    [idAdmin]
  );

  if (adminRows.length === 0) {
    throw new Error("El administrador no existe o no tiene rol 2");
  }

  const municipioAdmin = adminRows[0].municipio_idmunicipio;

  // 2. Consultar pedidos de ese municipio
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
      d.longitud,
      p.tipo_reciclable_idtipo_reciclable
    FROM pedidos p
    INNER JOIN direcciones d 
      ON p.id_direccion = d.iddirecciones
    INNER JOIN usuario u 
      ON p.usuario_idusuario = u.idusuario
    WHERE 
      p.estado = 0
      AND p.estado_ruta = 0
      AND YEAR(p.fecha_emision) = YEAR(CURDATE())
      AND u.municipio_idmunicipio = ${municipioAdmin}
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
      ra.idrutas_asignadas AS id_ruta,
      
      p.tipo_reciclable_idtipo_reciclable
      
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
