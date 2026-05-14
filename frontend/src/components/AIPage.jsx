import { useState } from 'react';

function formatAIContent(text) {
  if (!text) return null;

  // Convert markdown-like content to HTML
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null;

  const flushList = () => {
    if (listItems.length > 0) {
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(<Tag key={elements.length}>{listItems.map((li, i) => <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(li) }} />)}</Tag>);
      listItems = [];
      listType = null;
    }
  };

  const formatInline = (line) => {
    return line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:13px">$1</code>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      flushList();
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      flushList();
      elements.push(<h4 key={elements.length} style={{ fontSize: '14px', fontWeight: 700, color: '#533483', margin: '16px 0 6px' }}>{line.slice(4)}</h4>);
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(<h3 key={elements.length}>{line.slice(3)}</h3>);
    } else if (line.startsWith('# ')) {
      flushList();
      elements.push(<h3 key={elements.length}>{line.slice(2)}</h3>);
    } else if (line.match(/^\d+\.\s/)) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(line.replace(/^\d+\.\s/, ''));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(line.slice(2));
    } else if (line.startsWith('---') || line.startsWith('***')) {
      flushList();
      elements.push(<hr key={elements.length} style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />);
    } else {
      flushList();
      elements.push(<p key={elements.length} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />);
    }
  }
  flushList();

  return elements;
}

export default function AIPage({ title, icon, endpoint, fields, subtitle }) {
  const [formData, setFormData] = useState(() => {
    const init = {};
    fields.forEach(f => { init[f.key] = f.default || ''; });
    return init;
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ai/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.result);
      } else {
        setError(data.error || 'AI analysis failed');
      }
    } catch (e) {
      setError('Failed to connect to AI service');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{icon} {title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#888', background: '#f0f2f5', padding: '6px 12px', borderRadius: '20px' }}>
            ✨ Powered by AI
          </span>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1a1a2e' }}>
          Configure Analysis
        </h3>
        {fields.map(field => (
          <div key={field.key} className="form-group">
            <label>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                className="form-control"
                rows={4}
                value={formData[field.key]}
                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                placeholder={field.placeholder}
              />
            ) : field.type === 'select' ? (
              <select
                className="form-control"
                value={formData[field.key]}
                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
              >
                <option value="">Select...</option>
                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                className="form-control"
                value={formData[field.key]}
                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: '8px' }}
        >
          {loading ? '⏳ Analyzing...' : `🚀 Run ${title}`}
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fff5f5',
          border: '1px solid #fecdd3',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#c23152',
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          ❌ {error}
        </div>
      )}

      {loading && (
        <div className="card">
          <div className="ai-loading">
            <div className="spinner"></div>
            <p style={{ fontWeight: 600 }}>AI is analyzing your data...</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>This may take a moment</p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="card">
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '20px' }}>✨</span>
            <div>
              <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 700, border: 'none', margin: 0, padding: 0 }}>AI Analysis Results</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>Generated by Claude AI via OpenRouter</p>
            </div>
          </div>
          <div className="ai-result">
            {formatAIContent(result)}
          </div>
        </div>
      )}
    </div>
  );
}
