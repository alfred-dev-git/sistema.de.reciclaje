import "./perfil.css";

export default function PerfilModal({ visible, onClose, perfil, onEditField }: any) {

  if (!visible) return null;

  return (

    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Datos del administrador</h2>

        <p>
          <strong>Nombre:</strong> {perfil.nombre} {perfil.apellido}
        </p>

        <p className="campo-editable">
          <strong>Email:</strong> {perfil.email}
          <button className="edit-btn" onClick={() => onEditField("email")}>✏️</button>
        </p>

        <p className="campo-editable">
          <strong>Teléfono:</strong> {perfil.telefono}
          <button className="edit-btn" onClick={() => onEditField("telefono")}>✏️</button>
        </p>

        <p>
          <strong>DNI:</strong> {perfil.dni}
        </p>

        <p>
          <strong>Municipio:</strong> {perfil.municipio}
        </p>

        <button className="close-btn" onClick={onClose}>Cerrar</button>
      </div>
    </div>

  );
}
