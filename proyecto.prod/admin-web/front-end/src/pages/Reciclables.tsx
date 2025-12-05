import ReciclablesViewer from "../components/reciclables/reciclables-viewer";

export default function Reciclables() {
  return (
    <div className="rutas-page">
      <h2 className="titulo">Tipos de reciclables disponibles</h2>
      <p>
        Gestion de los tipos de materiales reciclables que se pueden recolectar.
      </p>
      <div>
        <ReciclablesViewer />
      </div>
    </div>
  );
}
