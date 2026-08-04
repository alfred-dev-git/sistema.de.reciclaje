import { pool } from "../config/db.js";

export const obtenerCantRutasPorRecolector = async () => {
  const [rows] = await pool.query(`
    SELECT
      r.idrecolector,
      CONCAT(u.nombre, ' ', u.apellido) AS recolector,
      u.telefono,
      (
        SELECT COUNT(DISTINCT ru.idrutas)
        FROM rutas ru
        INNER JOIN solicitud_rutas sr ON sr.rutas_idrutas = ru.idrutas
        INNER JOIN solicitud_recoleccion s
          ON s.idsolicitud_recoleccion = sr.solicitud_recoleccion_idsolicitud_recoleccion
        INNER JOIN estado_solicitud es
          ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
        WHERE ru.recolector_idrecolector = r.idrecolector
          AND LOWER(es.descripcion) = 'pendiente'
      ) AS rutas_pendientes,
      (
        SELECT COUNT(DISTINCT ru.idrutas)
        FROM rutas ru
        INNER JOIN solicitud_rutas sr ON sr.rutas_idrutas = ru.idrutas
        INNER JOIN solicitud_recoleccion s
          ON s.idsolicitud_recoleccion = sr.solicitud_recoleccion_idsolicitud_recoleccion
        INNER JOIN estado_solicitud es
          ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
        WHERE ru.recolector_idrecolector = r.idrecolector
          AND LOWER(TRIM(es.descripcion)) = 'en ruta'
      ) AS rutas_en_ruta
    FROM recolector r
    INNER JOIN usuarios u ON r.usuario_idusuario = u.idusuario
    WHERE u.activo = 1
    ORDER BY (rutas_pendientes + rutas_en_ruta) DESC;
  `);

  return rows;
};

export const asignarRutaARecolector = async (idrecolector, solicitudes, idAdmin) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [verificacion] = await connection.query(
      `SELECT
         s.idsolicitud_recoleccion,
         s.tipo_reciclable_idtipo_reciclable,
         es.descripcion AS estado,
         sr.rutas_idrutas
       FROM solicitud_recoleccion s
       INNER JOIN estado_solicitud es
         ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
       LEFT JOIN solicitud_rutas sr
         ON sr.solicitud_recoleccion_idsolicitud_recoleccion = s.idsolicitud_recoleccion
       WHERE s.idsolicitud_recoleccion IN (?)
       FOR UPDATE`,
      [solicitudes]
    );

    const idsEncontrados = new Set(verificacion.map((item) => item.idsolicitud_recoleccion));
    const solicitudesInvalidas = solicitudes.filter((id) => !idsEncontrados.has(id));
    solicitudesInvalidas.push(
      ...verificacion
        .filter((item) => item.rutas_idrutas || item.estado.toLowerCase() !== 'pendiente')
        .map((item) => item.idsolicitud_recoleccion)
    );

    const tipos = new Set(verificacion.map((item) => item.tipo_reciclable_idtipo_reciclable));

    if (solicitudesInvalidas.length > 0 || tipos.size !== 1) {
      await connection.rollback();
      return {
        success: false,
        message: tipos.size !== 1
          ? "Todas las solicitudes de una ruta deben tener el mismo tipo de reciclable"
          : "Algunas solicitudes no existen, ya tienen ruta o no están pendientes",
        pedidos_invalidos: [...new Set(solicitudesInvalidas)],
      };
    }

    const tipoReciclable = verificacion[0].tipo_reciclable_idtipo_reciclable;
    const [resultRuta] = await connection.query(
      `INSERT INTO rutas
        (fecha_creacion, recolector_idrecolector, tipo_reciclable_idtipo_reciclable, usuarios_idusuario)
       VALUES (CURDATE(), ?, ?, ?)`,
      [idrecolector, tipoReciclable, idAdmin]
    );

    const idrutas = resultRuta.insertId;
    const values = solicitudes.map((idSolicitud) => [idSolicitud, idrutas]);
    await connection.query(
      `INSERT INTO solicitud_rutas
        (solicitud_recoleccion_idsolicitud_recoleccion, rutas_idrutas)
       VALUES ?`,
      [values]
    );

    await connection.commit();
    return {
      success: true,
      message: "Ruta asignada correctamente",
      data: { idrutas, idrecolector, solicitudes },
    };
  } catch (error) {
    await connection.rollback();
    console.error("Error en asignarRutaARecolector:", error);
    return { success: false, message: "Error al asignar la ruta", error: error.message };
  } finally {
    connection.release();
  }
};

export const cambiarRecolectorRuta = async (idRuta, idRecolector) => {
  try {
    const [check] = await pool.query(
      `SELECT recolector_idrecolector FROM rutas WHERE idrutas = ?`,
      [idRuta]
    );

    if (check.length === 0) {
      return { success: false, message: "No se encontró la ruta especificada" };
    }

    if (check[0].recolector_idrecolector === idRecolector) {
      return { success: false, message: "El recolector ya tiene esta ruta asignada" };
    }

    const [result] = await pool.query(
      `UPDATE rutas SET recolector_idrecolector = ? WHERE idrutas = ?`,
      [idRecolector, idRuta]
    );

    return result.affectedRows > 0
      ? { success: true, message: "Recolector actualizado correctamente" }
      : { success: false, message: "No se pudo actualizar la ruta" };
  } catch (error) {
    console.error("Error en cambiarRecolectorRuta:", error);
    return { success: false, message: "Error interno al cambiar el recolector", error };
  }
};

export const crearNotificacionRutaDB = async (idRuta, mensaje, titulo) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [ruta] = await connection.query(
      `SELECT idrutas FROM rutas WHERE idrutas = ? FOR UPDATE`,
      [idRuta]
    );
    if (ruta.length === 0) {
      await connection.rollback();
      return { success: false, message: "No se encontró la ruta especificada" };
    }

    const [estadoEnRuta] = await connection.query(
      `SELECT idestado_solicitud FROM estado_solicitud
       WHERE LOWER(TRIM(descripcion)) = 'en ruta' LIMIT 1`
    );
    if (estadoEnRuta.length === 0) {
      await connection.rollback();
      return { success: false, message: "No existe el estado En ruta" };
    }

    const [actualizacion] = await connection.query(
      `UPDATE solicitud_recoleccion s
       INNER JOIN solicitud_rutas sr
         ON sr.solicitud_recoleccion_idsolicitud_recoleccion = s.idsolicitud_recoleccion
       INNER JOIN estado_solicitud es
         ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
       SET s.estado_solicitud_idestado_solicitud = ?
       WHERE sr.rutas_idrutas = ?
         AND LOWER(TRIM(es.descripcion)) = 'pendiente'`,
      [estadoEnRuta[0].idestado_solicitud, idRuta]
    );

    const [result] = await connection.query(
      `INSERT INTO notificaciones (titulo, mensaje, fecha_envio, rutas_idrutas)
       VALUES (?, ?, NOW(), ?)`,
      [titulo || "Aviso de recolección", mensaje, idRuta]
    );

    await connection.commit();
    return {
      success: true,
      insertId: result.insertId,
      pedidosActualizados: actualizacion.affectedRows,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
