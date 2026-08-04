import { Router } from "express";
import asyncHandler from "@/utils/asyncHandler";
import getDB from "@/config/db";
import { requireAuth } from "@/middlewares/auth";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const [rows] = await getDB().query(
      `SELECT idtipo_reciclable, descripcion FROM tipo_reciclable ORDER BY descripcion ASC`
    );
    res.json(rows);
  })
);

router.get(
  "/cronograma",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const [rows] = await getDB().query(
      `SELECT f.idfrecuencia_recoleccion AS id, f.dia_semana, f.semana_mes,
              f.hora_inicio, f.hora_fin, tr.descripcion AS tipo_reciclable
       FROM frecuencia_recoleccion f
       INNER JOIN tipo_reciclable tr
         ON tr.idtipo_reciclable = f.tipo_reciclable_idtipo_reciclable
       WHERE f.activo = 1
       ORDER BY f.dia_semana ASC, f.semana_mes ASC`
    );
    res.json({ items: rows });
  })
);

router.get(
  "/notificaciones",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [rows] = await getDB().query(
      `SELECT DISTINCT n.idnotificaciones AS id, n.titulo, n.mensaje, n.fecha_envio
       FROM notificaciones n
       INNER JOIN rutas ru ON ru.idrutas = n.rutas_idrutas
       INNER JOIN solicitud_rutas sr ON sr.rutas_idrutas = ru.idrutas
       INNER JOIN solicitud_recoleccion s
         ON s.idsolicitud_recoleccion = sr.solicitud_recoleccion_idsolicitud_recoleccion
       INNER JOIN estado_solicitud es
         ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
       INNER JOIN contribuyente c ON c.idcontribuyente = s.contribuyente_idcontribuyente
       WHERE c.usuarios_idusuario = ?
         AND n.fecha_envio >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
         AND LOWER(TRIM(es.descripcion)) NOT IN ('completada', 'cancelada', 'ausente')
       ORDER BY n.fecha_envio DESC`,
      [req.user!.uid]
    );
    res.json({ items: rows });
  })
);

export default router;
