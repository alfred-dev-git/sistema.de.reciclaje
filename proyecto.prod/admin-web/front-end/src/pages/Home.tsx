import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { http } from '../api/http';
import Card from '../components/Card';

type KPIs = { rutasSinAsignar: number; recolectoresActivos: number; fechasActivas: number };

export default function Home() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    http.get('/home/kpis').then(r => setKpis(r.data)).catch(() => { });
  }, []);

  return (
    <div className="home">
      <div className="hero">
        <div className="welcome">
          <h2>Bienvenido</h2>
          <p>RE-COLECTAPP</p>
        </div>
      </div>

      <div className="">
        <Card title="Asignar Rutas">
          <p>Hay {kpis?.rutasSinAsignar ?? '...'} rutas sin asignar</p>
          <button
            onClick={() => navigate("/rutas")}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Ver rutas
          </button>
        </Card>
        <Card title="Lanzar notificación">
          <p>Hay {kpis?.fechasActivas ?? '...'} fechas activas</p>
        </Card>
        <Card title="Ver Historial de recolecciones">
          <a href="/historial">Historial</a>
        </Card>
        <Card title="Movimientos del recolector">
          <p>Hay {kpis?.recolectoresActivos ?? '...'} recolectores activos</p>
        </Card>
        <Card title="Administrar solicitud puntos">
          <p>Próximamente…</p>
        </Card>
      </div>
    </div>
  );
}
