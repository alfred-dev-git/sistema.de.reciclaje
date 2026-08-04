import {
  obtenerUsuariosDB,
  desactivarUsuarioDB,
  activarUsuarioDB,
} from "../models/usuarios.model.js";

/** GET: obtener todos los usuarios */
export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await obtenerUsuariosDB();
    res.json({
      success: true,
      message: "Usuarios obtenidos correctamente",
      data: usuarios,
    });
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

/** PUT: desactivar usuario */
export const desactivarUsuario = async (req, res) => {
  try {
    const { idusuario  } = req.params;

    if (!idusuario ) {
      return res.status(400).json({
        success: false,
        message: "El ID del usuario es obligatorio",
      });
    }

    const resultado = await desactivarUsuarioDB(idusuario);

    res.json({
      success: true,
      message: "Usuario desactivado correctamente",
      data: resultado,
    });
  } catch (error) {
    console.error("❌ Error al desactivar usuario:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al desactivar usuario",
    });
  }
};

/** PUT: activar usuario */
export const activarUsuario = async (req, res) => {
  try {
    const { idusuario  } = req.params;

    if (!idusuario ) {
      return res.status(400).json({
        success: false,
        message: "El ID del usuario es obligatorio",
      });
    }

    const resultado = await activarUsuarioDB(idusuario);

    res.json({
      success: true,
      message: "Usuario activado correctamente",
      data: resultado,
    });
  } catch (error) {
    console.error("❌ Error al activar usuario:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al activar usuario",
    });
  }
};
