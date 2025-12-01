import UsuariosViewer from "../components/usuarios/usuarios-viewer";

export default function Usuarios() {
  return (
    <div className="rutas-page">
      <h2 className="titulo">Usuarios disponibles</h2>
      <p>
        Gestion de Usuarios
      </p>
      <div className="w-full h-[80vh] border rounded-lg overflow-hidden">
        <UsuariosViewer/>
      </div>
    </div>
  );
}
