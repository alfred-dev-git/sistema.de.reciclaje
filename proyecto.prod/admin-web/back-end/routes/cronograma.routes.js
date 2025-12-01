import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getCronograma } from '../controllers/cronograma.controller.js';
import { notificarRecoleccion } from '../controllers/cronograma.controller.js';
import { anularFechaRecoleccion } from '../controllers/cronograma.controller.js';
import { crearFechaRecoleccion  } from '../controllers/cronograma.controller.js';
import { modificarFechaRecoleccion  } from '../controllers/cronograma.controller.js';

import { obtenerFechasInactivas  } from '../controllers/cronograma.controller.js';

import { activarFechaRecoleccion  } from '../controllers/cronograma.controller.js';

const router = Router();

router.get('/info', requireAuth, getCronograma);   

router.post('/notificar', requireAuth, notificarRecoleccion);

router.post('/crear', requireAuth, crearFechaRecoleccion);     

router.post('/anular/:id', requireAuth, anularFechaRecoleccion);     

router.put('/modificar/:id', requireAuth, modificarFechaRecoleccion);     

router.put('/activar/:id', requireAuth, activarFechaRecoleccion);     

router.get('/inactivas', requireAuth, obtenerFechasInactivas);     


export default router;
