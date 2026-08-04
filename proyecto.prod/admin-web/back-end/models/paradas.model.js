import { pool } from "../config/db.js";

/**
 * Obtiene todas las paradas (pedidos sin recolector asignado).
 * Solo trae pedidos donde estado = 0 y estado_ruta = 0
 */
export const obtenerPedidosSinAsignar = async (idAdmin) => {
  // 1. Obtener municipio del admin
  const [adminRows] = await pool.query(
    `SELECT u.municipio_idmunicipio
     FROM usuarios u
     INNER JOIN rol r ON r.idrol = u.rol_idrol
     WHERE u.idusuario = ? AND LOWER(r.descripcion) = 'administrador'`,
    [idAdmin]
  );

  if (adminRows.length === 0) {
    throw new Error("El administrador no existe o no tiene rol 2");
  }

  const municipioAdmin = adminRows[0].municipio_idmunicipio;

  // 2. Consultar pedidos de ese municipio
  const [rows] = await pool.query(`
    SELECT 
      s.idsolicitud_recoleccion AS idpedidos,
      es.descripcion AS estado,
      0 AS estado_ruta,
      u.nombre,
      u.apellido,
      u.idusuario,
      d.calle,
      d.numero,
      d.latitud,
      d.longitud,
      s.tipo_reciclable_idtipo_reciclable
    FROM solicitud_recoleccion s
    INNER JOIN estado_solicitud es
      ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
    INNER JOIN direcciones d 
      ON s.direcciones_iddirecciones = d.iddirecciones
    INNER JOIN contribuyente c
      ON s.contribuyente_idcontribuyente = c.idcontribuyente
    INNER JOIN usuarios u
      ON c.usuarios_idusuario = u.idusuario
    WHERE 
      LOWER(es.descripcion) = 'pendiente'
      AND NOT EXISTS (
        SELECT 1 FROM solicitud_rutas sr
        WHERE sr.solicitud_recoleccion_idsolicitud_recoleccion = s.idsolicitud_recoleccion
      )
      AND YEAR(s.fecha_emision) = YEAR(CURDATE())
      AND u.municipio_idmunicipio = ?
  `, [municipioAdmin]);

  return rows;
};



export const obtenerPedidosPorRecolector = async (idRecolector) => {
  const [rows] = await pool.query(
    `
    SELECT 
      s.idsolicitud_recoleccion AS idpedidos,
      es.descripcion AS estado,
      1 AS estado_ruta,
      s.fecha_emision,
      u.nombre,
      u.apellido,
      u.idusuario,
      d.calle,
      d.numero,
      d.latitud,
      d.longitud,
      ru.idrutas AS id_ruta,
      
      s.tipo_reciclable_idtipo_reciclable
      
    FROM solicitud_recoleccion s
    INNER JOIN solicitud_rutas sr
      ON s.idsolicitud_recoleccion = sr.solicitud_recoleccion_idsolicitud_recoleccion
    INNER JOIN rutas ru
      ON sr.rutas_idrutas = ru.idrutas
    INNER JOIN estado_solicitud es
      ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
    INNER JOIN contribuyente c
      ON s.contribuyente_idcontribuyente = c.idcontribuyente
    INNER JOIN usuarios u
      ON c.usuarios_idusuario = u.idusuario
    INNER JOIN direcciones d 
      ON s.direcciones_iddirecciones = d.iddirecciones
    WHERE 
      LOWER(TRIM(es.descripcion)) IN ('pendiente', 'en ruta')
      AND ru.recolector_idrecolector = ?
      AND YEAR(s.fecha_emision) = YEAR(CURDATE())
    `,
    [idRecolector]
  );

  return rows;
};
