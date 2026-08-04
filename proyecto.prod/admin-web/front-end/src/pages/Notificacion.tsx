import CronogramaViewer from "../components/cronograma/cronograma-viewer";

export default function Cronograma() {
  return (
    <div className="">
      <h2 className="titulo">FRECUENCIA DE RECOLECCIONES</h2>
      <p className="text-gray-600 mb-4">
        Frecuencias generales de recolección. Las notificaciones se envían desde cada ruta.
      </p>
      <div className="w-full h-[80vh] border rounded-lg overflow-hidden">
        <CronogramaViewer />
      </div>
    </div>
  );
}
