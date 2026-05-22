import { useState } from 'react';

function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// NON-VIZ #1 — Prep sheet PDF download
export default function PrepSheetPDF() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const downloadPdf = async () => {
    setBusy(true); setStatus(null);
    try {
      const res = await fetch(`/api/custom-views/prep-sheet/${date}`, { headers: { ...authHeaders() } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prep-sheet-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus(`Downloaded prep-sheet-${date}.pdf (${blob.size} bytes)`);
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
    setBusy(false);
  };

  const previewPdf = async () => {
    setBusy(true); setStatus(null);
    try {
      const res = await fetch(`/api/custom-views/prep-sheet/${date}`, { headers: { ...authHeaders() } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setStatus(`Opened preview for ${date}`);
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
    setBusy(false);
  };

  return (
    <div className="card" style={{ padding: 20 }} data-testid="nonviz-prep-sheet">
      <h3 style={{ marginTop: 0 }}>Prep Sheet PDF Generator</h3>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>
        Generates a kitchen prep sheet (PDF) tallying line items per brand and station for the selected date.
      </p>
      <div className="form-group" style={{ marginBottom: 12 }}>
        <label>Service Date</label>
        <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" onClick={downloadPdf} disabled={busy}>
          {busy ? 'Working…' : '⬇ Download PDF'}
        </button>
        <button className="btn btn-secondary" onClick={previewPdf} disabled={busy}>
          👁 Open in new tab
        </button>
      </div>
      {status && (
        <div style={{ marginTop: 12, padding: 10, background: '#f0f4ff', borderRadius: 6, fontSize: 13 }}>
          {status}
        </div>
      )}
    </div>
  );
}
