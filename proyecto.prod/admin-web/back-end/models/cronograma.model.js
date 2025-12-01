import { pool } from "../config/db.js";

export const obtenerCronogramaDB = async () => {
  const [rows] = await pool.query(`
    SELECT 
      c.idcronograma_recoleccion,
      c.dia_semana,
      c.semana_mes,
      c.hora_inicio,
      c.hora_fin,
      tr.descripcion AS tipo_reciclable,
      n.mensaje AS ultima_notificacion,
      n.fecha_envio AS fecha_ultima_notificacion
    FROM cronograma_recoleccion c
    INNER JOIN tipo_reciclable tr 
      ON c.tipo_reciclable_idtipo_reciclable = tr.idtipo_reciclable
    LEFT JOIN (
      SELECT
        cronograma_recoleccion_idcronograma_recoleccion,
        mensaje,
        fecha_envio,
        ROW_NUMBER() OVER (
          PARTITION BY cronograma_recoleccion_idcronograma_recoleccion
          ORDER BY fecha_envio DESC
        ) AS rn
      FROM notificaciones
    ) n
      ON c.idcronograma_recoleccion = n.cronograma_recoleccion_idcronograma_recoleccion
      AND n.rn = 1
    WHERE c.activo = 1
    ORDER BY c.dia_semana ASC, c.semana_mes ASC;
  `);

  return rows;
};


export const crearNotificacionDB = async ({
  idcronograma_recoleccion,
  mensaje,
  fechaObjetivo,
}) => {
  try {
    // título automático opcional
    const titulo = "Aviso de recolección programada";

    // Insertar en la tabla notificaciones
    const [result] = await pool.query(
      `
      INSERT INTO notificaciones 
        (titulo, mensaje, fecha_envio, automatico, cronograma_recoleccion_idcronograma_recoleccion)
      VALUES (?, ?, ?, ?, ?);
      `,
      [titulo, mensaje, fechaObjetivo || new Date(), 0, idcronograma_recoleccion]
    );

    return { success: true, insertId: result.insertId };
  } catch (error) {
    console.error("❌ Error al crear notificación en DB:", error.message);
    throw error;
  }
};


// 🔹 Anular fecha (cambiar activo a 0)
export const anularFechaRecoleccionDB = async (idcronograma_recoleccion) => {
  const [result] = await pool.query(
    `UPDATE cronograma_recoleccion 
     SET activo = 0 
     WHERE idcronograma_recoleccion = ?`,
    [idcronograma_recoleccion]
  );
  return result.affectedRows > 0;
};


