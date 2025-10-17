import RutasViewer from "../components/mapa/rutas-viewer";

export default function Rutas() {
  return (
    <div className="rutas-page">
      <h2 className="text-xl font-bold mb-2">Rutas sin asignar</h2>
      <p className="text-gray-600 mb-4">
        Visualizá las rutas pendientes y dividilas por cantidad de paradas.
      </p>
      <div className="w-full h-[80vh] border rounded-lg overflow-hidden">
        <RutasViewer />
      </div>
    </div>
  );
}
