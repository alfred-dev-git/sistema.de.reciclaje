import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export interface PedidoAsignado extends RowDataPacket {
  idsolicitud_recoleccion: number;
  estado: string;
  nombre: string;
  apellido: string;
  idusuario: number;
  calle: string;
  numero: string;
  latitud: number;
  longitud: number;
  id_ruta: number;
}

export const obtenerPedidosAsignadosDB = async (
  idRecolector: number
): Promise<PedidoAsignado[]> => {
  const [rows] = await pool.query<PedidoAsignado[]>(
    `
    SELECT
      sr.idsolicitud_recoleccion,
      es.descripcion AS estado,
      r.idrutas AS id_ruta,
      u.idusuario,
      u.nombre,
      u.apellido,
      d.calle,
      d.numero,
      d.latitud,
      d.longitud
    FROM solicitud_recoleccion sr

    INNER JOIN estado_solicitud es
      ON sr.estado_solicitud_idestado_solicitud = es.idestado_solicitud

    INNER JOIN direcciones d
      ON sr.direcciones_iddirecciones = d.iddirecciones

    INNER JOIN contribuyente c
      ON sr.contribuyente_idcontribuyente = c.idcontribuyente

    INNER JOIN usuarios u
      ON c.usuarios_idusuario = u.idusuario

    INNER JOIN solicitud_rutas sru
      ON sr.idsolicitud_recoleccion = sru.solicitud_recoleccion_idsolicitud_recoleccion

    INNER JOIN rutas r
      ON sru.rutas_idrutas = r.idrutas

    WHERE
      LOWER(TRIM(es.descripcion)) = 'en ruta'
      AND r.recolector_idrecolector = ?
    `,
    [idRecolector]
  );

  return rows;
};
//hacer otra consulta donde guardes las paradas en la tabla rutas


//otra consulta donde traigas esas rutas guardadas para tener el seguimiento
