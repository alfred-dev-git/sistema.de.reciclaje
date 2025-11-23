import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Home from './pages/Home'
import Historial from './pages/Historial'
import Rutas from "./pages/Rutas";
import Cronograma from "./pages/Notificacion";
import SeguimientoRutas from "./pages/SeguimientoRutas";
import Reciclables from "./pages/Reciclables";
import AppNavigator from './AppNavigator' 
import './styles.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppNavigator />,
    children: [
      {
        element: <App />, // layout protegido
        children: [
          { index: true, element: <Home /> },
          { path: "historial", element: <Historial /> },
          { path: "rutas", element: <Rutas /> }, 
          { path: "cronograma", element: <Cronograma /> }, 
          { path: "seguimiento", element: <SeguimientoRutas /> }, 
          { path: "reciclables", element: <Reciclables /> },         
        ],
      },
      { path: "login", element: <Login /> }, // fuera del layout protegido
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
