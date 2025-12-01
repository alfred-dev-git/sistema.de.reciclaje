import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import paradasRoutes from './routes/paradas.routes.js';
import cronogramaRoutes from './routes/cronograma.routes.js';
import reciclablesRoutes from './routes/reciclables.routes.js';
import rutasRoutes from './routes/rutas.routes.js';
import usuarioRoutes from './routes/usuarios.routes.js';
import adminRoutes from './routes/perfil.routes.js';


const app = express();

// 🔹 Configurar CORS dinámicamente (funciona en local y en Railway)
const allowedOrigins = [
  'http://localhost:5173',             // Vitee local
  process.env.CORS_ORIGIN              // Frontend desplegado (ej: https://miapp-front.vercel.app)
].filter(Boolean); // elimina undefined

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api', pedidosRoutes);
app.use('/api', paradasRoutes);
app.use('/api/cronograma', cronogramaRoutes);
app.use('/api/reciclables', reciclablesRoutes);
app.use('/api/rutas', rutasRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/perfil', adminRoutes);




// 🔹 Railway asigna su propio puerto, así que usá este formato:
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor backend corriendo en el puerto ${PORT}`);
});