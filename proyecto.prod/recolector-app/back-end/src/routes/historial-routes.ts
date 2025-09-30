import express, { Router } from "express";
import { getHistorial } from "../controllers/historial-controller.js";
import { verifyToken } from "../middlewares/verify-token.js";

const router: Router = express.Router();

router.get("/", verifyToken, getHistorial);

export default router;
