import { useState } from 'react';

function formatInline(line) {
  return String(line)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:13px">$1</code>');
}

function humanizeKey(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b(pct|usd|eta|ai|po)\b/gi, m => m.toUpperCase())
    .replace(/\b\w/g, c => c.toUpperCase());
}

const isEmpty = (v) =>
  v === null || v === undefined || v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

// Fields that read best as a section heading inside a card.
const TITLE_KEYS = ['item', 'name', 'brand', 'location', 'ingredient', 'area', 'driver_name', 'title', 'product_name', 'zone_name'];
const MONEY_RE = /(price|cost|revenue|usd|savings|amount|rent|spend)/i;
const SCORE_RE = /(score|overlap_score|_0_100)/i;
const BADGE_WORDS = {
  high: 'high', medium: 'medium', low: 'low',
  immediate: 'immediate', urgent: 'urgent', normal: 'normal', good: 'good',
};

function formatMoney(n) {
  const num = typeof n === 'number' ? n : parseFloat(String(n).replace(/[^0-9.\-]/g, ''));
  if (isNaN(num)) return String(n);
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Badge({ value }) {
  const key = String(value).trim().toLowerCase();
  const variant = BADGE_WORDS[key] || 'neutral';
  return <span className={`ai-badge ai-badge-${variant}`}>{String(value)}</span>;
}

// Render a single scalar value with context-aware styling (money, badge, score).
function renderScalar(key, value) {
  const k = String(key || '');
  if ((typeof value === 'number' || /^\$?[\d.,]+$/.test(String(value))) && MONEY_RE.test(k) && !SCORE_RE.test(k)) {
    return <span className="ai-money">{formatMoney(value)}</span>;
  }
  if (typeof value === 'number' && SCORE_RE.test(k)) {
    const max = /0_100/.test(k) || value <= 100 ? 100 : null;
    return <span className="ai-score">{value}{max ? <small>/{max}</small> : null}</span>;
  }
  if (BADGE_WORDS[String(value).trim().toLowerCase()]) {
    return <Badge value={value} />;
  }
  if (typeof value === 'boolean') return <Badge value={value ? 'yes' : 'no'} />;
  return <span dangerouslySetInnerHTML={{ __html: formatInline(String(value)) }} />;
}

// Render the value side of a field (scalar, list, or nested object).
function renderFieldValue(key, value) {
  if (isEmpty(value)) return <span style={{ color: '#aaa' }}>—</span>;
  if (typeof value !== 'object') return renderScalar(key, value);

  if (Array.isArray(value)) {
    const allPrimitive = value.every(v => v === null || typeof v !== 'object');
    if (allPrimitive) {
      return <ul className="ai-bullets">{value.map((v, i) => <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(String(v)) }} />)}</ul>;
    }
    return <div className="ai-cards">{value.map((v, i) => <ObjectCard key={i} obj={v} />)}</div>;
  }
  // Nested object → labeled fields
  return <FieldList obj={value} />;
}

function FieldList({ obj }) {
  const entries = Object.entries(obj).filter(([, v]) => !isEmpty(v));
  if (entries.length === 0) return <span style={{ color: '#aaa' }}>—</span>;
  return (
    <div className="ai-fields">
      {entries.map(([k, v]) => (
        <div className="ai-field" key={k}>
          <span className="ai-field-label">{humanizeKey(k)}</span>
          <span className="ai-field-value">{renderFieldValue(k, v)}</span>
        </div>
      ))}
    </div>
  );
}