export const crearFechaRecoleccionDB = async (
  dia_semana,
  semana_mes,
  hora_inicio,
  hora_fin,
  tipo_reciclable
) => {
  try {
    // 🧭 Buscar coincidencias inactivas dentro de un rango de ±2 horas
    const [inactivasSimilares] = await pool.query(
      `SELECT idcronograma_recoleccion, hora_inicio, hora_fin
       FROM cronograma_recoleccion
       WHERE dia_semana = ?
         AND semana_mes = ?
         AND activo = 0
         AND (
            TIME_TO_SEC(TIMEDIFF(hora_inicio, ?)) BETWEEN -7200 AND 7200
            OR TIME_TO_SEC(TIMEDIFF(hora_fin, ?)) BETWEEN -7200 AND 7200
         )`,
      [dia_semana, semana_mes, hora_inicio, hora_fin]
    );

    if (inactivasSimilares.length > 0) {
      const existente = inactivasSimilares[0];
      return {
        success: false,
        message: `⚠️ Ya existe una recolección inactiva con horario similar (${existente.hora_inicio} - ${existente.hora_fin}). 
                  Podés reactivarla en lugar de crear una nueva(podes modificar horario).`,
        data: existente,
      };
    }

    // ⚠️ Verificar solapamiento exacto con activos
    const [solapadas] = await pool.query(
      `SELECT idcronograma_recoleccion, hora_inicio, hora_fin 
       FROM cronograma_recoleccion
       WHERE dia_semana = ?
         AND semana_mes = ?
         AND activo = 1
         AND (
              (hora_inicio <= ? AND hora_fin > ?) OR
              (hora_inicio < ? AND hora_fin >= ?) OR
              (hora_inicio >= ? AND hora_fin <= ?)
         )`,
      [
        dia_semana,
        semana_mes,
        hora_inicio, hora_inicio,
        hora_fin, hora_fin,
        hora_inicio, hora_fin
      ]
    );

    if (solapadas.length > 0) {
      return {
        success: false,
        message: `⚠️ Ya existe una recolección activa en esa franja horaria (${solapadas[0].hora_inicio} - ${solapadas[0].hora_fin}).`,
        data: solapadas[0],
      };
    }

    // ✅ Crear si no hay conflicto
    const [result] = await pool.query(
      `INSERT INTO cronograma_recoleccion 
        (dia_semana, semana_mes, hora_inicio, hora_fin, tipo_reciclable_idtipo_reciclable, activo)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [dia_semana, semana_mes, hora_inicio, hora_fin, tipo_reciclable]
    );

    return {
      success: true,
      message: "✅ Fecha de recolección creada correctamente",
      id: result.insertId,
    };

  } catch (error) {
    console.error("❌ Error al crear fecha:", error.message);
    return {
      success: false,
      message: error.message || "Error interno del servidor",
    };
  }
};



// 🔹 Modificar fecha (actualiza los campos principales)
export const modificarFechaRecoleccionDB = async (idcronograma_recoleccion, data) => {
  const { dia_semana, semana_mes, hora_inicio, hora_fin, tipo_reciclable } = data;

  const [result] = await pool.query(
    `UPDATE cronograma_recoleccion
     SET dia_semana = ?,
         semana_mes = ?,
         hora_inicio = ?,
         hora_fin = ?,
         tipo_reciclable_idtipo_reciclable = ?
     WHERE idcronograma_recoleccion = ?`,
    [dia_semana, semana_mes, hora_inicio, hora_fin, tipo_reciclable, idcronograma_recoleccion]
  );

  return result.affectedRows > 0;
};

export const activarFechaRecoleccionDB = async (idcronograma_recoleccion) => {
  try {
    // 1️⃣ Obtener la fecha a activar
    const [rows] = await pool.query(
      `SELECT 
         dia_semana, 
         semana_mes, 
         hora_inicio, 
         hora_fin, 
         tipo_reciclable_idtipo_reciclable
       FROM cronograma_recoleccion
       WHERE idcronograma_recoleccion = ?`,
      [idcronograma_recoleccion]
    );

    if (rows.length === 0) {
      return { success: false, message: "Fecha no encontrada" };
    }

    const {
      dia_semana,
      semana_mes,
      hora_inicio,
      hora_fin,
      tipo_reciclable_idtipo_reciclable,
    } = rows[0];

    // 2️⃣ Buscar solapamientos con fechas activas en el mismo día/semana/tipo
    const [solapadas] = await pool.query(
      `
      SELECT idcronograma_recoleccion, hora_inicio, hora_fin
      FROM cronograma_recoleccion
      WHERE activo = 1
        AND dia_semana = ?
        AND semana_mes = ?
        AND idcronograma_recoleccion <> ?
        AND (
              (TIME(?) < hora_fin AND TIME(?) > hora_inicio)
              OR (TIME(?) < hora_fin AND TIME(?) > hora_inicio)
              OR (TIME(?) <= hora_inicio AND TIME(?) >= hora_fin)
        )
      `,
      [
        dia_semana,
        semana_mes,
        tipo_reciclable_idtipo_reciclable,
        idcronograma_recoleccion,
        hora_inicio, hora_inicio,
        hora_fin, hora_fin,
        hora_inicio, hora_fin,
      ]
    );

    if (solapadas.length > 0) {
      const conflicto = solapadas[0];
      return {
        success: false,
        message: `⚠️ No se puede activar: se superpone con una recolección activa (${conflicto.hora_inicio} - ${conflicto.hora_fin}).`,
      };
    }

    // 3️⃣ Activar si no hay conflicto
    const [result] = await pool.query(
      `UPDATE cronograma_recoleccion
       SET activo = 1
       WHERE idcronograma_recoleccion = ?`,
      [idcronograma_recoleccion]
    );

    if (result.affectedRows > 0) {
      return { success: true, message: "✅ Fecha activada correctamente" };
    }

    return { success: false, message: "No se pudo activar la fecha" };
  } catch (error) {
    console.error("❌ Error al activar fecha:", error.message);
    return { success: false, message: "Error interno del servidor" };
  }
};

// model/cronograma.model.js
export const obtenerFechasInactivasDB = async () => {
  const [rows] = await pool.query(`
    SELECT 
      c.idcronograma_recoleccion,
      c.dia_semana,
      c.semana_mes,
      c.hora_inicio,
      c.hora_fin,
      tr.descripcion AS tipo_reciclable,
      n.mensaje AS ultima_notificacion,
      n.fecha_envio AS fecha_ultima_notificacion
    FROM cronograma_recoleccion c
    INNER JOIN tipo_reciclable tr
      ON c.tipo_reciclable_idtipo_reciclable = tr.idtipo_reciclable
    LEFT JOIN (
      SELECT n1.*
      FROM notificaciones n1
      INNER JOIN (
        SELECT cronograma_recoleccion_idcronograma_recoleccion, MAX(fecha_envio) AS max_fecha
        FROM notificaciones
        GROUP BY cronograma_recoleccion_idcronograma_recoleccion
      ) n2
      ON n1.cronograma_recoleccion_idcronograma_recoleccion = n2.cronograma_recoleccion_idcronograma_recoleccion
      AND n1.fecha_envio = n2.max_fecha
    ) n
      ON c.idcronograma_recoleccion = n.cronograma_recoleccion_idcronograma_recoleccion
    WHERE c.activo = 0
    ORDER BY c.dia_semana ASC, c.semana_mes ASC;
  `);
  return rows;
};
