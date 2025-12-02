// src/routes/login-routes.ts
import { Router, Request, Response } from 'express';
import { loginUser, forgotPassword, resetPassword } from '../controllers/login-controller.js';
import { validateLogin } from '../middlewares/validate-login.js';
const router = Router();

// // Definimos un tipo para el request que tenga user
// interface AuthenticatedRequest extends Request {
//   user?: {
//     id: number;
//     email: string;
//   };
// }

router.post('/login', validateLogin, loginUser);
router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);

// router.post('/logout', logoutUser);

// // Ruta protegida
// router.get('/perfil', verifyToken, (req: AuthenticatedRequest, res: Response) => {
//   res.json({
//     message: 'Bienvenido al perfil privado',
//     usuario: req.user // id y email del token
//   });
// });

export default router;
