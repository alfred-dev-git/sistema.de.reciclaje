import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { getDB } from "@/config/db";

const router = Router();


router.get("/", asyncHandler(async (_req, res) => {
  const db = getDB();
  const [rows] = await db.query(
    `SELECT idtipo_reciclable AS id, descripcion
     FROM tipo_reciclable`
  );
  res.json({ items: rows });
}));


router.get(
  "/cronograma",
  asyncHandler(async (_req, res) => {
    const db = getDB();
    const [rows] = await db.query(
      `
      SELECT 
        c.idcronograma_recoleccion AS id,
        c.dia_semana,
        c.semana_mes,
        c.hora_inicio,
        c.hora_fin,
        tr.descripcion AS tipo_reciclable
      FROM cronograma_recoleccion c
      INNER JOIN tipo_reciclable tr 
        ON c.tipo_reciclable_idtipo_reciclable = tr.idtipo_reciclable
      WHERE c.activo = 1
      ORDER BY 
        c.dia_semana ASC,
        c.semana_mes ASC;
      `
    );

    res.json({ items: rows });
  })
);

router.get(
  "/notificaciones",
  asyncHandler(async (_req, res) => {
    const db = getDB();

    const [rows] = await db.query(
      `
      SELECT 
        n.titulo,
        n.mensaje
      FROM notificaciones n
      INNER JOIN cronograma_recoleccion c 
        ON n.cronograma_recoleccion_idcronograma_recoleccion = c.idcronograma_recoleccion
      WHERE 
        c.activo = 1
        AND n.fecha_envio >= (CURDATE() - INTERVAL 1 DAY)
      ORDER BY n.fecha_envio DESC;
      `
    );

    res.json({ items: rows });
  })
);

export default router;