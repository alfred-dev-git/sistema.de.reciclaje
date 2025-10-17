import { decodeToken } from '../utils/jwt.js';

export const requireAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  try {
    const decoded = decodeToken(token);
    req.user = decoded; // { idusuario, nombre, email, rol_idrol }
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