// An object rendered as a card: a title pulled from a title-like field + the rest as fields.
function ObjectCard({ obj }) {
  if (obj === null || typeof obj !== 'object') {
    return <div className="ai-card-item">{renderScalar('', obj)}</div>;
  }
  const titleKey = TITLE_KEYS.find(k => obj[k] != null && obj[k] !== '');
  const scoreKey = Object.keys(obj).find(k => SCORE_RE.test(k) && typeof obj[k] === 'number');
  const rest = Object.entries(obj).filter(([k, v]) => k !== titleKey && k !== scoreKey && !isEmpty(v));
  return (
    <div className="ai-card-item">
      {(titleKey || scoreKey) && (
        <div className="ai-card-head">
          {titleKey ? <span className="ai-card-title">{String(obj[titleKey])}</span> : <span />}
          {scoreKey ? renderScalar(scoreKey, obj[scoreKey]) : null}
        </div>
      )}
      <FieldList obj={Object.fromEntries(rest)} />
    </div>
  );
}

// Top-level: render a parsed AI JSON object as a professional report.
function renderReport(data) {
  const SUMMARY_KEYS = ['summary', 'overview', 'executive_summary'];
  const summaryKey = SUMMARY_KEYS.find(k => typeof data[k] === 'string' && data[k].trim());
  const sections = Object.entries(data).filter(([k, v]) => k !== summaryKey && !isEmpty(v));

  return (
    <div className="ai-report">
      {summaryKey && (
        <div className="ai-summary">
          <span className="ai-summary-icon">📋</span>
          <div>
            <div className="ai-summary-label">Executive Summary</div>
            <div className="ai-summary-text" dangerouslySetInnerHTML={{ __html: formatInline(data[summaryKey]) }} />
          </div>
        </div>
      )}
      {sections.map(([k, v]) => (
        <section className="ai-section" key={k}>
          <h3 className="ai-section-title">
            {humanizeKey(k)}
            {Array.isArray(v) && v.length > 0 && <span className="ai-count">{v.length}</span>}
          </h3>
          {renderFieldValue(k, v)}
        </section>
      ))}
    </div>
  );
}

// Best-effort recovery of a JSON object from a string that may be wrapped in
// ```json fences and/or truncated mid-output (closes any unbalanced braces).
function salvageJson(text) {
  if (typeof text !== 'string') return null;
  let s = text.replace(/```(?:json)?/gi, '').trim();
  const start = s.indexOf('{');
  if (start === -1) return null;
  s = s.slice(start);
  try { return JSON.parse(s); } catch (_) {}
  // Truncated: trim to the last complete top-level field, then re-balance braces.
  const lastComma = s.lastIndexOf(',');
  let candidate = lastComma > 0 ? s.slice(0, lastComma) : s;
  let open = 0, inStr = false, esc = false;
  for (const ch of candidate) {
    if (esc) { esc = false; continue; }
    if (ch === '\\') { esc = true; continue; }
    if (ch === '"') inStr = !inStr;
    else if (!inStr && (ch === '{' || ch === '[')) open++;
    else if (!inStr && (ch === '}' || ch === ']')) open--;
  }
  candidate += '}'.repeat(Math.max(0, open));
  try { return JSON.parse(candidate); } catch (_) {}
  return null;
}

// Entry point: accept either a markdown string or a parsed JSON object/array.
function formatAIContent(content) {
  if (content === null || content === undefined) return null;
  if (typeof content === 'object') {
    // Some responses wrap unparseable / truncated text as { raw_response: "..." }
    if (typeof content.raw_response === 'string') {
      const recovered = salvageJson(content.raw_response);
      if (recovered && typeof recovered === 'object') return renderReport(recovered);
      return formatMarkdown(content.raw_response);
    }
    if (Array.isArray(content)) return <div className="ai-cards">{content.map((v, i) => <ObjectCard key={i} obj={v} />)}</div>;
    return renderReport(content);
  }
  // A plain string might itself be JSON (or fenced JSON) — try to recover first.
  const recovered = salvageJson(String(content));
  if (recovered && typeof recovered === 'object') return renderReport(recovered);
  return formatMarkdown(String(content));
}

function formatMarkdown(text) {
  if (!text) return null;

  // Convert markdown-like content to HTML
  const lines = String(text).split('\n');
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
