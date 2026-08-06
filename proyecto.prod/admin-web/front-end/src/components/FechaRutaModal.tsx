import React, { useEffect, useState } from "react";

export default function FechaRutaModal({ mostrar, onCerrar, onConfirmar, titulo = "Programar ruta", valorInicial = "" }: {
  mostrar: boolean; onCerrar: () => void; onConfirmar: (fecha: string) => void; titulo?: string; valorInicial?: string;
}) {
  const [fecha, setFecha] = useState(valorInicial.slice(0, 10));
  const [hora, setHora] = useState(valorInicial.slice(11, 16) || "09:00");
  useEffect(() => {
    if (mostrar) {
      setFecha(valorInicial.slice(0, 10));
      setHora(valorInicial.slice(11, 16) || "09:00");
    }
  }, [mostrar, valorInicial]);
  if (!mostrar) return null;
  return <div className="modal"><div className="modal-fecha-ruta">
    <h3 className="subtitulo">{titulo}</h3>
    <label>Fecha de recolección<input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></label>
    <label>Hora<input type="time" value={hora} onChange={(e) => setHora(e.target.value)} /></label>
    <div className="acciones-ruta">
      <button className="button button-modal" onClick={onCerrar}>Cancelar</button>
      <button className="button button-ruta" disabled={!fecha || !hora} onClick={() => onConfirmar(`${fecha} ${hora}:00`)}>Confirmar</button>
    </div>
  </div></div>;
}
