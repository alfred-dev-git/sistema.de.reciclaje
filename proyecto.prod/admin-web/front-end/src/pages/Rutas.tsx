import RutasViewer from "../components/mapa/rutas-viewer";

export default function Rutas() {
  return (
    <div>
      <div className="rutas-page">
        <h2 className="titulo">Rutas sin asignar</h2>
        <p>
          Elegí el tipo de reciclable, seleccioná las solicitudes y creá la ruta.
        </p>
      </div>
      <RutasViewer />
    </div>
  );
}
