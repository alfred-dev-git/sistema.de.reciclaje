import {
  obtenerTiposReciclableDB,
  crearTipoReciclableDB,
  modificarTipoReciclableDB,
} from "../models/reciclables.model.js";

export const getTiposReciclable = async (req, res) => {
  try {
    const tipos = await obtenerTiposReciclableDB();
    res.json(tipos);
  } catch (error) {
    console.error("❌ Error al obtener tipos de reciclable:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


/** POST: crear */
export const createTipoReciclable = async (req, res) => {
  try {
    const { descripcion } = req.body;

    if (!descripcion || descripcion.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "La descripción es obligatoria",
      });
    }

    const nuevo = await crearTipoReciclableDB({ descripcion });

    res.json({
      success: true,
      message: "Tipo de reciclable creado correctamente",
      data: nuevo,
    });
  } catch (error) {
    console.error("❌ Error al crear tipo:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al crear tipo de reciclable",
    });
  }
};

/** PUT: actualizar */
export const updateTipoReciclable = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion } = req.body;

    if (!descripcion || descripcion.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "La descripción es obligatoria",
      });
    }

    const actualizado = await modificarTipoReciclableDB(id, { descripcion });

    res.json({
      success: true,
      message: "Tipo de reciclable modificado correctamente",
      data: actualizado,
    });
  } catch (error) {
    console.error("❌ Error al modificar tipo:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al modificar tipo de reciclable",
    });
  }
};