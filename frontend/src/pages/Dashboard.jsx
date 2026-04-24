import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const featureCards = [
  { section: 'OPERATIONS', items: [
    { title: 'Virtual Brands', icon: '🏪', desc: 'Manage virtual brand concepts', path: '/brands', color: '#e94560' },
    { title: 'Menu Management', icon: '📋', desc: 'Multi-brand menu items', path: '/menus', color: '#0f3460' },
    { title: 'Kitchen Stations', icon: '🍳', desc: 'Station assignments & prep', path: '/kitchen-stations', color: '#533483' },
    { title: 'Orders', icon: '📦', desc: 'Aggregated platform orders', path: '/orders', color: '#e94560' },
  ]},
  { section: 'SUPPLY CHAIN', items: [
    { title: 'Inventory', icon: '🗃️', desc: 'Shared ingredients tracking', path: '/inventory', color: '#16213e' },
    { title: 'Recipes', icon: '📖', desc: 'Brand recipe management', path: '/recipes', color: '#0f3460' },
    { title: 'Packaging', icon: '🎁', desc: 'Per-brand packaging tracking', path: '/packaging', color: '#533483' },
  ]},
  { section: 'DELIVERY', items: [
    { title: 'Drivers', icon: '🚗', desc: 'Driver coordination', path: '/drivers', color: '#e94560' },
    { title: 'Delivery Zones', icon: '🗺️', desc: 'Zone management & fees', path: '/delivery-zones', color: '#16213e' },
  ]},
  { section: 'WORKFORCE', items: [
    { title: 'Kitchen Scheduling', icon: '📅', desc: 'Station schedules by brand', path: '/scheduling', color: '#0f3460' },
    { title: 'Labor Scheduling', icon: '👥', desc: 'Employee shift management', path: '/labor-scheduling', color: '#533483' },
  ]},
  { section: 'FINANCE', items: [
    { title: 'Food Costs', icon: '💰', desc: 'Cost tracking per brand', path: '/food-costs', color: '#e94560' },
    { title: 'Platform Fees', icon: '💳', desc: 'Uber/DoorDash/Grubhub fees', path: '/platform-fees', color: '#16213e' },
    { title: 'Revenue', icon: '📊', desc: 'Revenue per brand/platform', path: '/revenue', color: '#0f3460' },
    { title: 'Profitability', icon: '📈', desc: 'Profit analysis per brand', path: '/profitability', color: '#533483' },
  ]},
  { section: 'COMPLIANCE', items: [
    { title: 'Quality Control', icon: '✅', desc: 'Inspection checklists', path: '/quality-control', color: '#e94560' },
    { title: 'Temperature Logs', icon: '🌡️', desc: 'Equipment temp monitoring', path: '/temperature-logs', color: '#16213e' },
    { title: 'Health Inspections', icon: '🏥', desc: 'Inspection readiness', path: '/health-inspections', color: '#0f3460' },
    { title: 'Cleaning Schedules', icon: '🧹', desc: 'Cleaning task management', path: '/cleaning', color: '#533483' },
  ]},
  { section: 'CUSTOMERS', items: [
    { title: 'Customers', icon: '👤', desc: 'Cross-brand customer database', path: '/customers', color: '#e94560' },
    { title: 'Loyalty Programs', icon: '⭐', desc: 'Cross-brand loyalty rewards', path: '/loyalty', color: '#16213e' },
  ]},
  { section: 'FACILITIES', items: [
    { title: 'Equipment', icon: '🔧', desc: 'Maintenance tracking', path: '/equipment', color: '#0f3460' },
    { title: 'Waste Tracking', icon: '♻️', desc: 'Waste & sustainability', path: '/waste', color: '#533483' },
  ]},
];

const aiCards = [
  { title: 'Menu Optimization', icon: '🎯', desc: 'AI-powered menu analytics & recommendations', path: '/ai/menu-optimization' },
  { title: 'Brand Concept Generator', icon: '💡', desc: 'Generate new virtual brand concepts', path: '/ai/brand-concept' },
  { title: 'Demand Forecasting', icon: '📊', desc: 'Predict demand by location & time', path: '/ai/demand-forecast' },
  { title: 'Sentiment Analysis', icon: '💬', desc: 'Customer review analysis', path: '/ai/sentiment-analysis' },
  { title: 'Dynamic Pricing', icon: '💲', desc: 'AI pricing recommendations', path: '/ai/dynamic-pricing' },
  { title: 'Social Media Content', icon: '📱', desc: 'Auto-generated brand content', path: '/ai/social-media' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ brands: 0, orders: 0, revenue: 0, stations: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [brandsRes, ordersRes, revenueRes, stationsRes] = await Promise.all([
          fetch('/api/brands'), fetch('/api/orders'), fetch('/api/revenue'), fetch('/api/kitchen-stations')
        ]);
        const [brands, orders, revenue, stations] = await Promise.all([
          brandsRes.json(), ordersRes.json(), revenueRes.json(), stationsRes.json()
        ]);
        const totalRev = Array.isArray(revenue) ? revenue.reduce((sum, r) => sum + Number(r.net_revenue || 0), 0) : 0;
        setStats({
          brands: Array.isArray(brands) ? brands.length : 0,
          orders: Array.isArray(orders) ? orders.length : 0,
          revenue: totalRev,
          stations: Array.isArray(stations) ? stations.length : 0,
        });
      } catch (e) { console.error('Failed to fetch stats', e); }
    };
    fetchStats();
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user.name || 'Admin'}</p>
        </div>
        <div style={{ fontSize: '14px', color: '#888' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-value">{stats.brands}</div>
          <div className="stat-label">Active Brands</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats.orders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">${stats.revenue.toLocaleString()}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🍳</div>
          <div className="stat-value">{stats.stations}</div>
          <div className="stat-label">Kitchen Stations</div>
        </div>
      </div>

      {featureCards.map(section => (
        <div key={section.section}>
          <div className="section-title">{section.section}</div>
          <div className="dashboard-grid">
            {section.items.map(card => (
              <div key={card.path} className="dashboard-card" onClick={() => navigate(card.path)}>
                <div className="card-icon" style={{ background: card.color + '15', color: card.color }}>
                  {card.icon}
                </div>
                <div className="card-title">{card.title}</div>
                <div className="card-desc">{card.desc}</div>
                <div className="card-arrow">Manage →</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="ai-section">
        <div className="section-title">✨ AI INSIGHTS</div>
        <div className="dashboard-grid">
          {aiCards.map(card => (
            <div key={card.path} className="dashboard-card ai-card" onClick={() => navigate(card.path)}>
              <div className="card-icon" style={{ background: 'rgba(233,69,96,0.2)' }}>
                {card.icon}
              </div>
              <div className="card-title">{card.title}</div>
              <div className="card-desc">{card.desc}</div>
              <div className="card-arrow" style={{ color: '#ff6b81' }}>Explore →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
