import { useEffect, useState } from 'react';
import { api } from '../services/api';

const PLATFORMS = ['doordash', 'ubereats', 'grubhub', 'direct', 'postmates'];
const RULE_TYPES = ['markup', 'discount', 'fixed', 'min_floor', 'max_cap'];

// NON-VIZ #2 — Pricing rules CRUD per platform/brand
export default function PricingRulesEditor() {
  const [rules, setRules] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filterPlatform, setFilterPlatform] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const qs = filterPlatform ? `?platform=${filterPlatform}` : '';
      const r = await api.get(`/api/custom-views/pricing-rules${qs}`);
      setRules(r.data || []);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filterPlatform]);
  useEffect(() => {
    api.get('/api/brands').then(d => setBrands(Array.isArray(d) ? d : (d?.data || []))).catch(() => {});
  }, []);

  const startNew = () => {
    setEditing('new');
    setDraft({
      platform: 'doordash', brand_id: null, brand_name: 'All Brands',
      rule_type: 'markup', target: 'all-items',
      adjustment_pct: 10, min_price: 5.99, max_price: 49.99, active: true, notes: '',
    });
  };

  const startEdit = (rule) => {
    setEditing(rule.id);
    setDraft({ ...rule });
  };

  const cancel = () => { setEditing(null); setDraft(null); };

  const save = async () => {
    try {
      if (editing === 'new') {
        await api.post('/api/custom-views/pricing-rules', draft);
      } else {
        await api.put(`/api/custom-views/pricing-rules/${editing}`, draft);
      }
      cancel();
      load();
    } catch (e) { setError(e.message); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this pricing rule?')) return;
    try {
      await api.delete(`/api/custom-views/pricing-rules/${id}`);
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="card" style={{ padding: 20 }} data-testid="nonviz-pricing-rules">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Menu Pricing Rules</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="form-control" style={{ width: 160 }} value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
            <option value="">All platforms</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="btn btn-primary" onClick={startNew}>+ New Rule</button>
        </div>
      </div>

      {error && <div style={{ color: '#b00', marginBottom: 8 }}>Error: {error}</div>}
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>Loading…</div>
      ) : rules.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>No pricing rules. Create one.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Platform</th><th>Brand</th><th>Type</th><th>Target</th>
              <th>Adj %</th><th>Min $</th><th>Max $</th><th>Active</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id}>
                <td><span className="badge">{r.platform}</span></td>
                <td>{r.brand_name || '—'}</td>
                <td>{r.rule_type}</td>
                <td>{r.target || '—'}</td>
                <td>{r.adjustment_pct ?? 0}%</td>
                <td>{r.min_price ? `$${Number(r.min_price).toFixed(2)}` : '—'}</td>
                <td>{r.max_price ? `$${Number(r.max_price).toFixed(2)}` : '—'}</td>
                <td>{r.active ? '✓' : '✗'}</td>
                <td>
                  <button className="btn btn-secondary" style={{ marginRight: 6 }} onClick={() => startEdit(r)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && draft && (
        <div className="modal-overlay" onClick={cancel}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing === 'new' ? 'New Pricing Rule' : `Edit Rule #${editing}`}</h2>
              <button className="modal-close" onClick={cancel}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Platform</label>
                <select className="form-control" value={draft.platform || ''} onChange={e => setDraft({ ...draft, platform: e.target.value })}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Brand</label>
                <select className="form-control" value={draft.brand_id ?? ''}
                  onChange={e => {
                    const id = e.target.value ? parseInt(e.target.value) : null;
                    const b = brands.find(x => x.id === id);
                    setDraft({ ...draft, brand_id: id, brand_name: b ? b.name : 'All Brands' });
                  }}>
                  <option value="">All Brands</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Rule Type</label>
                <select className="form-control" value={draft.rule_type || 'markup'} onChange={e => setDraft({ ...draft, rule_type: e.target.value })}>
                  {RULE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Target (e.g. all-items, combos, sku:1234)</label>
                <input className="form-control" value={draft.target || ''} onChange={e => setDraft({ ...draft, target: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Adjustment %</label>
                  <input type="number" step="0.01" className="form-control" value={draft.adjustment_pct ?? 0}
                    onChange={e => setDraft({ ...draft, adjustment_pct: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Min $</label>
                  <input type="number" step="0.01" className="form-control" value={draft.min_price ?? ''}
                    onChange={e => setDraft({ ...draft, min_price: e.target.value === '' ? null : parseFloat(e.target.value) })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Max $</label>
                  <input type="number" step="0.01" className="form-control" value={draft.max_price ?? ''}
                    onChange={e => setDraft({ ...draft, max_price: e.target.value === '' ? null : parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label><input type="checkbox" checked={!!draft.active} onChange={e => setDraft({ ...draft, active: e.target.checked })} /> Active</label>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-control" rows={2} value={draft.notes || ''} onChange={e => setDraft({ ...draft, notes: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cancel}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editing === 'new' ? 'Create' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
