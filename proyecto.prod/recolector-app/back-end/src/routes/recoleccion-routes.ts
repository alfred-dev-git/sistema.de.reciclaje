import express, { Router } from "express";
import { postMarcarAusente, postMarcarCompletado } from "../controllers/recoleccion-controller.js";
import { verifyToken } from "../middlewares/verify-token.js";

const router: Router = express.Router();

router.post("/presente", verifyToken, postMarcarCompletado);

router.post("/ausente", verifyToken, postMarcarAusente);

export default router;
