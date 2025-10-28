import React, { useEffect, useState } from "react";
import { getCantRutas } from "../api/services/recolector.service";

export interface RutasPendientesItem {
  idrecolector: number;
  recolector: string;
  telefono: string;
  rutas_pendientes: number;
}

interface ModalRecolectorProps {
  mostrar: boolean;
  onCerrar: () => void;
  onConfirmar: (recolector: RutasPendientesItem) => void;
}

export default function ModalRecolector({
  mostrar,
  onCerrar,
  onConfirmar,
}: ModalRecolectorProps) {
  const [recolectores, setRecolectores] = useState<RutasPendientesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recolectorElegido, setRecolectorElegido] =
    useState<RutasPendientesItem | null>(null);

  useEffect(() => {
    if (mostrar) {
      async function cargarRecolectores() {
        try {
          const result = await getCantRutas();
          if (result.success && result.data) {
            setRecolectores(result.data);
          } else {
            console.error(result.message);
          }
        } catch (err) {
          console.error("❌ Error cargando recolectores:", err);
        } finally {
          setLoading(false);
        }
      }
      cargarRecolectores();
    }
  }, [mostrar]);

  if (!mostrar) return null;

  return (
    <div className="modal">
      <div>
        <h3 className="subtitulo">Asignar Ruta</h3>

        {loading ? (
          <p>Cargando recolectores...</p>
        ) : (
          <>
            <p className="text-sm mb-3 text-gray-600">
              Selecciona un recolector disponible:
            </p>

            <ul className="max-h-60 overflow-y-auto border rounded p-2 mb-3">
              {recolectores.map((r, i) => (
                <li key={i} className="flex justify-between items-center py-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recolector"
                      value={r.recolector}
                      checked={recolectorElegido?.recolector === r.recolector}
                      onChange={() => setRecolectorElegido(r)}
                    />
                    <span>
                      {r.recolector} ({r.telefono || "Sin teléfono"}){" "}
                      <span className="text-blue-600 text-sm">
                        {r.rutas_pendientes} rutas pendientes
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            <div className="flex justify-end gap-3">
              <button
                className="button button-modal"
                onClick={onCerrar}
              >
                Cancelar
              </button>
              <button
                className="button button-modal"
                disabled={!recolectorElegido}
                onClick={() =>
                  recolectorElegido && onConfirmar(recolectorElegido)
                }
              >
                Confirmar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
