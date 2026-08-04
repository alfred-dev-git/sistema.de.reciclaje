import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getTiposReciclable, updateTipoReciclable, createTipoReciclable } from '../controllers/reciclables.controller.js';

const router = Router();

router.get('/getAll', requireAuth, getTiposReciclable);   
router.post('/create', requireAuth, createTipoReciclable);   
router.put('/update/:id', requireAuth, updateTipoReciclable);   


export default router;
