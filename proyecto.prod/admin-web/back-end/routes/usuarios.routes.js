import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getUsuarios, desactivarUsuario, activarUsuario} from '../controllers/usuarios.controller.js';

const router = Router();

router.get('/', requireAuth, getUsuarios );   
router.put('/activar/:idusuario', requireAuth, activarUsuario);   
router.put('/desactivar/:idusuario', requireAuth, desactivarUsuario );   


export default router;
