import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getCronograma } from '../controllers/cronograma.controller.js';

const router = Router();

router.get('/info', requireAuth, getCronograma);          
// router.post('/paradas', requireAuth, asignarRuta);          

export default router;
