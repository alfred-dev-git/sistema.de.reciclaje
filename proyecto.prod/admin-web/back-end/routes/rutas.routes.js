import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getCantRutas } from '../controllers/rutas.controller.js';
import { asignarRuta } from '../controllers/rutas.controller.js';
import { getParadasRecolector } from '../controllers/paradas.controller.js';
import { cambiarRecolector } from '../controllers/rutas.controller.js';


const router = Router();

router.get('/cantrutas', requireAuth, getCantRutas);  //cant en Int

router.get('/inforutas', requireAuth, getParadasRecolector);   // informacion de cada parada    

router.post('/asignar', requireAuth, asignarRuta);          

router.post('/updaterecolector', requireAuth, cambiarRecolector);          


export default router;
