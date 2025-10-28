import { Link, Outlet } from 'react-router-dom';
import Protected from './components/Protected';
import { useAuth } from './context/AuthContext';
import background from './assets/Backgrounds/background.jpg';
export default function App() {
  const { user, logout } = useAuth();
  return (
    <Protected>
      <div className="layout">
        <header className="topbar">
          <button className="menu">≡</button>
          <div className="user">
            {user?.nombre}
            <button onClick={logout}>Salir</button>
          </div>
        </header>

        <div
          style={{
            backgroundImage: `url(${background})`,

            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            width: '100%',
            padding: '20px',
          }}
        >
          <main className="content">
            <Outlet />
          </main>
        </div>
      </div>
    </Protected>
  );
}
