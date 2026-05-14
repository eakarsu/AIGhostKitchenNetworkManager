// Shared fetch wrapper that injects the auth token from localStorage and handles
// JSON parsing + 401 redirect. Use this from every page instead of bare `fetch`.

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) || '';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json', ...authHeaders() } };
  if (body !== undefined && body !== null) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    throw new Error('Session expired');
  }
  let data = null;
  try { data = await res.json(); } catch (_) { /* ignore */ }
  if (!res.ok) {
    const err = new Error((data && (data.error || data.message)) || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};

// Custom non-CRUD feature endpoints (5 new per audit)
export const customAPI = {
  // 1. Platform webhook ingester (events listing requires auth)
  webhookEvents: () => api.get('/api/custom/platform-webhook/events'),
  // 2. Auto-PO
  autoPoGenerate: () => api.post('/api/custom/auto-po/generate'),
  autoPoList: () => api.get('/api/custom/auto-po/list'),
  // 3. Temperature anomaly watcher
  tempAnomalyScan: () => api.post('/api/custom/temp-anomaly/scan'),
  // 4. Demand-forecast scheduler
  forecastRun: () => api.post('/api/custom/forecast-scheduler/run'),
  forecastList: () => api.get('/api/custom/forecast-scheduler/list'),
  // 5. Margin guard
  marginGuardScan: () => api.post('/api/custom/margin-guard/scan'),
  marginOverrides: () => api.get('/api/custom/margin-guard/overrides'),
  // Misc
  aiHistory: () => api.get('/api/ai-history'),
};

export default api;
