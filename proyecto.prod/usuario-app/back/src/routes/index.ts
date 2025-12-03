import { Router } from "express";
import authRoutes from "@/modules/auth/auth.routes";
import residuosRoutes from "@/modules/residuos/residuos.routes";
import addressesRoutes from "@/modules/addresses/addresses.routes";
import pedidosRoutes from "@/modules/pedidos/pedidos.routes";
import detalleRoutes from "@/modules/detalle/detalle.routes";
import usersRoutes from "@/modules/users/users.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true, service: "api-reciclaje" }));

router.use("/auth", authRoutes);
router.use("/residuos", residuosRoutes);
router.use("/addresses", addressesRoutes);
router.use("/pedidos", pedidosRoutes);
router.use("/detalle", detalleRoutes);
router.use("/users", usersRoutes);

export default router;
