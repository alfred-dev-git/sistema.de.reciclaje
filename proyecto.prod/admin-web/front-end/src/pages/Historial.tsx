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

export default function Historial() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [pm, setPm] = useState<PM[]>([]);
  const [pt, setPt] = useState<PT[]>([]);
  const [mes, setMes] = useState('');
  // función utilitaria para mostrar el estado
  const getEstadoTexto = (estado: string | number | null) => {
    if (estado === null || estado === undefined) return "-";

    const v = Number(estado);

    if (v === 0) return "Pendiente";
    if (v === 1) return "Éxito";
    if (v === 2) return "Cancelado";

    return estado; // fallback
  };

  useEffect(() => {
    http.get('/historial').then(r => setRows(r.data));
    http.get('/stats/por-mes').then(r => setPm(r.data));
    http.get('/stats/por-tipo').then(r => setPt(r.data));
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

  // COLORES DEL PIE CHART (del archivo viejo)
  const colors = ["#4CAF50", "#FF9800", "#b3c1ccff", "#a374acff", "#f77066ff"];

  return (
    <div className="historial">
      <Card title="Historial de pedidos">
        <div className="filter">
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

        <div className="table-wrap">
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
              {filtered.map((r, i) => (
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
      </Card>

      <div className="charts">
        {/* ---- BARCHART (con estilos del viejo) ---- */}
        <Card title="Pedidos por mes (últimos 12)">
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
                  name="Total pedidos"
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
