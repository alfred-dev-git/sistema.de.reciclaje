import { pool } from "../config/db.js";

export const obtenerHistorialDB = async (q = "") => {
  const args = [];
  let where = "";
  if (q.trim()) {
    where = `WHERE CONCAT(u.nombre, ' ', u.apellido) LIKE ?`;
    args.push(`${q}%`);
  }

  const [rows] = await pool.query(
    `SELECT
       dr.iddetalle_recoleccion AS iddetalle_pedido,
       s.idsolicitud_recoleccion AS idpedidos,
       s.fecha_emision,
       dr.fecha_entrega,
       dr.cant_bolson,
       dr.observaciones,
       es.descripcion AS estado,
       CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre,
       tr.descripcion AS tipo_reciclable,
       CONCAT(ur.nombre, ' ', ur.apellido) AS recolector_nombre
     FROM solicitud_recoleccion s
     INNER JOIN contribuyente c ON c.idcontribuyente = s.contribuyente_idcontribuyente
     INNER JOIN usuarios u ON u.idusuario = c.usuarios_idusuario
     INNER JOIN estado_solicitud es
       ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
     LEFT JOIN detalle_recoleccion dr
       ON dr.solicitud_recoleccion_idsolicitud_recoleccion = s.idsolicitud_recoleccion
     LEFT JOIN tipo_reciclable tr
       ON tr.idtipo_reciclable = s.tipo_reciclable_idtipo_reciclable
     LEFT JOIN solicitud_rutas sr
       ON sr.solicitud_recoleccion_idsolicitud_recoleccion = s.idsolicitud_recoleccion
     LEFT JOIN rutas ru ON ru.idrutas = sr.rutas_idrutas
     LEFT JOIN recolector r ON r.idrecolector = ru.recolector_idrecolector
     LEFT JOIN usuarios ur ON ur.idusuario = r.usuario_idusuario
     ${where}
     ORDER BY s.fecha_emision DESC, dr.iddetalle_recoleccion DESC
     LIMIT 1000`,
    args
  );
  return rows;
};
