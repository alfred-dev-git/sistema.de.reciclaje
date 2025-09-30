import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export interface PedidoAsignado extends RowDataPacket {
  idpedidos: number;
  estado: number;
  id_ruta: number;
  nombre: string;
  apellido: string;
  idusuario: number;
  calle: string;
  numero: string;
  latitud: number;
  longitud: number;
}

export const obtenerPedidosAsignadosDB = async (idRecolector: number): Promise<PedidoAsignado[]> => {
  const [rows] = await pool.query<PedidoAsignado[]>(`
    SELECT 
      p.idpedidos,
      p.estado,
      p.id_ruta,
      u.nombre,
      u.apellido,
      u.idusuario,
      d.calle,
      d.numero,
      d.latitud,
      d.longitud
    FROM pedidos p
    INNER JOIN direcciones d ON p.id_direccion = d.iddirecciones
    INNER JOIN usuario u ON p.usuario_idusuario = u.idusuario
    WHERE p.estado = 0
      AND p.id_ruta <> 0
      AND p.id_recolector = ?
    GROUP BY p.idpedidos
  `, [idRecolector]);

  return rows;
};



//hacer otra consulta donde guardes las paradas en la tabla rutas


//otra consulta donde traigas esas rutas guardadas para tener el seguimiento