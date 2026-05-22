import { useEffect, useState } from 'react';
import { api } from '../services/api';

// VIZ #1 — Hourly order volume timeline (per brand/kitchen)
// Renders pure SVG bar+line chart, no chart library.
export default function HourlyOrderVolumeTimeline() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true); setErr(null);
    api.get(`/api/custom-views/hourly-order-volume?days=${days}`)
      .then(r => { if (!cancel) { setData(r); setLoading(false); } })
      .catch(e => { if (!cancel) { setErr(e.message); setLoading(false); } });
    return () => { cancel = true; };
  }, [days]);

  if (loading) return <div className="card" style={{ padding: 24 }}>Loading hourly timeline…</div>;
  if (err) return <div className="card" style={{ padding: 24, color: '#b00' }}>Error: {err}</div>;

  const hourTotals = data?.hour_totals || [];
  const maxTotal = Math.max(1, ...hourTotals.map(h => h.total));
  const W = 880, H = 240, pad = 32;
  const barW = (W - pad * 2) / 24 - 4;

  // group rows by brand for stacked legend list
  const brands = Array.from(new Set((data?.rows || []).map(r => r.brand)));

  return (
    <div className="card" style={{ padding: 20 }} data-testid="viz-hourly-timeline">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Hourly Order Volume — last {data?.window_days} day(s)</h3>
        <select className="form-control" style={{ width: 140 }} value={days} onChange={e => setDays(parseInt(e.target.value))}>
          <option value={1}>Last 24 hours</option>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>
      <svg width={W} height={H} role="img" aria-label="hourly order volume">
        {/* axis baseline */}
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#999" />
        {hourTotals.map((h, i) => {
          const x = pad + i * ((W - pad * 2) / 24);
          const barH = (h.total / maxTotal) * (H - pad * 2);
          const y = H - pad - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} fill="#5b8def" rx="2">
                <title>{`${h.hour}:00 — ${h.total} orders`}</title>
              </rect>
              {i % 3 === 0 && (
                <text x={x + barW / 2} y={H - pad + 14} fontSize="10" textAnchor="middle" fill="#666">
                  {String(h.hour).padStart(2, '0')}
                </text>
              )}
            </g>
          );
        })}
        {/* polyline overlay */}
        <polyline
          fill="none"
          stroke="#e85d75"
          strokeWidth="2"
          points={hourTotals.map((h, i) => {
            const x = pad + i * ((W - pad * 2) / 24) + barW / 2;
            const y = H - pad - (h.total / maxTotal) * (H - pad * 2);
            return `${x},${y}`;
          }).join(' ')}
        />
      </svg>
      <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
        Brands in window: <strong>{brands.length || 0}</strong> &middot;
        Peak hour total: <strong>{maxTotal}</strong> orders
      </div>
      {brands.length > 0 && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13 }}>Per brand/kitchen breakdown ({data?.rows?.length || 0} rows)</summary>
          <table className="data-table" style={{ marginTop: 8, fontSize: 12 }}>
            <thead><tr><th>Hour</th><th>Brand</th><th>Kitchen</th><th>Orders</th><th>Revenue</th><th>Avg Prep (min)</th></tr></thead>
            <tbody>
              {data.rows.map((r, i) => (
                <tr key={i}>
                  <td>{String(r.hour).padStart(2, '0')}:00</td>
                  <td>{r.brand}</td>
                  <td>{r.kitchen}</td>
                  <td>{r.order_count}</td>
                  <td>${Number(r.revenue).toFixed(2)}</td>
                  <td>{Number(r.avg_prep_min).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}
