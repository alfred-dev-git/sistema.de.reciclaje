import ParadasPorRecolector from "../components/mapa/seguimiento-rutas";

export default function SeguimientoRutas() {
  return (
    <div className="rutas-page">
      <h2 className="titulo">Seguimiento Rutas</h2>
      <p>
        Estados de recolectores y rutas en tiempo real.
      </p>
      <div className="w-full h-[80vh] border rounded-lg overflow-hidden">
        <ParadasPorRecolector />
      </div>
    </div>
  );
}
