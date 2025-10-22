import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getCantRutas } from '../controllers/rutas.controller.js';
import { asignarRuta } from '../controllers/rutas.controller.js';

const router = Router();

router.get('/cantrutas', requireAuth, getCantRutas);          
router.post('/asignar', requireAuth, asignarRuta);          

export default router;
