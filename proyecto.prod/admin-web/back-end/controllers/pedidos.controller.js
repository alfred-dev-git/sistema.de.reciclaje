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
        YEAR(p.fecha_emision) AS anio,
        MONTH(p.fecha_emision) AS mes,
        COUNT(*) AS total
      FROM pedidos p
      WHERE p.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(p.fecha_emision), MONTH(p.fecha_emision)
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
        COUNT(p.idpedidos) AS total
      FROM pedidos p
      INNER JOIN tipo_reciclable tr 
        ON tr.idtipo_reciclable = p.tipo_reciclable_idtipo_reciclable
      WHERE p.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
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
      FROM pedidos 
      WHERE estado_ruta = 0;
    `);

    // 2️⃣ Recolectores activos (que tienen pedidos activos y con ruta asignada)
    const [recolectoresActivos] = await pool.query(`
      SELECT COUNT(DISTINCT ra.recolector_idrecolector) AS n
      FROM rutas_asignadas ra
      INNER JOIN pedidos_rutas pr 
        ON pr.rutas_asignadas_idrutas_asignadas = ra.idrutas_asignadas
      INNER JOIN pedidos p 
        ON p.idpedidos = pr.pedidos_idpedidos
      WHERE p.estado_ruta = 1 
        AND p.estado = 0;
    `);



    // 4️⃣ Enviar KPIs como JSON
    res.json({
      rutasSinAsignar: sinAsignar[0].n,
      recolectoresActivos: recolectoresActivos[0].n,
      fechasActivas: 0 // placeholder
    });

  } catch (err) {
    console.error("❌ Error obteniendo KPIs:", err);
    res.status(500).json({ error: "Error obteniendo KPIs" });
  }
};
