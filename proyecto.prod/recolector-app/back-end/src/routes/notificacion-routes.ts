import express, { Router } from "express";
import { notificacionRes } from "../controllers/notificacion-controller.js";
import { verifyToken } from "../middlewares/verify-token.js";

const router: Router = express.Router();

router.get("/", verifyToken, notificacionRes);

export default router;
