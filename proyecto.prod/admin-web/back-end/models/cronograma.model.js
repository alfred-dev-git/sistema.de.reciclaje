import { pool } from "../config/db.js";

const seleccionarFrecuencias = async (activo) => {
  const [rows] = await pool.query(
    `SELECT f.idfrecuencia_recoleccion AS idcronograma_recoleccion,
            f.dia_semana, f.semana_mes, f.hora_inicio, f.hora_fin,
            tr.descripcion AS tipo_reciclable
     FROM frecuencia_recoleccion f
     INNER JOIN tipo_reciclable tr
       ON tr.idtipo_reciclable = f.tipo_reciclable_idtipo_reciclable
     WHERE f.activo = ?
     ORDER BY f.dia_semana ASC, f.semana_mes ASC`,
    [activo]
  );
  return rows;
};

export const obtenerCronogramaDB = async () => seleccionarFrecuencias(1);
export const obtenerFechasInactivasDB = async () => seleccionarFrecuencias(0);

export const crearNotificacionesFrecuenciaDB = async (idFrecuencia, mensaje) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [frecuencias] = await connection.query(
      `SELECT tipo_reciclable_idtipo_reciclable
       FROM frecuencia_recoleccion
       WHERE idfrecuencia_recoleccion = ? AND activo = 1`,
      [idFrecuencia]
    );
    if (frecuencias.length === 0) {
      await connection.rollback();
      return { success: false, message: "La frecuencia no existe o está inactiva" };
    }

    const [rutas] = await connection.query(
      `SELECT DISTINCT ru.idrutas
       FROM rutas ru
       INNER JOIN solicitud_rutas sr ON sr.rutas_idrutas = ru.idrutas
       INNER JOIN solicitud_recoleccion s
         ON s.idsolicitud_recoleccion = sr.solicitud_recoleccion_idsolicitud_recoleccion
       INNER JOIN estado_solicitud es
         ON es.idestado_solicitud = s.estado_solicitud_idestado_solicitud
       WHERE ru.tipo_reciclable_idtipo_reciclable = ?
         AND LOWER(es.descripcion) = 'pendiente'`,
      [frecuencias[0].tipo_reciclable_idtipo_reciclable]
    );

    if (rutas.length === 0) {
      await connection.rollback();
      return { success: false, message: "No hay rutas pendientes para este tipo de reciclable" };
    }

    const values = rutas.map((ruta) => [
      "Aviso de recolección programada",
      mensaje,
      new Date(),
      ruta.idrutas,
    ]);
    await connection.query(
      `INSERT INTO notificaciones (titulo, mensaje, fecha_envio, rutas_idrutas)
       VALUES ?`,
      [values]
    );

    await connection.commit();
    return {
      success: true,
      message: `Notificación enviada a ${rutas.length} ruta${rutas.length === 1 ? "" : "s"}`,
      rutasNotificadas: rutas.length,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const anularFechaRecoleccionDB = async (id) => {
  const [result] = await pool.query(
    `UPDATE frecuencia_recoleccion SET activo = 0 WHERE idfrecuencia_recoleccion = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

const buscarSolapamientos = async ({ dia_semana, semana_mes, hora_inicio, hora_fin, excluirId }) => {
  const params = [dia_semana, semana_mes, hora_fin, hora_inicio];
  const excluir = excluirId ? "AND idfrecuencia_recoleccion <> ?" : "";
  if (excluirId) params.push(excluirId);

  const [rows] = await pool.query(
    `SELECT idfrecuencia_recoleccion, hora_inicio, hora_fin
     FROM frecuencia_recoleccion
     WHERE activo = 1 AND dia_semana = ? AND semana_mes = ?
       AND hora_inicio < ? AND hora_fin > ? ${excluir}`,
    params
  );
  return rows;
};

export const crearFechaRecoleccionDB = async (
  dia_semana, semana_mes, hora_inicio, hora_fin, tipo_reciclable
) => {
  try {
    const [inactivas] = await pool.query(
      `SELECT idfrecuencia_recoleccion, hora_inicio, hora_fin
       FROM frecuencia_recoleccion
       WHERE dia_semana = ? AND semana_mes = ? AND activo = 0
         AND (TIME_TO_SEC(TIMEDIFF(hora_inicio, ?)) BETWEEN -7200 AND 7200
           OR TIME_TO_SEC(TIMEDIFF(hora_fin, ?)) BETWEEN -7200 AND 7200)`,
      [dia_semana, semana_mes, hora_inicio, hora_fin]
    );
    if (inactivas.length > 0) {
      return { success: false, message: "Ya existe una frecuencia inactiva con horario similar. Puede reactivarla." };
    }

    const solapadas = await buscarSolapamientos({ dia_semana, semana_mes, hora_inicio, hora_fin });
    if (solapadas.length > 0) {
      return { success: false, message: `Ya existe una frecuencia activa en esa franja (${solapadas[0].hora_inicio} - ${solapadas[0].hora_fin}).` };
    }

    const [result] = await pool.query(
      `INSERT INTO frecuencia_recoleccion
        (dia_semana, semana_mes, hora_inicio, hora_fin, tipo_reciclable_idtipo_reciclable, activo)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [dia_semana, semana_mes, hora_inicio, hora_fin, tipo_reciclable]
    );
    return { success: true, message: "Frecuencia creada correctamente", id: result.insertId };
  } catch (error) {
    return { success: false, message: error.message || "Error interno del servidor" };
  }
};

export const modificarFechaRecoleccionDB = async (id, data) => {
  const solapadas = await buscarSolapamientos({ ...data, excluirId: id });
  if (solapadas.length > 0) return false;
  const [result] = await pool.query(
    `UPDATE frecuencia_recoleccion
     SET dia_semana = ?, semana_mes = ?, hora_inicio = ?, hora_fin = ?,
         tipo_reciclable_idtipo_reciclable = ?
     WHERE idfrecuencia_recoleccion = ?`,
    [data.dia_semana, data.semana_mes, data.hora_inicio, data.hora_fin, data.tipo_reciclable, id]
  );
  return result.affectedRows > 0;
};

export const activarFechaRecoleccionDB = async (id) => {
  try {
    const [rows] = await pool.query(
      `SELECT dia_semana, semana_mes, hora_inicio, hora_fin
       FROM frecuencia_recoleccion WHERE idfrecuencia_recoleccion = ?`,
      [id]
    );
    if (rows.length === 0) return { success: false, message: "Frecuencia no encontrada" };
    const solapadas = await buscarSolapamientos({ ...rows[0], excluirId: id });
    if (solapadas.length > 0) {
      return { success: false, message: `No se puede activar: se superpone con otra frecuencia (${solapadas[0].hora_inicio} - ${solapadas[0].hora_fin}).` };
    }
    const [result] = await pool.query(
      `UPDATE frecuencia_recoleccion SET activo = 1 WHERE idfrecuencia_recoleccion = ?`,
      [id]
    );
    return result.affectedRows > 0
      ? { success: true, message: "Frecuencia activada correctamente" }
      : { success: false, message: "No se pudo activar la frecuencia" };
  } catch (error) {
    console.error("Error al activar frecuencia:", error);
    return { success: false, message: "Error interno del servidor" };
  }
};
