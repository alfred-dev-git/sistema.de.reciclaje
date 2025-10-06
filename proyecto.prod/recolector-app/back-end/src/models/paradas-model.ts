import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export interface PedidoAsignado extends RowDataPacket {
  idpedidos: number;
  estado: number;
  estado_ruta: number;
  nombre: string;
  apellido: string;
  idusuario: number;
  calle: string;
  numero: string;
  latitud: number;
  longitud: number;
  id_ruta: number;
}

export const obtenerPedidosAsignadosDB = async (idRecolector: number): Promise<PedidoAsignado[]> => {
  const [rows] = await pool.query<PedidoAsignado[]>(`
    SELECT 
      p.idpedidos,
      p.estado,
      p.estado_ruta,
      pr.rutas_asignadas_idrutas_asignadas AS id_ruta,
      u.nombre,
      u.apellido,
      u.idusuario,
      d.calle,
      d.numero,
      d.latitud,
      d.longitud
    FROM pedidos p
    INNER JOIN direcciones d 
      ON p.id_direccion = d.iddirecciones
    INNER JOIN usuario u 
      ON p.usuario_idusuario = u.idusuario
    INNER JOIN pedidos_rutas pr 
      ON p.idpedidos = pr.pedidos_idpedidos
    INNER JOIN rutas_asignadas ra 
      ON pr.rutas_asignadas_idrutas_asignadas = ra.idrutas_asignadas
    WHERE 
      p.estado = 0
      AND p.estado_ruta = 1
      AND ra.recolector_idrecolector = ?
  `, [idRecolector]);

  return rows;
};




//hacer otra consulta donde guardes las paradas en la tabla rutas


//otra consulta donde traigas esas rutas guardadas para tener el seguimiento