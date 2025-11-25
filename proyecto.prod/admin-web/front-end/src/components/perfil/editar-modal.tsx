import React, { useEffect, useState } from "react";
import { getMunicipios, Municipio } from "../../api/services/perfil.service";

type Props = {
  visible: boolean;
  field: string;
  value: string;
  onClose: () => void;
  onSave: (newValue: string) => void;
};

export default function EditarCampoModal({ visible, field, value, onClose, onSave }: Props) {
  const [input, setInput] = useState(value);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const editingMunicipio = field === "municipio";

  useEffect(() => {
    setInput(value);

    if (editingMunicipio) {
      getMunicipios().then((res) => {
        if (res.success && res.data) setMunicipios(res.data);
      });
    }
  }, [field, value]);

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Editar {field}</h3>

        {/* Campo normal */}
        {!editingMunicipio && (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        )}

        {/* SELECT de municipios */}
        {editingMunicipio && (
          <select value={input} onChange={(e) => setInput(e.target.value)}>
            <option value="">Seleccione un municipio</option>
            {municipios.map((m) => (
            <option key={m.idmunicipio} value={m.idmunicipio}>
            {m.descripcion}
            </option>
            ))}
          </select>
        )}

        <div className="buttons">
          <button className="btn-green" onClick={() => onSave(input)}>
            Guardar
          </button>
          <button className="btn-red" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
