import { pool } from "../config/db.js";

/**
 * Obtiene los recolectores, su teléfono y la cantidad de rutas pendientes.
 * Compatible con Railway (sin GROUP BY).
 */
export const obtenerCantRutasPorRecolector = async () => {
  const [rows] = await pool.query(`
    SELECT 
      r.idrecolector,
      CONCAT(u.nombre, ' ', u.apellido) AS recolector,
      u.telefono,
      (
        SELECT COUNT(DISTINCT ra2.idrutas_asignadas)
        FROM rutas_asignadas ra2
        LEFT JOIN pedidos_rutas pr2 ON pr2.rutas_asignadas_idrutas_asignadas = ra2.idrutas_asignadas
        LEFT JOIN pedidos p2 ON p2.idpedidos = pr2.pedidos_idpedidos
        WHERE ra2.recolector_idrecolector = r.idrecolector
          AND p2.estado = 0
          AND p2.estado_ruta = 1
      ) AS rutas_pendientes
    FROM recolector r
    INNER JOIN usuario u ON r.idusuario = u.idusuario
    ORDER BY rutas_pendientes DESC;
  `);

  return rows;
};


export const asignarRutaARecolector = async (idrecolector, pedidos) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 🔹 1. Verificar que los pedidos existan y no estén asignados (estado_ruta = 0)
    const [verificacion] = await connection.query(
      `SELECT idpedidos, estado_ruta 
       FROM pedidos 
       WHERE idpedidos IN (?)`,
      [pedidos]
    );

    const pedidosInvalidos = verificacion
      .filter((p) => p.estado_ruta !== 0)
      .map((p) => p.idpedidos);

    if (pedidosInvalidos.length > 0) {
      await connection.rollback();
      return {
        success: false,
        message: "Algunos pedidos ya fueron asignados a otra ruta",
        pedidos_invalidos: pedidosInvalidos,
      };
    }

    // 🔹 2. Insertar nueva ruta asignada
    const [resultRuta] = await connection.query(
      `INSERT INTO rutas_asignadas (recolector_idrecolector) VALUES (?)`,
      [idrecolector]
    );

    const idrutas_asignadas = resultRuta.insertId;

    // 🔹 3. Actualizar estado_ruta = 1 en los pedidos
    await connection.query(
      `UPDATE pedidos 
       SET estado_ruta = 1 
       WHERE idpedidos IN (?)`,
      [pedidos]
    );

    // 🔹 4. Insertar relaciones en pedidos_rutas
    const values = pedidos.map((idPedido) => [idPedido, idrutas_asignadas]);
    await connection.query(
      `INSERT INTO pedidos_rutas (pedidos_idpedidos, rutas_asignadas_idrutas_asignadas)
       VALUES ?`,
      [values]
    );

    await connection.commit();

    return {
      success: true,
      message: "Ruta asignada correctamente",
      data: { idrutas_asignadas, idrecolector, pedidos },
    };
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error en asignarRutaARecolector:", error);
    return {
      success: false,
      message: "Error al asignar la ruta",
      error: error.message,
    };
  } finally {
    connection.release();
  }
};


/**
 * Cambia el recolector asignado a una ruta específica.
 * @param {number} idRuta - ID de la ruta asignada
 * @param {number} idRecolector - Nuevo ID del recolector
 */
export const cambiarRecolectorRuta = async (idRuta, idRecolector) => {
  try {
    // 1️⃣ Verificamos si ya tiene asignado el mismo recolector
    const [check] = await pool.query(
      `SELECT recolector_idrecolector 
       FROM rutas_asignadas 
       WHERE idrutas_asignadas = ?`,
      [idRuta]
    );

    if (check.length === 0) {
      return {
        success: false,
        message: "No se encontró la ruta especificada",
      };
    }

    const recolectorActual = check[0].recolector_idrecolector;
    if (recolectorActual === idRecolector) {
      return {
        success: false,
        message: "El recolector ya tiene esta ruta asignada",
      };
    }

    // 2️⃣ Si no es el mismo, hacemos el UPDATE
    const [result] = await pool.query(
      `UPDATE rutas_asignadas 
       SET recolector_idrecolector = ? 
       WHERE idrutas_asignadas = ?`,
      [idRecolector, idRuta]
    );

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "No se pudo actualizar la ruta",
      };
    }

    return {
      success: true,
      message: "Recolector actualizado correctamente",
    };
  } catch (error) {
    console.error("❌ Error en cambiarRecolectorRuta:", error);
    return {
      success: false,
      message: "Error interno al cambiar el recolector",
      error,
    };
  }
};
