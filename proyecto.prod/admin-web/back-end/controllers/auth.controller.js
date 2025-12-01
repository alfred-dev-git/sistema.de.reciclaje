import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { signToken } from '../utils/jwt.js';
import { validateLogin } from '../utils/validate.login.js';

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  path: '/',
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // ✅ Validación de formato básico
  const { valid, errors } = validateLogin({ email, password });
  if (!valid) return res.status(400).json({ error: errors.join(', ') });

  try {
    // ✅ Incluimos el campo activo en la consulta
    const [rows] = await pool.query(
      `SELECT idusuario, nombre, apellido, email, password, rol_idrol, activo 
       FROM usuario 
       WHERE email = ? 
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = rows[0];

    // ✅ Verificar si el usuario está activo
    if (user.activo !== 1) {
      return res.status(403).json({
        error: 'Usuario inactivo/inválido, contacta con el soporte',
      });
    }

    // ✅ Verificar contraseña
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: 'Credenciales inválidas' });

    // ✅ Validación de roles permitidos
    if (user.rol_idrol !== 1 && user.rol_idrol !== 2) {
      return res.status(403).json({
        error: 'Acceso denegado. Solo administradores pueden ingresar.',
      });
    }

    // ✅ Generar token si todo está correcto
    const token = signToken({
      idusuario: user.idusuario,
      nombre: user.nombre,
      email: user.email,
      rol_idrol: user.rol_idrol,
    });

    res.cookie('token', token, cookieOpts);

    return res.json({
      message: 'Login OK',
      user: {
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol_idrol: user.rol_idrol,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const me = async (req, res) => {
  return res.json({ user: req.user });
};

export const logout = async (req, res) => {
  res.clearCookie('token', { ...cookieOpts, maxAge: 0 });
  return res.json({ message: 'Logout OK' });
};
