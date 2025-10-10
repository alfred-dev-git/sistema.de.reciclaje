import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import loginRoutes from './routes/login-routes.js';
import paradasRoutes from './routes/paradas-routes.js';
import recoleccionRoutes from './routes/recoleccion-routes.js';
import historialRoutes from './routes/historial-routes.js';
import notificacionRoutes from './routes/notificacion-routes.js';
import perfilRoutes from './routes/perfil-routes.js';
import cronogramaRoutes from './routes/cronograma-routes.js';

dotenv.config()

const app = express()

// //cors dev
// app.use(cors({
//   origin: 'http://localhost:5173', //luego cambiar a HTTPS y el nombre del domisnio 'https://midominio.com',
//   credentials: true
// }));

// cors prod
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use('/api/user', loginRoutes)
app.use('/api/paradas', paradasRoutes)
app.use('/api/completado', recoleccionRoutes)
app.use('/api/userAusente', recoleccionRoutes)
app.use('/api/historial', historialRoutes)
app.use('/api/notificacion', notificacionRoutes)
app.use('/api/perfil', perfilRoutes)
app.use('/api/cronograma', cronogramaRoutes)


// const PORT = Number(process.env.PORT) || 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor backend corriendo en el puerto ${PORT}`)
  
// })

// 🔹 Railway usa su propio PORT
const PORT = Number(process.env.PORT) || 8080
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`)
})