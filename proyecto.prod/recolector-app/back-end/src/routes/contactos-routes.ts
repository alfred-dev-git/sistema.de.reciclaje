import { Router } from "express";
import { getContactosAdmin } from "../controllers/contactos-controller.js";
import { verifyToken } from "../middlewares/verify-token.js";

const router = Router();

router.get("/contactos-admin", verifyToken, getContactosAdmin);

export default router;