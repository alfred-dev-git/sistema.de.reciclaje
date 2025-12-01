import { obtenerPerfilDB, obtenerMunicipiosDB, actualizarPerfilDB  } from "../models/perfil.model.js";

export const obtenerPerfil = async (req, res) => {
  try {
    // El ID VIENE DEL TOKEN (middleware de auth)
    const idusuario = req.user?.idusuario;
    if (!idusuario) {
      return res.status(400).json({
        success: false,
        message: "No se pudo obtener el usuario desde el token",
      });
    }

    const perfil = await obtenerPerfilDB(idusuario);

    if (!perfil) {
      return res.status(404).json({
        success: false,
        message: "Perfil no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Perfil obtenido correctamente",
      data: perfil,
    });

  } catch (error) {
    console.error("❌ Error al obtener perfil:", error.message);

    res.status(500).json({
      success: false,
      message: "Error al obtener perfil",
    });
  }
};


export const getMunicipios = async (req, res) => {
  try {
    const municipios = await obtenerMunicipiosDB();
    res.json({
      success: true,
      message: "Municipios obtenidos correctamente",
      data: municipios,
    });
  } catch (error) {
    console.error("❌ Error al obtener municipios:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};


export const actualizarPerfil = async (req, res) => {
  try {
    const idusuario = req.user?.idusuario;

    if (!idusuario) {
      return res.status(400).json({
        success: false,
        message: "No se pudo obtener el usuario desde el token",
      });
    }

    // Campos que pueden actualizarse
    const { nombre, apellido, telefono, email, municipio_idmunicipio } = req.body;

    const dataToUpdate = {};

    if (nombre !== undefined) dataToUpdate.nombre = nombre;
    if (apellido !== undefined) dataToUpdate.apellido = apellido;
    if (telefono !== undefined) dataToUpdate.telefono = telefono;
    if (email !== undefined) dataToUpdate.email = email;
    if (municipio_idmunicipio !== undefined) dataToUpdate.municipio_idmunicipio = municipio_idmunicipio;

    // Si no vino ningún campo, error
    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No se envió ningún campo para actualizar",
      });
    }
    // Actualiza en BD
    await actualizarPerfilDB(idusuario, dataToUpdate);

    // Obtiene perfil actualizado
    const perfilActualizado = await obtenerPerfilDB(idusuario);

    res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      data: perfilActualizado,
    });

  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error.message);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};