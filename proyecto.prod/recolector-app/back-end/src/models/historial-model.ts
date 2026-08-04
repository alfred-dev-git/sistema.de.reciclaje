import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export const obtenerHistorialDB = async (idRecolector: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
        sr.idsolicitud_recoleccion,
        es.descripcion AS estado,
        dr.fecha_entrega,
        dr.cant_bolson,
        dr.observaciones,
        d.calle,
        d.numero,
        tr.descripcion AS tipo_reciclable,
        r.idrutas AS id_ruta
    FROM detalle_recoleccion dr
    INNER JOIN solicitud_recoleccion sr
        ON dr.solicitud_recoleccion_idsolicitud_recoleccion = sr.idsolicitud_recoleccion
    INNER JOIN direcciones d
        ON sr.direcciones_iddirecciones = d.iddirecciones
    INNER JOIN tipo_reciclable tr
        ON sr.tipo_reciclable_idtipo_reciclable = tr.idtipo_reciclable
    INNER JOIN estado_solicitud es
        ON es.idestado_solicitud = sr.estado_solicitud_idestado_solicitud
    INNER JOIN solicitud_rutas sru
        ON sr.idsolicitud_recoleccion = sru.solicitud_recoleccion_idsolicitud_recoleccion
    INNER JOIN rutas r
        ON sru.rutas_idrutas = r.idrutas
    WHERE r.recolector_idrecolector = ?
      AND MONTH(dr.fecha_entrega) = MONTH(CURRENT_DATE())
      AND YEAR(dr.fecha_entrega) = YEAR(CURRENT_DATE())
    ORDER BY dr.fecha_entrega DESC
    LIMIT 30;
    `,
    [idRecolector]
  );

  return rows;
};

export type FiltrosHistorial = {
  pagina: number;
  limite: number;
  mes?: number;
  anio?: number;
  tipo?: string;
};

const joinsHistorial = `
  FROM detalle_recoleccion dr
  INNER JOIN solicitud_recoleccion sr
    ON dr.solicitud_recoleccion_idsolicitud_recoleccion = sr.idsolicitud_recoleccion
  INNER JOIN direcciones d
    ON sr.direcciones_iddirecciones = d.iddirecciones
  INNER JOIN tipo_reciclable tr
    ON sr.tipo_reciclable_idtipo_reciclable = tr.idtipo_reciclable
  INNER JOIN estado_solicitud es
    ON es.idestado_solicitud = sr.estado_solicitud_idestado_solicitud
  INNER JOIN solicitud_rutas sru
    ON sr.idsolicitud_recoleccion = sru.solicitud_recoleccion_idsolicitud_recoleccion
  INNER JOIN rutas r
    ON sru.rutas_idrutas = r.idrutas
`;

export const obtenerHistorialCompletoDB = async (
  idRecolector: number,
  filtros: FiltrosHistorial
) => {
  const condiciones = ["r.recolector_idrecolector = ?"];
  const valores: Array<number | string> = [idRecolector];

  if (filtros.mes) {
    condiciones.push("MONTH(dr.fecha_entrega) = ?");
    valores.push(filtros.mes);
  }
  if (filtros.anio) {
    condiciones.push("YEAR(dr.fecha_entrega) = ?");
    valores.push(filtros.anio);
  }
  if (filtros.tipo) {
    condiciones.push("tr.descripcion = ?");
    valores.push(filtros.tipo);
  }

  const where = `WHERE ${condiciones.join(" AND ")}`;
  const offset = (filtros.pagina - 1) * filtros.limite;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       sr.idsolicitud_recoleccion,
       es.descripcion AS estado,
       dr.fecha_entrega,
       dr.cant_bolson,
       dr.observaciones,
       d.calle,
       d.numero,
       tr.descripcion AS tipo_reciclable,
       r.idrutas AS id_ruta
     ${joinsHistorial}
     ${where}
     ORDER BY dr.fecha_entrega DESC, sr.idsolicitud_recoleccion DESC
     LIMIT ? OFFSET ?`,
    [...valores, filtros.limite, offset]
  );

  const [conteo] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total ${joinsHistorial} ${where}`,
    valores
  );

  const [opciones] = await pool.query<RowDataPacket[]>(
    `SELECT DISTINCT
       YEAR(dr.fecha_entrega) AS anio,
       tr.descripcion AS tipo_reciclable
     ${joinsHistorial}
     WHERE r.recolector_idrecolector = ?
     ORDER BY anio DESC, tipo_reciclable ASC`,
    [idRecolector]
  );

  return {
    items: rows,
    total: Number(conteo[0]?.total ?? 0),
    pagina: filtros.pagina,
    limite: filtros.limite,
    anios: [...new Set(opciones.map((item) => Number(item.anio)))],
    tipos: [...new Set(opciones.map((item) => String(item.tipo_reciclable)))],
  };
};
