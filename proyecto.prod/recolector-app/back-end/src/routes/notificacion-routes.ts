import express, { Router } from "express";
import { getNotificacion } from "../controllers/notificacion-controller.js";
import { verifyToken } from "../middlewares/verify-token.js";

const router: Router = express.Router();

router.get("/", verifyToken, getNotificacion);

export default router;
