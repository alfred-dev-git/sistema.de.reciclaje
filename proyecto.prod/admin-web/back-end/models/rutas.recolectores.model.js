import { pool } from "../config/db.js";

/**
 * Obtiene los recolectores y la cantidad de rutas pendientes que tienen en el año actual.
 * Evita GROUP BY para compatibilidad con Railway.
 */
export const obtenerRutasPendientesPorRecolector = async () => {
  const [rows] = await pool.query(`
    SELECT 
      r.idrecolector,
      u.nombre AS nombre_recolector,
      (
        SELECT COUNT(DISTINCT ra.idrutas_asignadas)
        FROM rutas_asignadas ra
        LEFT JOIN pedidos_rutas pr ON ra.idrutas_asignadas = pr.rutas_asignadas_idrutas_asignadas
        LEFT JOIN pedidos p ON pr.pedidos_idpedidos = p.idpedidos
        WHERE ra.recolector_idrecolector = r.idrecolector
          AND (
            (p.estado = 0 AND YEAR(p.fecha_emision) = YEAR(CURDATE()))
            OR p.idpedidos IS NULL
          )
      ) AS rutas_pendientes
    FROM recolector r
    LEFT JOIN usuario u ON r.idusuario = u.idusuario
    WHERE r.estado = 0
  `);

  return rows;
};
