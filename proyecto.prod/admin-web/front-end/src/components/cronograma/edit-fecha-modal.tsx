import React, { useEffect, useState } from "react";
import { getTiposReciclable } from "../../api/services/reciclables.service";

interface EditarFechaModalProps {
  visible: boolean;
  onCerrar: () => void;
  onGuardar: (data: any) => void;
  item: {
    idcronograma_recoleccion: number;
    dia_semana: number;
    semana_mes: number;
    hora_inicio: string;
    hora_fin: string;
    tipo_reciclable: string | number; // puede venir nombre o id
  };
}

export const EditarFechaModal: React.FC<EditarFechaModalProps> = ({
  visible,
  onCerrar,
  onGuardar,
  item,
}) => {
  const [form, setForm] = useState({
    dia_semana: item.dia_semana,
    semana_mes: item.semana_mes,
    hora_inicio: item.hora_inicio || "",
    hora_fin: item.hora_fin || "",
    tipo_reciclable_idtipo_reciclable: "", // se setea luego
  });

  const [tiposReciclable, setTiposReciclable] = useState<
    { idtipo_reciclable: number; descripcion: string }[]
  >([]);

  // 🔹 Carga los tipos de reciclable
  useEffect(() => {
    const fetchTipos = async () => {
      const res = await getTiposReciclable();
      if (res.success && res.data) {
        setTiposReciclable(res.data);
      } else {
        console.error("Error al cargar tipos de reciclable");
      }
    };
    fetchTipos();
  }, []);

  // 🔹 Cuando cambia el item o la lista, sincroniza el valor correcto
  useEffect(() => {
    if (tiposReciclable.length === 0) return;

    let idTipo = item.tipo_reciclable;

    // Si vino con descripción, busca el ID correspondiente
    if (isNaN(Number(idTipo))) {
      const encontrado = tiposReciclable.find(
        (t) => t.descripcion === idTipo
      );
      idTipo = encontrado ? encontrado.idtipo_reciclable : "";
    }

    setForm({
      dia_semana: item.dia_semana,
      semana_mes: item.semana_mes,
      hora_inicio: item.hora_inicio || "",
      hora_fin: item.hora_fin || "",
      tipo_reciclable_idtipo_reciclable: idTipo ? String(idTipo) : "",
    });
  }, [item, tiposReciclable]);

  if (!visible) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = () => {
    const {
      dia_semana,
      semana_mes,
      hora_inicio,
      hora_fin,
      tipo_reciclable_idtipo_reciclable,
    } = form;

    onGuardar({
      dia_semana: Number(dia_semana),
      semana_mes: Number(semana_mes),
      hora_inicio,
      hora_fin,
      tipo_reciclable: Number(tipo_reciclable_idtipo_reciclable), // 👈 ahora siempre ID numérico
    });
    onCerrar();
  };

  const camposCompletos =
    form.hora_inicio.trim() !== "" &&
    form.hora_fin.trim() !== "" &&
    form.tipo_reciclable_idtipo_reciclable !== "" &&
    form.hora_fin > form.hora_inicio;

  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <h3>✏️ Editar fecha de recolección</h3>

        <label>Día de la semana:</label>
        <select
          name="dia_semana"
          value={String(form.dia_semana)}
          onChange={handleChange}
        >
          <option value="1">1 - Lunes</option>
          <option value="2">2 - Martes</option>
          <option value="3">3 - Miércoles</option>
          <option value="4">4 - Jueves</option>
          <option value="5">5 - Viernes</option>
          <option value="6">6 - Sábado</option>
          <option value="7">7 - Domingo</option>
        </select>

        <label>Semana del mes:</label>
        <select
          name="semana_mes"
          value={String(form.semana_mes)}
          onChange={handleChange}
        >
          <option value="1">1 - Primera</option>
          <option value="2">2 - Segunda</option>
          <option value="3">3 - Tercera</option>
          <option value="4">4 - Cuarta</option>
        </select>

        <label>Hora de inicio:</label>
        <input
          type="time"
          name="hora_inicio"
          value={form.hora_inicio}
          onChange={handleChange}
        />

        <label>Hora de fin:</label>
        <input
          type="time"
          name="hora_fin"
          value={form.hora_fin}
          onChange={handleChange}
          style={{
            borderColor:
              form.hora_fin && form.hora_fin <= form.hora_inicio ? "red" : "",
          }}
        />
        {form.hora_fin && form.hora_fin <= form.hora_inicio && (
          <small style={{ color: "red" }}>
            ⚠️ La hora de fin debe ser posterior a la de inicio
          </small>
        )}

        <label>Tipo de reciclable:</label>
        <select
          name="tipo_reciclable_idtipo_reciclable"
          value={String(form.tipo_reciclable_idtipo_reciclable)}
          onChange={handleChange}
        >
          <option value="">Seleccione un tipo...</option>
          {tiposReciclable.map((tipo) => (
            <option
              key={tipo.idtipo_reciclable}
              value={String(tipo.idtipo_reciclable)}
            >
              {tipo.descripcion}
            </option>
          ))}
        </select>

        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
          }}
        >
          <button
            onClick={handleGuardar}
            style={{
              ...btn("green"),
              opacity: camposCompletos ? 1 : 0.5,
              cursor: camposCompletos ? "pointer" : "not-allowed",
            }}
            disabled={!camposCompletos}
          >
            Guardar
          </button>
          <button onClick={onCerrar} style={btn("red")}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// 🎨 estilos
const btn = (color: string): React.CSSProperties => ({
  backgroundColor:
    color === "green"
      ? "#4CAF50"
      : color === "red"
      ? "#F44336"
      : "#ccc",
  color: "white",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  cursor: "pointer",
});

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContent: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "1.5rem",
  borderRadius: "12px",
  width: "320px",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
};
