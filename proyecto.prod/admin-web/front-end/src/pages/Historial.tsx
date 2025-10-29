import { useEffect, useMemo, useState } from 'react';
import { http } from '../api/http';
import Card from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Legend, ResponsiveContainer } from 'recharts';

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
};

type PM = { anio_mes: string; total: number };
type PT = { tipo: string; total: number };

export default function Historial() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [pm, setPm] = useState<PM[]>([]);
  const [pt, setPt] = useState<PT[]>([]);

  useEffect(() => {
    http.get('/historial').then(r => setRows(r.data));
    http.get('/stats/por-mes').then(r => setPm(r.data));
    http.get('/stats/por-tipo').then(r => setPt(r.data));
  }, []);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const QQ = q.toLowerCase();
    return rows.filter(r => r.usuario_nombre?.toLowerCase().startsWith(QQ));
  }, [q, rows]);

  return (
    <div className="historial">
      <Card title="Historial de pedidos">
        <div className="filter">
          <input
            placeholder='Filtrar por nombre de usuario... (ej: "A")'
            value={q}
            onChange={e => setQ(e.target.value)}
          />
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
                  <td>{r.estado ?? '-'}</td>
                  <td>{r.observaciones ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="charts">
        <Card title="Pedidos por mes (últimos 12)">
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={pm}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="anio_mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Distribución por tipo">
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pt} dataKey="total" nameKey="tipo" outerRadius={100} label />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
