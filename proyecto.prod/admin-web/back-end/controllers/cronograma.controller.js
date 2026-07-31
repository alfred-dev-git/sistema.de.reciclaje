import {
  obtenerCronogramaDB,
  anularFechaRecoleccionDB,
  crearFechaRecoleccionDB,
  modificarFechaRecoleccionDB,
  obtenerFechasInactivasDB,
  activarFechaRecoleccionDB,
  crearNotificacionesFrecuenciaDB,
} from "../models/cronograma.model.js";

export const getCronograma = async (_req, res) => {
  try {
    res.json(await obtenerCronogramaDB());
  } catch (error) {
    console.error("Error al obtener frecuencias:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const notificarRecoleccion = async (req, res) => {
  try {
    const { idcronograma_recoleccion, mensaje } = req.body;
    const idFrecuencia = Number(idcronograma_recoleccion);
    if (!Number.isInteger(idFrecuencia) || idFrecuencia <= 0 || !mensaje?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Se requiere una frecuencia y un mensaje",
      });
    }

    const resultado = await crearNotificacionesFrecuenciaDB(
      idFrecuencia,
      mensaje.trim()
    );
    res.status(resultado.success ? 200 : 409).json(resultado);
  } catch (error) {
    console.error("Error al notificar frecuencia:", error);
    res.status(500).json({ success: false, message: "Error al crear las notificaciones" });
  }
};

export const anularFechaRecoleccion = async (req, res) => {
  try {
    const exito = await anularFechaRecoleccionDB(req.params.id);
    if (!exito) return res.status(404).json({ message: "No se encontró la frecuencia" });
    res.json({ message: "Frecuencia anulada correctamente" });
  } catch (error) {
    console.error("Error al anular frecuencia:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const crearFechaRecoleccion = async (req, res) => {
  try {
    const { dia_semana, semana_mes, hora_inicio, hora_fin, tipo_reciclable } = req.body;
    if (!dia_semana || !semana_mes || !hora_inicio || !hora_fin || !tipo_reciclable) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    if (hora_inicio >= hora_fin) {
      return res.status(400).json({ message: "La hora de inicio debe ser anterior a la hora de fin" });
    }

    const resultado = await crearFechaRecoleccionDB(
      dia_semana, semana_mes, hora_inicio, hora_fin, tipo_reciclable
    );
    res.status(resultado.success ? 200 : 409).json(resultado);
  } catch (error) {
    console.error("Error al crear frecuencia:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

export const modificarFechaRecoleccion = async (req, res) => {
  try {
    const { dia_semana, semana_mes, hora_inicio, hora_fin, tipo_reciclable } = req.body;
    if (!dia_semana || !semana_mes || !hora_inicio || !hora_fin || !tipo_reciclable) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }
    if (hora_inicio >= hora_fin) {
      return res.status(400).json({ message: "La hora de inicio debe ser anterior a la hora de fin" });
    }

    const exito = await modificarFechaRecoleccionDB(req.params.id, req.body);
    if (!exito) return res.status(409).json({ message: "La frecuencia se superpone o no existe" });
    res.json({ message: "Frecuencia modificada correctamente" });
  } catch (error) {
    console.error("Error al modificar frecuencia:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const obtenerFechasInactivas = async (_req, res) => {
  try {
    res.json(await obtenerFechasInactivasDB());
  } catch (error) {
    console.error("Error al obtener frecuencias inactivas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const activarFechaRecoleccion = async (req, res) => {
  try {
    const resultado = await activarFechaRecoleccionDB(req.params.id);
    res.status(resultado.success ? 200 : 409).json(resultado);
  } catch (error) {
    console.error("Error al activar frecuencia:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};
