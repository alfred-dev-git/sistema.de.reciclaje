import { useEffect, useMemo, useState } from 'react';
import { http } from '../api/http';
import Card from '../components/Card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';

type Row = {
  iddetalle_pedido: number | null;
  idpedidos: number;
  fecha_emision: string;
  fecha_entrega: string | null;
  cant_bolson: number | null;
  estado: string | null;
  observaciones: string | null;
  usuario_idusuario: number;
  usuario_nombre: string;
  tipo_reciclable: string | null;
  recolector_nombre: string | null;
};

type PM = { anio_mes: string; total: number };
type PT = { tipo: string; total: number };
type RutaRow = { idrutas: number; fecha_programada: string; recolector: string; tipo_reciclable: string; total_solicitudes: number; estados: string };
const REGISTROS_POR_PAGINA = 20;

export default function Historial() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [pm, setPm] = useState<PM[]>([]);
  const [pt, setPt] = useState<PT[]>([]);
  const [mes, setMes] = useState('');
  const [pagina, setPagina] = useState(1);
  const [vista, setVista] = useState<'solicitudes' | 'rutas'>('solicitudes');
  const [rutas, setRutas] = useState<RutaRow[]>([]);
  const [paginaRutas, setPaginaRutas] = useState(1);
  // función utilitaria para mostrar el estado
  const getEstadoTexto = (estado: string | number | null) => {
    if (estado === null || estado === undefined) return "-";

    return String(estado);
  };

  useEffect(() => {
    http.get('/historial').then(r => setRows(r.data));
    http.get('/stats/por-mes').then(r => setPm(r.data));
    http.get('/stats/por-tipo').then(r => setPt(r.data));
    http.get('/rutas/historial').then(r => setRutas(r.data));
  }, []);

  const filtered = useMemo(() => {
    let data = rows;

    // filtro por nombre
    if (q) {
      const QQ = q.toLowerCase();
      data = data.filter(r => r.usuario_nombre?.toLowerCase().startsWith(QQ));
    }

    // filtro por mes
    if (mes) {
      data = data.filter(r => {
        const m = new Date(r.fecha_emision).getMonth() + 1;
        const mm = m.toString().padStart(2, '0');
        return mm === mes;
      });
    }

    return data;
  }, [q, mes, rows]);

  const totalPaginas = Math.ceil(filtered.length / REGISTROS_POR_PAGINA);
  const filasVisibles = filtered.slice(
    (pagina - 1) * REGISTROS_POR_PAGINA,
    pagina * REGISTROS_POR_PAGINA
  );
  const totalPaginasRutas = Math.ceil(rutas.length / REGISTROS_POR_PAGINA);
  const rutasVisibles = rutas.slice((paginaRutas - 1) * REGISTROS_POR_PAGINA, paginaRutas * REGISTROS_POR_PAGINA);

  useEffect(() => {
    setPagina(1);
  }, [q, mes]);

  useEffect(() => {
    if (totalPaginas > 0 && pagina > totalPaginas) setPagina(totalPaginas);
  }, [pagina, totalPaginas]);

  // COLORES DEL PIE CHART (del archivo viejo)
  const colors = ["#4CAF50", "#FF9800", "#b3c1ccff", "#a374acff", "#f77066ff"];

  return (
    <div className="historial">
      <Card title="Estadísticas de recolecciones">
        <button className="button button-ruta" onClick={() => setVista(vista === 'solicitudes' ? 'rutas' : 'solicitudes')}>
          {vista === 'solicitudes' ? 'Ver rutas asignadas por recolector' : 'Ver historial de solicitudes'}
        </button>
        <div className="filter" style={{ display: vista === 'solicitudes' ? undefined : 'none' }}>
          <input
            placeholder='Filtrar por nombre de usuario... (ej: "A")'
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <select value={mes} onChange={e => setMes(e.target.value)}>
            <option value="">Todos los meses</option>
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
            <option value="04">Abril</option>
            <option value="05">Mayo</option>
            <option value="06">Junio</option>
            <option value="07">Julio</option>
            <option value="08">Agosto</option>
            <option value="09">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>

        {vista === 'rutas' && <div className="table-wrap"><table><thead><tr><th>Ruta</th><th>Fecha programada</th><th>Recolector</th><th>Tipo</th><th>Solicitudes</th><th>Estados</th></tr></thead><tbody>
          {rutasVisibles.map(r => <tr key={r.idrutas}><td>#{r.idrutas}</td><td>{new Date(r.fecha_programada).toLocaleString('es-AR')}</td><td>{r.recolector}</td><td>{r.tipo_reciclable}</td><td>{r.total_solicitudes}</td><td>{r.estados || '-'}</td></tr>)}
        </tbody></table></div>}
        {vista === 'rutas' && totalPaginasRutas > 1 && <div style={paginationStyles.container}>
          <button disabled={paginaRutas === 1} onClick={() => setPaginaRutas(p => p - 1)} style={paginationStyles.button}>&lt;</button>
          {Array.from({length: totalPaginasRutas}, (_, i) => i + 1).map(n => <button key={n} onClick={() => setPaginaRutas(n)} style={{...paginationStyles.button, ...(n === paginaRutas ? paginationStyles.active : {})}}>{n}</button>)}
          <button disabled={paginaRutas === totalPaginasRutas} onClick={() => setPaginaRutas(p => p + 1)} style={paginationStyles.button}>&gt;</button>
        </div>}
        <div className="table-wrap" style={{ display: vista === 'solicitudes' ? undefined : 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Fecha emisión</th>
                <th>Usuario</th>
                <th>Tipo</th>
                <th>Cant. bolsón</th>
                <th>Estado</th>
                <th>Recolector asignado</th>
                <th>Obs.</th>
              </tr>
            </thead>
            <tbody>
              {filasVisibles.map((r, i) => (
                <tr key={`${r.idpedidos}-${i}`}>
                  <td>{new Date(r.fecha_emision).toLocaleDateString()}</td>
                  <td>{r.usuario_nombre}</td>
                  <td>{r.tipo_reciclable ?? '-'}</td>
                  <td>{r.cant_bolson ?? '-'}</td>
                  <td>{getEstadoTexto(r.estado)}</td>
                  <td>{r.recolector_nombre ?? '-'}</td>
                  <td>{r.observaciones ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {vista === 'solicitudes' && totalPaginas > 1 && (
          <div style={paginationStyles.container}>
            <button
              type="button"
              disabled={pagina === 1}
              onClick={() => setPagina(actual => actual - 1)}
              style={{ ...paginationStyles.button, ...(pagina === 1 ? paginationStyles.disabled : {}) }}
            >
              &lt;
            </button>
            {Array.from({ length: totalPaginas }, (_, index) => index + 1).map(numero => (
              <button
                type="button"
                key={numero}
                onClick={() => setPagina(numero)}
                style={{
                  ...paginationStyles.button,
                  ...(pagina === numero ? paginationStyles.active : {}),
                }}
              >
                {numero}
              </button>
            ))}
            <button
              type="button"
              disabled={pagina === totalPaginas}
              onClick={() => setPagina(actual => actual + 1)}
              style={{ ...paginationStyles.button, ...(pagina === totalPaginas ? paginationStyles.disabled : {}) }}
            >
              &gt;
            </button>
          </div>
        )}
      </Card>

      <div className="charts">
        {/* ---- BARCHART (con estilos del viejo) ---- */}
        <Card title="Solicitudes por mes (últimos 12)">
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={pm}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="anio_mes"
                  stroke="#ffffffff"
                />
                <YAxis
                  stroke="#ffffffff"
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="total"
                  name="Total solicitudes"
                  fill="#abc337"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ---- PIECHART (con estilos del viejo) ---- */}
        <Card title="Distribución por tipo">
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pt}
                  dataKey="total"
                  nameKey="tipo"
                  outerRadius={100}
                  label
                >
                  {pt.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{ backgroundColor: "#2f5240", color: "#fff" }}
                />
                <Legend wrapperStyle={{ color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

const paginationStyles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 18 },
  button: {
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid #4f8b5f',
    background: '#fff',
    color: '#2f6940',
    fontWeight: 700,
    cursor: 'pointer',
  },
  active: { background: '#4f8b5f', color: '#fff' },
  disabled: { opacity: 0.35, cursor: 'default' },
};
