import { useEffect, useState } from 'react';

/**
 * Apply pass 5 frontend: Customer Communications queue + templates.
 */

const API = '/api';
function getHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
async function http(method, path, body) {
  const res = await fetch(`${API}${path}`, { method, headers: getHeaders(), body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export default function CustomerComms() {
  const [tab, setTab] = useState('queue');
  return (
    <div style={{ padding: 24 }}>
      <h1>Customer Communications 📨</h1>
      <p>Queue order-status, promo, recovery, and feedback messages. Real sending requires Twilio/SendGrid creds.</p>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <button onClick={() => setTab('queue')}>Queue</button>
        <button onClick={() => setTab('templates')}>Templates</button>
      </div>
      {tab === 'queue' ? <Queue /> : <Templates />}
    </div>
  );
}

function Templates() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ key: '', channel: 'sms', intent: 'order_status', subject: '', body: '' });
  const [error, setError] = useState(null);
  const refresh = async () => { try { setList(await http('GET', '/customer-comms/templates')); } catch (err) { setError(err.message); } };
  useEffect(() => { refresh(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    try { await http('POST', '/customer-comms/templates', form); setForm({ key: '', channel: 'sms', intent: 'order_status', subject: '', body: '' }); refresh(); } catch (err) { setError(err.message); }
  };
  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        <input placeholder="key (unique)" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} required />
        <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
          <option>sms</option><option>email</option><option>push</option><option>in_app</option>
        </select>
        <select value={form.intent} onChange={(e) => setForm({ ...form, intent: e.target.value })}>
          <option>order_status</option><option>order_ready</option><option>promo</option><option>feedback_request</option><option>apology</option><option>recovery</option>
        </select>
        <input placeholder="subject (email)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={{ gridColumn: '1 / -1' }} />
        <textarea placeholder="body — supports {{var}} interpolation" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} style={{ gridColumn: '1 / -1' }} required />
        <button type="submit" style={{ gridColumn: '1 / -1' }}>Save</button>
      </form>
      <ul>{list.map((t) => <li key={t.id}><strong>{t.key}</strong> · {t.channel} · {t.intent}<br /><em>{t.subject || ''}</em><pre>{t.body}</pre></li>)}</ul>
    </div>
  );
}

function Queue() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ to_address: '', channel: 'sms', intent: 'order_status', body: '', template_key: '', vars: '{}' });
  const [error, setError] = useState(null);
  const refresh = async () => { try { setList(await http('GET', '/customer-comms/queue')); } catch (err) { setError(err.message); } };
  useEffect(() => { refresh(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form, vars: JSON.parse(form.vars || '{}') };
      if (!body.template_key) delete body.template_key;
      await http('POST', '/customer-comms/queue', body);
      setForm({ to_address: '', channel: 'sms', intent: 'order_status', body: '', template_key: '', vars: '{}' });
      refresh();
    } catch (err) { setError(err.message); }
  };
  const transition = async (id, status) => {
    try { await http('POST', `/customer-comms/queue/${id}/transition`, { status }); refresh(); } catch (err) { setError(err.message); }
  };
  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        <input placeholder="to (phone or email)" value={form.to_address} onChange={(e) => setForm({ ...form, to_address: e.target.value })} required />
        <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
          <option>sms</option><option>email</option><option>push</option><option>in_app</option>
        </select>
        <select value={form.intent} onChange={(e) => setForm({ ...form, intent: e.target.value })}>
          <option>order_status</option><option>order_ready</option><option>promo</option><option>feedback_request</option><option>apology</option><option>recovery</option>
        </select>
        <input placeholder="template_key (optional)" value={form.template_key} onChange={(e) => setForm({ ...form, template_key: e.target.value })} />
        <textarea placeholder="vars JSON" value={form.vars} onChange={(e) => setForm({ ...form, vars: e.target.value })} />
        <textarea placeholder="body (or fill from template)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <button type="submit" style={{ gridColumn: '1 / -1' }}>Queue message</button>
      </form>
      <ul>{list.map((m) => (
        <li key={m.id} style={{ marginBottom: 8 }}>
          <strong>#{m.id}</strong> · {m.channel} · {m.intent} → {m.to_address} · <em>{m.status}</em> (attempts {m.attempts})
          <div><pre>{m.body}</pre></div>
          <button onClick={() => transition(m.id, 'sent')}>Mark sent</button>{' '}
          <button onClick={() => transition(m.id, 'cancelled')}>Cancel</button>
        </li>
      ))}</ul>
    </div>
  );
}
