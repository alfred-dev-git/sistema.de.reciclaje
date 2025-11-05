import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getTiposReciclable } from '../controllers/reciclables.controller.js';

const router = Router();

router.get('/getAll', requireAuth, getTiposReciclable);   


export default router;
