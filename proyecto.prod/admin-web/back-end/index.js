import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import paradasRoutes from './routes/paradas.routes.js';

const app = express();

// 🔹 Configurar CORS dinámicamente (funciona en local y en Railway)
const allowedOrigins = [
  'http://localhost:5173',             // Vite local
  process.env.CORS_ORIGIN              // Frontend desplegado (ej: https://miapp-front.vercel.app)
].filter(Boolean); // elimina undefined

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api', pedidosRoutes);
app.use('/api', paradasRoutes);

// 🔹 Railway asigna su propio puerto, así que usá este formato:
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor backend corriendo en el puerto ${PORT}`);
});