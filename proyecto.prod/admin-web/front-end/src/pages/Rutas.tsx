import RutasViewer from "../components/mapa/rutas-viewer";

export default function Rutas() {
  return (
    <div>
      <div className="rutas-page">
        <h2 className="titulo">Rutas sin asignar</h2>
        <p>
          Visualizá las rutas pendientes y dividilas por cantidad de paradas.
        </p>
      </div>
      <RutasViewer />
    </div>
  );
}
