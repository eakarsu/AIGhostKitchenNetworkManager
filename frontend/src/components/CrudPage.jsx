import { useState, useEffect } from 'react';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function CrudPage({ title, icon, apiPath, columns, formFields, subtitle }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await fetch(apiPath, { headers: { ...authHeaders() } });
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : (data?.data || []));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [apiPath]);

  const openNew = () => {
    setEditItem(null);
    const init = {};
    formFields.forEach(f => { init[f.key] = f.default || ''; });
    setFormData(init);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    const init = {};
    formFields.forEach(f => {
      let val = item[f.key];
      if (f.type === 'date' && val) val = val.split('T')[0];
      init[f.key] = val ?? '';
    });
    setFormData(init);
    setShowForm(true);
    setSelected(null);
  };

  const handleSave = async () => {
    try {
      const method = editItem ? 'PUT' : 'POST';
      const url = editItem ? `${apiPath}/${editItem.id}` : apiPath;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        fetchItems();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetch(`${apiPath}/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
      setSelected(null);
      fetchItems();
    } catch (e) { console.error(e); }
  };

  const formatValue = (val, col) => {
    if (val === null || val === undefined) return '—';
    if (col.type === 'badge') {
      const cls = `badge badge-${String(val).toLowerCase().replace(/\s/g, '_')}`;
      return <span className={cls}>{val}</span>;
    }
    if (col.type === 'currency') return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    if (col.type === 'date') return val ? new Date(val).toLocaleDateString() : '—';
    if (col.type === 'boolean') return val ? '✅ Yes' : '❌ No';
    if (col.type === 'number') return Number(val).toLocaleString();
    if (col.type === 'percent') return `${val}%`;
    if (typeof val === 'string' && val.length > 50) return val.substring(0, 50) + '...';
    return String(val);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{icon} {title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New {title.replace(/s$/, '')}</button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#888' }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#888' }}>No items found. Add your first {title.toLowerCase()}.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(col => <th key={col.key}>{col.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} onClick={() => setSelected(item)}>
                  {columns.map(col => (
                    <td key={col.key}>{formatValue(item[col.key], col)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{icon} {selected.name || selected.employee_name || selected.order_number || selected.area || selected.item_name || `#${selected.id}`}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                {Object.entries(selected).filter(([k]) => k !== 'id').map(([key, val]) => (
                  <div key={key} className="detail-item">
                    <div className="detail-label">{key.replace(/_/g, ' ')}</div>
                    <div className="detail-value">
                      {val === null || val === undefined ? '—' :
                       typeof val === 'boolean' ? (val ? 'Yes' : 'No') :
                       String(val).length > 200 ? String(val).substring(0, 200) + '...' : String(val)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => openEdit(selected)}>✏️ Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>🗑️ Delete</button>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? 'Edit' : 'New'} {title.replace(/s$/, '')}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="modal-body">
              {formFields.map(field => (
                <div key={field.key} className="form-group">
                  <label>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder || ''}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      className="form-control"
                      value={formData[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    >
                      <option value="">Select...</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      className="form-control"
                      value={formData[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder || ''}
                      step={field.type === 'number' ? '0.01' : undefined}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
