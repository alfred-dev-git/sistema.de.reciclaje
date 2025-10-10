import express from "express";
import { verifyToken } from "../middlewares/verify-token.js";
import { getPerfil, updateFotoPerfil, getFotoPerfil } from "../controllers/perfil-controller.js";

const router = express.Router();

// Obtener perfil (datos)
router.get("/", verifyToken, getPerfil);

// Obtener la foto (si querés mantenerlo)
router.get("/foto", verifyToken, getFotoPerfil);

// Actualizar la ruta local de la foto
router.put("/foto", verifyToken, updateFotoPerfil);

export default router;
