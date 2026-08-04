import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export const obtenerHistorialDB = async (idRecolector: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
        p.idpedidos,
        p.estado,
        dp.fecha_entrega,
        dp.total_puntos,
        d.calle,
        d.numero,
        tr.descripcion AS tipo_reciclable
    FROM detalle_pedido dp
    INNER JOIN pedidos p 
        ON dp.pedidos_idpedidos = p.idpedidos
    INNER JOIN direcciones d 
        ON p.id_direccion = d.iddirecciones
    INNER JOIN tipo_reciclable tr 
        ON p.tipo_reciclable_idtipo_reciclable = tr.idtipo_reciclable
    INNER JOIN pedidos_rutas pr 
        ON p.idpedidos = pr.pedidos_idpedidos
    INNER JOIN rutas_asignadas ra 
        ON pr.rutas_asignadas_idrutas_asignadas = ra.idrutas_asignadas
    WHERE ra.recolector_idrecolector = ?
      AND MONTH(dp.fecha_entrega) = MONTH(CURRENT_DATE())
      AND YEAR(dp.fecha_entrega) = YEAR(CURRENT_DATE())
    ORDER BY dp.fecha_entrega DESC
    LIMIT 30;
    `,
    [idRecolector]
  );
  return rows;
};
