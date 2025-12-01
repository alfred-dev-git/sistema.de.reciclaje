import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { obtenerPerfil, getMunicipios, actualizarPerfil} from '../controllers/perfil.controller.js';

const router = Router();

router.get('/', requireAuth, obtenerPerfil );   
router.get('/municipios', requireAuth, getMunicipios );   
router.put('/update', requireAuth, actualizarPerfil );   
// router.put('/activar/:idusuario', requireAuth, activarUsuario);   
// router.put('/desactivar/:idusuario', requireAuth, desactivarUsuario );   


export default router;
