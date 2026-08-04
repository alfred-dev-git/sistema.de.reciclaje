import { pool } from '../config/db.js';
import { obtenerHistorialDB } from "../models/historial.model.js";

/**
 * Historial (todas las filas) ordenado por fecha desc.
 * Incluye nombre completo del usuario y etiqueta de tipo_reciclable.
 * Opcional: filtro por nombre via query ?q=Texto (server-side).
 */

export const getHistorial = async (req, res) => {
  const q = req.query.q || '';

  try {
    const historial = await obtenerHistorialDB(q);
    res.json(historial);
  } catch (err) {
    console.error("❌ Error obteniendo historial:", err);
    res.status(500).json({ error: "Error obteniendo historial" });
  }
};


/**
 * Estadística: total de pedidos por mes (últimos 12 meses) para gráfico de barras.
 */
export const getPedidosPorMes = async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        YEAR(s.fecha_emision) AS anio,
        MONTH(s.fecha_emision) AS mes,
        COUNT(*) AS total
      FROM solicitud_recoleccion s
      WHERE s.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(s.fecha_emision), MONTH(s.fecha_emision)
      ORDER BY anio ASC, mes ASC;
    `);

    // Opcional: si querés devolver "YYYY-MM" como antes
    const formatted = rows.map(r => ({
      anio_mes: `${r.anio}-${String(r.mes).padStart(2, '0')}`,
      total: r.total
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error obteniendo pedidos por mes:", err);
    res.status(500).json({ error: "Error obteniendo pedidos por mes" });
  }
};


/**
 * Estadística: distribución por tipo_reciclable para gráfico de torta.
 * (Reciclable, Residuo, Compostable, Peligroso)
 */
export const getDistribucionTipos = async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        tr.idtipo_reciclable AS id_tipo,
        tr.descripcion AS tipo,
        COUNT(s.idsolicitud_recoleccion) AS total
      FROM solicitud_recoleccion s
      INNER JOIN tipo_reciclable tr 
        ON tr.idtipo_reciclable = s.tipo_reciclable_idtipo_reciclable
      WHERE s.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY tr.idtipo_reciclable, tr.descripcion
      ORDER BY total DESC;
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error obteniendo distribución por tipo:", err);
    res.status(500).json({ error: "Error obteniendo distribución por tipo" });
  }
};


/**
 * KPIs Home (para tus tarjetas “Hay n rutas sin asignar”, “fechas activas”, etc.)
 * Aquí te dejo placeholders para que luego enlaces tus tablas reales (rutas, notificaciones…).
 */
export const getHomeKpis = async (_req, res) => {
  try {
    // 1️⃣ Pedidos sin ruta asignada (estado_ruta = 0)
    const [sinAsignar] = await pool.query(`
      SELECT COUNT(*) AS n 
      FROM solicitud_recoleccion s
      INNER JOIN estado_solicitud es
        ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
      WHERE LOWER(es.descripcion) = 'pendiente'
        AND NOT EXISTS (
          SELECT 1 FROM solicitud_rutas sr
          WHERE sr.solicitud_recoleccion_idsolicitud_recoleccion = s.idsolicitud_recoleccion
        );
    `);

    // 2️⃣ Recolectores activos (que tienen pedidos activos y con ruta asignada)
    const [recolectoresActivos] = await pool.query(`
      SELECT COUNT(*) AS n
      FROM usuarios u
      INNER JOIN rol r ON r.idrol = u.rol_idrol
      WHERE u.activo = 1
        AND LOWER(TRIM(r.descripcion)) = 'recolector';
    `);

    const [fechasActivas] = await pool.query(`
      SELECT COUNT(*) AS n
      FROM frecuencia_recoleccion
      WHERE activo = 1;
    `);



    // 4️⃣ Enviar KPIs como JSON
    res.json({
      rutasSinAsignar: sinAsignar[0].n,
      recolectoresActivos: recolectoresActivos[0].n,
      fechasActivas: fechasActivas[0].n
    });

  } catch (err) {
    console.error("❌ Error obteniendo KPIs:", err);
    res.status(500).json({ error: "Error obteniendo KPIs" });
  }
};
