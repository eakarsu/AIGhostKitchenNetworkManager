import { useEffect, useState } from 'react';
import { customAPI } from '../services/api';

/*
 * CustomFeatures — UI for the 5 new custom non-CRUD endpoints added per audit:
 *   1. Platform Webhook Ingester  (GET /api/custom/platform-webhook/events)
 *   2. Auto-PO Generation         (POST /api/custom/auto-po/generate, GET /list)
 *   3. Temperature Anomaly Watcher (POST /api/custom/temp-anomaly/scan)
 *   4. Demand Forecast Scheduler  (POST /api/custom/forecast-scheduler/run, GET /list)
 *   5. Platform-fee Margin Guard  (POST /api/custom/margin-guard/scan, GET /overrides)
 */
export default function CustomFeatures() {
  const [tab, setTab] = useState('webhooks');
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚡ Operations Automations</h1>
          <p className="page-subtitle">Five AI-driven workflows that operate on live data.</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          ['webhooks', '🪝 Platform Webhooks'],
          ['autopo', '📦 Auto-PO'],
          ['temp', '🌡️ Temp Anomaly'],
          ['forecast', '📈 Demand Forecast'],
          ['margin', '💲 Margin Guard'],
        ].map(([k, label]) => (
          <button
            key={k}
            className={`btn ${tab === k ? 'btn-primary' : ''}`}
            onClick={() => setTab(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'webhooks' && <WebhookEvents />}
      {tab === 'autopo' && <AutoPO />}
      {tab === 'temp' && <TempAnomaly />}
      {tab === 'forecast' && <Forecasts />}
      {tab === 'margin' && <MarginGuard />}
    </div>
  );
}

function WebhookEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const refresh = async () => {
    setLoading(true);
    try { const r = await customAPI.webhookEvents(); setEvents(r.data || []); }
    catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  return (
    <div className="card">
      <h3>Platform Webhook Events</h3>
      <p className="text-muted">DoorDash/UberEats/Grubhub webhooks POST to <code>/api/custom/platform-webhook/:platform</code> (no auth). Each event is normalized into orders and AI-routed to a kitchen station.</p>
      <button className="btn" onClick={refresh} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
      <table className="data-table" style={{ marginTop: 16 }}>
        <thead><tr><th>Platform</th><th>External Order</th><th>Normalized Order</th><th>Routing</th><th>Received</th></tr></thead>
        <tbody>
          {events.map(e => (
            <tr key={e.id}>
              <td>{e.platform}</td>
              <td>{e.external_order_id || '—'}</td>
              <td>{e.normalized_order_id || '—'}</td>
              <td><pre style={{ fontSize: 11, maxWidth: 320, maxHeight: 80, overflow: 'auto' }}>{JSON.stringify(e.ai_routing)}</pre></td>
              <td>{new Date(e.received_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AutoPO() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const refresh = async () => { try { const r = await customAPI.autoPoList(); setList(r.data || []); } catch (_) {} };
  useEffect(() => { refresh(); }, []);

  const generate = async () => {
    setLoading(true);
    try { const r = await customAPI.autoPoGenerate(); alert(`Created ${r.created_pos} purchase order(s)`); await refresh(); }
    catch (e) { alert(e.message); }
    setLoading(false);
  };

  return (
    <div className="card">
      <h3>Auto-PO Generation</h3>
      <p className="text-muted">Reads low-stock items, asks AI to group recommendations by supplier, persists into <code>purchase_orders</code> + <code>purchase_order_items</code> as <code>pending_approval</code>.</p>
      <button className="btn btn-primary" onClick={generate} disabled={loading}>{loading ? 'Generating...' : 'Generate POs from Low Stock'}</button>
      <h4 style={{ marginTop: 24 }}>Recent Purchase Orders</h4>
      <table className="data-table">
        <thead><tr><th>Supplier</th><th>Status</th><th>Total Est.</th><th>Items</th><th>Created</th></tr></thead>
        <tbody>
          {list.map(po => (
            <tr key={po.id}>
              <td>{po.supplier}</td>
              <td>{po.status}</td>
              <td>${parseFloat(po.total_estimated || 0).toFixed(2)}</td>
              <td><pre style={{ fontSize: 11, maxHeight: 80, overflow: 'auto' }}>{JSON.stringify(po.items)}</pre></td>
              <td>{new Date(po.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TempAnomaly() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const scan = async () => {
    setLoading(true);
    try { const r = await customAPI.tempAnomalyScan(); setResult(r); }
    catch (e) { alert(e.message); }
    setLoading(false);
  };
  return (
    <div className="card">
      <h3>Temperature Anomaly Watcher</h3>
      <p className="text-muted">Scans the last 24h of <code>temperature_logs</code> for HACCP excursions; AI summarizes incidents and opens <code>quality_control</code> rows where needed.</p>
      <button className="btn btn-primary" onClick={scan} disabled={loading}>{loading ? 'Scanning...' : 'Scan Now'}</button>
      {result && (
        <pre style={{ marginTop: 16, background: '#f5f5f5', padding: 12, borderRadius: 6, fontSize: 12, maxHeight: 400, overflow: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}

function Forecasts() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const refresh = async () => { try { const r = await customAPI.forecastList(); setList(r.data || []); } catch (_) {} };
  useEffect(() => { refresh(); }, []);
  const run = async () => {
    setLoading(true);
    try { const r = await customAPI.forecastRun(); alert(`Forecasted ${r.brands_forecasted} brand(s)`); await refresh(); }
    catch (e) { alert(e.message); }
    setLoading(false);
  };
  return (
    <div className="card">
      <h3>Demand Forecast Scheduler</h3>
      <p className="text-muted">Runs <code>/demand-forecast</code> per brand using the last 30 days of orders, persists into <code>forecasts</code>, flags days where projected demand exceeds station capacity.</p>
      <button className="btn btn-primary" onClick={run} disabled={loading}>{loading ? 'Running...' : 'Run Forecast'}</button>
      <h4 style={{ marginTop: 24 }}>Upcoming Forecasts</h4>
      <table className="data-table">
        <thead><tr><th>Brand</th><th>Date</th><th>Projected Orders</th><th>Projected Revenue</th><th>Capacity Warning</th></tr></thead>
        <tbody>
          {list.map(f => (
            <tr key={f.id}>
              <td>{f.brand_name}</td>
              <td>{f.forecast_date}</td>
              <td>{f.projected_orders}</td>
              <td>${parseFloat(f.projected_revenue || 0).toFixed(2)}</td>
              <td>{f.capacity_warning ? '⚠️' : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarginGuard() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const refresh = async () => { try { const r = await customAPI.marginOverrides(); setList(r.data || []); } catch (_) {} };
  useEffect(() => { refresh(); }, []);
  const scan = async () => {
    setLoading(true);
    try { const r = await customAPI.marginGuardScan(); alert(`Flagged ${r.inserted} item(s)`); await refresh(); }
    catch (e) { alert(e.message); }
    setLoading(false);
  };
  return (
    <div className="card">
      <h3>Platform-Fee Margin Guard</h3>
      <p className="text-muted">Joins recent orders + platform fees + food costs; AI flags products that go negative-margin on a specific platform and proposes platform-specific price overrides.</p>
      <button className="btn btn-primary" onClick={scan} disabled={loading}>{loading ? 'Scanning...' : 'Scan Margins'}</button>
      <h4 style={{ marginTop: 24 }}>Recommended Price Overrides</h4>
      <table className="data-table">
        <thead><tr><th>Product</th><th>Platform</th><th>Original</th><th>Recommended</th><th>Reasoning</th></tr></thead>
        <tbody>
          {list.map(o => (
            <tr key={o.id}>
              <td>{o.product_name}</td>
              <td>{o.platform}</td>
              <td>${o.original_price}</td>
              <td><strong>${o.recommended_price}</strong></td>
              <td>{o.ai_reasoning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
