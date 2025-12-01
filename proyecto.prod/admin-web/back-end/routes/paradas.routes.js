import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getParadas } from '../controllers/paradas.controller.js';

const router = Router();

router.get('/paradas', requireAuth, getParadas);          
// router.post('/paradas', requireAuth, asignarRuta);          

export default router;
