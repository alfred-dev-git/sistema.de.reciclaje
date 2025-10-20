import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { http } from '../api/http';
import Card from '../components/Card';
import banner from '../assets/logos/logo2.png';


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
          <img src={banner} alt="Recolectapp" style={styles.logo} />
        </div>
      </div>

      <div className="Container-Cards">
        <Card title="Asignar Rutas" isHome={true}>
          <p>Hay {kpis?.rutasSinAsignar ?? '...'} rutas sin asignar</p>
          <button
            onClick={() => navigate("/rutas")}
          >
            🢂
          </button>
        </Card>
        <Card title="Lanzar notificación" isHome={true}>
          <p>Hay {kpis?.fechasActivas ?? '...'} fechas activas</p>
          <button
            onClick={() => navigate("/cronograma")}

          >
            🢂
          </button>
        </Card>
        <Card title="Ver Historial de recolecciones" isHome={true}>
          <button
            onClick={() => navigate("/historial")}
          >
            🢂
          </button>
        </Card>
        <Card title="Movimientos del recolector" isHome={true}>
          <p>Hay {kpis?.recolectoresActivos ?? '...'} recolectores activos</p>
          <button
          >
            🢂
          </button>
        </Card>
        <Card title="Administrar solicitud puntos" isHome={true}>
          <p>Próximamente…</p>
          <button
          >
            🢂
          </button>
        </Card>
      </div>
    </div>
  );
}
const styles = {
  logo: {
    width: '200px',
    height: 'auto',
  }

}