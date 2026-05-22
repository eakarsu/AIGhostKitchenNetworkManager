import { useEffect, useState } from 'react';
import { api } from '../services/api';

// VIZ #2 — Brand x Kitchen performance heatmap
export default function BrandPerformanceHeatmap() {
  const [data, setData] = useState(null);
  const [metric, setMetric] = useState('revenue');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true); setErr(null);
    api.get(`/api/custom-views/brand-performance?metric=${metric}&days=${days}`)
      .then(r => { if (!cancel) { setData(r); setLoading(false); } })
      .catch(e => { if (!cancel) { setErr(e.message); setLoading(false); } });
    return () => { cancel = true; };
  }, [metric, days]);

  if (loading) return <div className="card" style={{ padding: 24 }}>Loading heatmap…</div>;
  if (err) return <div className="card" style={{ padding: 24, color: '#b00' }}>Error: {err}</div>;

  const { brands = [], kitchens = [], matrix = [], scale = { min: 0, max: 0 } } = data || {};
  const max = scale.max || 1;

  const colorFor = (v) => {
    if (!v) return '#f5f5f7';
    const t = Math.min(1, v / max);
    // gradient from cool to hot
    const r = Math.round(245 - 145 * t);
    const g = Math.round(245 - 175 * t);
    const b = Math.round(245 - 145 * t);
    return `rgb(${r},${g},${b})`;
  };

  const fmt = (v) => metric === 'orders' ? Math.round(v) : `$${Number(v).toFixed(2)}`;

  return (
    <div className="card" style={{ padding: 20 }} data-testid="viz-brand-heatmap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0 }}>Brand × Kitchen Heatmap ({metric}, last {data?.window_days}d)</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="form-control" style={{ width: 130 }} value={metric} onChange={e => setMetric(e.target.value)}>
            <option value="revenue">Revenue</option>
            <option value="orders">Orders</option>
            <option value="avg_ticket">Avg Ticket</option>
          </select>
          <select className="form-control" style={{ width: 110 }} value={days} onChange={e => setDays(parseInt(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
          </select>
        </div>
      </div>

      {brands.length === 0 || kitchens.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>No order data in this window.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 480 }}>
            <thead>
              <tr>
                <th>Brand \ Kitchen</th>
                {kitchens.map(k => <th key={k} style={{ fontSize: 11 }}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {matrix.map(row => (
                <tr key={row.brand}>
                  <td style={{ fontWeight: 600 }}>{row.brand}</td>
                  {row.cells.map((c, i) => (
                    <td key={i}
                        style={{ background: colorFor(c.value), textAlign: 'center', fontSize: 12, fontWeight: c.value === max && max > 0 ? 700 : 400 }}
                        title={`${row.brand} @ ${c.kitchen}\nOrders: ${c.detail.orders}\nRevenue: $${c.detail.revenue.toFixed(2)}\nAvg ticket: $${c.detail.avg_ticket.toFixed(2)}`}>
                      {fmt(c.value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#666' }}>
        <span>scale</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{fmt(scale.min || 0)}</span>
          <div style={{ width: 120, height: 10, background: `linear-gradient(to right, ${colorFor(scale.min)}, ${colorFor(max)})`, border: '1px solid #ddd' }} />
          <span>{fmt(max)}</span>
        </div>
      </div>
    </div>
  );
}
