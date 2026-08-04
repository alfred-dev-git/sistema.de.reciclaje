import express, { Router } from "express";
import { getCronograma } from "../controllers/cronograma-controller.js";
import { verifyToken } from "../middlewares/verify-token.js";

const router: Router = express.Router();

router.get("/", verifyToken, getCronograma);

export default router;
