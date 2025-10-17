import { Link, Outlet } from 'react-router-dom';
import Protected from './components/Protected';
import { useAuth } from './context/AuthContext';
import banner from './assets/logos/logo2.png';

export default function App() {
  const { user, logout } = useAuth();
  return (
    <Protected>
      <div className="layout">
        <header className="topbar">
          <button className="menu">≡</button>
          <img src={banner} alt="Recolectapp" style={styles.logo} />
          <div className="user">
            {user?.nombre}
            <button onClick={logout}>Salir</button>
          </div>
        </header>

        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/historial">Historial</Link>
        </nav>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </Protected>
  );
}
const styles = {
  logo: {
    width: '200px',
    height: 'auto',
  }

}