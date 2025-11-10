import express from "express";
import { verifyToken } from "../middlewares/verify-token.js";
import { validarRegistro } from "../middlewares/validate-register.js";
import { getPerfil, updateFotoPerfil, getFotoPerfil, getMunicipios, crearUsuario } from "../controllers/perfil-controller.js";

const router = express.Router();

// Obtener perfil (datos)
router.get("/", verifyToken, getPerfil);

// Obtener la foto (si querés mantenerlo)
router.get("/foto", verifyToken, getFotoPerfil);

// Actualizar la ruta local de la foto
router.put("/foto", verifyToken, updateFotoPerfil);

//usuario sin validar
router.post("/register", validarRegistro, crearUsuario);

router.get("/municipios", getMunicipios);


export default router;
