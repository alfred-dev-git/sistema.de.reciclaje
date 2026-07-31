import express, { Router } from "express";
import { getPedidosAsignados } from "../controllers/rutas-controller.js";
import { verifyToken } from "../middlewares/verify-token.js";

const router: Router = express.Router();

router.get("/", verifyToken, getPedidosAsignados);

export default router;
