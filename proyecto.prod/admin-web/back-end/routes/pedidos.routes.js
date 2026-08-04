import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getHistorial, getPedidosPorMes, getDistribucionTipos, getHomeKpis } from '../controllers/pedidos.controller.js';

const router = Router();

router.get('/historial', requireAuth, getHistorial);           // ?q=Nombre (opcional)
router.get('/stats/por-mes', requireAuth, getPedidosPorMes);
router.get('/stats/por-tipo', requireAuth, getDistribucionTipos);
router.get('/home/kpis', requireAuth, getHomeKpis);

export default router;
