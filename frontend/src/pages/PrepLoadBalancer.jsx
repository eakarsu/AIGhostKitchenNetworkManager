import { useState } from 'react';

export default function PrepLoadBalancer() {
  const [payload, setPayload] = useState('{"stations":["wok","grill","expo"],"orders":[{"id":"DD-102","brand":"Noodle Lab","prep_minutes":11},{"id":"UE-77","brand":"Burger Box","prep_minutes":9},{"id":"GH-5","brand":"Noodle Lab","prep_minutes":14}]}');
  const [result, setResult] = useState(null);
  const run = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/prep-load-balancer/plan', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(JSON.parse(payload || '{}')) });
    setResult(await res.json());
  };
  return <div><h1>Prep Load Balancer</h1><textarea rows={8} value={payload} onChange={(e) => setPayload(e.target.value)} /><button onClick={run}>Balance Load</button>{result && <pre>{JSON.stringify(result, null, 2)}</pre>}</div>;
}
