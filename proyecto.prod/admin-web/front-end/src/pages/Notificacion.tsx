import CronogramaViewer from "../components/cronograma/cronograma-viewer";

export default function Cronograma() {
  return (
    <div className="rutas-page">
      <h2 className="text-xl font-bold mb-2">INFORMACION DE RECOLECCIONES</h2>
      <p className="text-gray-600 mb-4">
        Notificaciones y cronograma de recolecciones.
      </p>
      <div className="w-full h-[80vh] border rounded-lg overflow-hidden">
        <CronogramaViewer />
      </div>
    </div>
  );
}
