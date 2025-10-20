import React, { useEffect, useState } from "react";
import { obtenerRecolectorPorRuta, asignarRutaARecolector, Recolector } from "../api/services/recolector.service";

interface PanelRecolectorProps {
  rutaActiva: number | null;
}

export default function PanelRecolector({ rutaActiva }: PanelRecolectorProps) {
  const [recolector, setRecolector] = useState<Recolector | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (rutaActiva) {
      setLoading(true);
      obtenerRecolectorPorRuta(rutaActiva)
        .then((data) => setRecolector(data))
        .finally(() => setLoading(false));
    } else {
      setRecolector(null);
    }
  }, [rutaActiva]);

  const handleAsignarRuta = async () => {
    if (!recolector || !rutaActiva) return;
    const ok = await asignarRutaARecolector(recolector.id, rutaActiva);
    setMensaje(ok ? "Ruta asignada correctamente ✅" : "Error al asignar ruta ❌");
    setTimeout(() => setMensaje(null), 3000);
  };

  if (!rutaActiva)
    return (
      <div className="p-4 border rounded bg-gray-100 text-center">
        Seleccioná una ruta para ver detalles del recolector.
      </div>
    );

  if (loading) return <div className="p-4">Cargando información...</div>;

  return (
    <div className="p-4 border rounded bg-white shadow-md">
      <h3 className="text-lg font-semibold mb-2">Información del recolector</h3>
      {recolector ? (
        <>
          <p>
            <b>Nombre:</b> {recolector.nombre} {recolector.apellido}
          </p>
          <p>
            <b>Estado:</b>{" "}
            <span
              className={`px-2 py-1 rounded ${
                recolector.estado === "En ruta"
                  ? "bg-blue-200 text-blue-800"
                  : recolector.estado === "Disponible"
                  ? "bg-green-200 text-green-800"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {recolector.estado}
            </span>
          </p>
          <p>
            <b>Rutas asignadas:</b> {recolector.rutas_asignadas}
          </p>

          <button
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            onClick={handleAsignarRuta}
          >
            Asignar esta ruta
          </button>

          {mensaje && <p className="mt-3 text-sm text-gray-700">{mensaje}</p>}
        </>
      ) : (
        <p>No hay recolector asignado para esta ruta.</p>
      )}
    </div>
  );
}
