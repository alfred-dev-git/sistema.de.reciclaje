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
          <p>Hay {kpis?.rutasSinAsignar ?? '...'} pedidos sin asignar</p>
          <button
            onClick={() => navigate("/rutas")}
          >
            🢂
          </button>
        </Card>
        <Card title="Frecuencia de recolecciones" isHome={true}>
          <p>Hay {kpis?.fechasActivas ?? '...'} frecuencias activas</p>
          <button
            onClick={() => navigate("/cronograma")}

          >
            🢂
          </button>
        </Card>
        <Card title="Ver estadísticas" isHome={true}>
          <p>Revisar el historial de pedidos</p>
          <button
            onClick={() => navigate("/historial")}
          >
            🢂
          </button>
        </Card>
        <Card title="Movimientos del recolector" isHome={true}>
          <p>Hay {kpis?.recolectoresActivos ?? '...'} recolectores activos</p>
          <button
            onClick={() => navigate("/seguimiento")}
          >
            🢂
          </button>
        </Card>
                <Card title="Lista de usuarios" isHome={true}>
          <p>Total de usuarios en el sistema</p>
          <button
            onClick={() => navigate("/usuarios")}
          >
            🢂
          </button>
        </Card>
                <Card title="Administrar tipo de reciclables" isHome={true}>
          <p>Ver residuos disponibles</p>
          <button
            onClick={() => navigate("/reciclables")}
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
