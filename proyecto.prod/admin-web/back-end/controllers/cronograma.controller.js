import {crearNotificacionDB, obtenerCronogramaDB, anularFechaRecoleccionDB, crearFechaRecoleccionDB, modificarFechaRecoleccionDB, obtenerFechasInactivasDB, activarFechaRecoleccionDB } from "../models/cronograma.model.js";

// Obtener cronograma (ya existente)
export const getCronograma = async (req, res) => {
  try {
    const cronograma = await obtenerCronogramaDB();
    res.json(cronograma);
  } catch (error) {
    console.error("❌ Error al obtener Cronograma:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Nueva función: notificar un día de recolección
export const notificarRecoleccion = async (req, res) => {
  try {
    const { idcronograma_recoleccion, mensaje, fechaObjetivo } = req.body;

    if (!idcronograma_recoleccion || !mensaje) {
      return res
        .status(400)
        .json({ message: "Debe enviar idcronograma_recoleccion y mensaje" });
    }

    const result = await crearNotificacionDB({
      idcronograma_recoleccion,
      mensaje,
      fechaObjetivo,
    });

    res.json({
      success: true,
      message: "Notificación creada y enviada correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error al notificar recolección:", error.message);
    res.status(500).json({ message: "Error al crear la notificación" });
  }
};


// 🔴 Anular fecha de recolección
export const anularFechaRecoleccion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Falta el ID del cronograma a anular" });
    }

    const exito = await anularFechaRecoleccionDB(id);

    if (exito) {
      res.json({ message: "✅ Fecha de recolección anulada correctamente" });
    } else {
      res.status(404).json({ message: "No se encontró la fecha a anular" });
    }
  } catch (error) {
    console.error("❌ Error al anular fecha:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const crearFechaRecoleccion = async (req, res) => {
  try {
    const { dia_semana, semana_mes, hora_inicio, hora_fin, tipo_reciclable } = req.body;

    // Validar campos requeridos
    if (!dia_semana || !semana_mes || !hora_inicio || !hora_fin || !tipo_reciclable) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // 🔧 Ahora pasamos los valores correctamente (no un objeto)
    const resultado = await crearFechaRecoleccionDB(
      dia_semana,
      semana_mes,
      hora_inicio,
      hora_fin,
      tipo_reciclable
    );

    if (!resultado.success) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);

  } catch (error) {
    console.error("❌ Error al crear fecha:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
};



export const modificarFechaRecoleccion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      dia_semana,
      semana_mes,
      hora_inicio,
      hora_fin,
      tipo_reciclable,
    } = req.body;

    // Validaciones básicas
    if (!id) {
      return res.status(400).json({ message: "Falta el ID del cronograma a modificar" });
    }

    if (!dia_semana || !semana_mes || !hora_inicio || !hora_fin || !tipo_reciclable) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const exito = await modificarFechaRecoleccionDB(id, {
      dia_semana,
      semana_mes,
      hora_inicio,
      hora_fin,
      tipo_reciclable,
    });

    if (exito) {
      res.json({ message: "✅ Fecha de recolección modificada correctamente" });
    } else {
      res.status(404).json({ message: "No se encontró la fecha a modificar" });
    }
  } catch (error) {
    console.error("❌ Error al modificar fecha:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};



export const obtenerFechasInactivas = async (req, res) => {
  try {
    const data = await obtenerFechasInactivasDB();
    res.json(data);
  } catch (error) {
    console.error("❌ Error al traer fechas inactivas:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const activarFechaRecoleccion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Debe enviar el ID en la URL",
      });
    }

    const result = await activarFechaRecoleccionDB(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("❌ Error al activar la fecha:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno al activar la fecha de recolección",
    });
  }
};