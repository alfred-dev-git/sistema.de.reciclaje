import { Link, Outlet } from 'react-router-dom';
import Protected from './components/Protected';
import { useAuth } from './context/AuthContext';
import background from './assets/Backgrounds/background.jpg';
import PerfilModal from "./components/perfil/perfil-modal";
import EditarCampoModal from "./components/perfil/editar-modal";
import { useState, useEffect } from "react";
import { perfilService, Perfil } from "./api/services/perfil.service";

export default function App() {
  const { user, logout } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [showPerfil, setShowPerfil] = useState(false);

  // Estados para edición
  const [editVisible, setEditVisible] = useState(false);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    perfilService.getPerfil().then((res) => {
      if (res.success && res.data) setPerfil(res.data);
    });
  }, []);

  const onEditField = (field: string) => {
    if (!perfil) return;

    setEditField(field);
    if (field === "municipio") {
      setEditValue(perfil.municipio_idmunicipio?.toString() || "");
    } else {
      setEditValue(perfil[field as keyof Perfil] as string);
    }
    setEditVisible(true);
  };

  return (
    <Protected>
      <div className="layout">
        <header className="topbar">
          <button className="menu">≡</button>

          <div className="user">
            <button
              style={{ background: "transparent", border: "none", cursor: "pointer" }}
              onClick={() => setShowPerfil(true)}
            >
              {user?.nombre}
            </button>

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

        {perfil && (
          <PerfilModal
            visible={showPerfil}
            perfil={perfil}
            onClose={() => setShowPerfil(false)}
            onEditField={onEditField}
          />
        )}

        <EditarCampoModal
          visible={editVisible}
          field={editField}
          value={editValue}
          onClose={() => setEditVisible(false)}
          onSave={(newValue) => {
            if (editField === "municipio") {
              perfilService.updatePerfil({ municipio_idmunicipio: Number(newValue) }).then((res) => {
                if (res.success && res.data) setPerfil(res.data);
              });
            } else {
              perfilService.updatePerfil({ [editField]: newValue }).then((res) => {
                if (res.success && res.data) setPerfil(res.data);
              });
            }

            setEditVisible(false);
          }}

        />
      </div>
    </Protected>
  );
}
