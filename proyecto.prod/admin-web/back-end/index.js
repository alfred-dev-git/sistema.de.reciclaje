import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import paradasRoutes from './routes/paradas.routes.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Vite
  credentials: true
}));

// // cors prod
// app.use(cors({
//   origin: process.env.CORS_ORIGIN || '*',
//   credentials: true
// }))

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api', pedidosRoutes);
app.use('/api', paradasRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API escuchando en http://localhost:${port}`));

// // 🔹 Railway usa su propio PORT
// const PORT = Number(process.env.PORT) || 8080
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Servidor backend corriendo en el puerto ${PORT}`)
// })