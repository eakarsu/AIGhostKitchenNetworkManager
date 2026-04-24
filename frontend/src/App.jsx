import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Brands from './pages/Brands';
import Menus from './pages/Menus';
import KitchenStations from './pages/KitchenStations';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Recipes from './pages/Recipes';
import Packaging from './pages/Packaging';
import Drivers from './pages/Drivers';
import Scheduling from './pages/Scheduling';
import FoodCosts from './pages/FoodCosts';
import QualityControl from './pages/QualityControl';
import TemperatureLogs from './pages/TemperatureLogs';
import HealthInspections from './pages/HealthInspections';
import LaborScheduling from './pages/LaborScheduling';
import PlatformFees from './pages/PlatformFees';
import Revenue from './pages/Revenue';
import DeliveryZones from './pages/DeliveryZones';
import Customers from './pages/Customers';
import Loyalty from './pages/Loyalty';
import Equipment from './pages/Equipment';
import Cleaning from './pages/Cleaning';
import Waste from './pages/Waste';
import Profitability from './pages/Profitability';
import AIMenuOptimization from './pages/AIMenuOptimization';
import AIBrandConcept from './pages/AIBrandConcept';
import AIDemandForecast from './pages/AIDemandForecast';
import AISentimentAnalysis from './pages/AISentimentAnalysis';
import AIDynamicPricing from './pages/AIDynamicPricing';
import AISocialMedia from './pages/AISocialMedia';

const navSections = [
  { title: 'OPERATIONS', items: [
    { path: '/brands', label: 'Virtual Brands', icon: '🏪' },
    { path: '/menus', label: 'Menus', icon: '📋' },
    { path: '/kitchen-stations', label: 'Kitchen Stations', icon: '🍳' },
    { path: '/orders', label: 'Orders', icon: '📦' },
  ]},
  { title: 'SUPPLY CHAIN', items: [
    { path: '/inventory', label: 'Inventory', icon: '🗃️' },
    { path: '/recipes', label: 'Recipes', icon: '📖' },
    { path: '/packaging', label: 'Packaging', icon: '🎁' },
  ]},
  { title: 'DELIVERY', items: [
    { path: '/drivers', label: 'Drivers', icon: '🚗' },
    { path: '/delivery-zones', label: 'Delivery Zones', icon: '🗺️' },
  ]},
  { title: 'WORKFORCE', items: [
    { path: '/scheduling', label: 'Kitchen Schedules', icon: '📅' },
    { path: '/labor-scheduling', label: 'Labor Scheduling', icon: '👥' },
  ]},
  { title: 'FINANCE', items: [
    { path: '/food-costs', label: 'Food Costs', icon: '💰' },
    { path: '/platform-fees', label: 'Platform Fees', icon: '💳' },
    { path: '/revenue', label: 'Revenue', icon: '📊' },
    { path: '/profitability', label: 'Profitability', icon: '📈' },
  ]},
  { title: 'COMPLIANCE', items: [
    { path: '/quality-control', label: 'Quality Control', icon: '✅' },
    { path: '/temperature-logs', label: 'Temp Logs', icon: '🌡️' },
    { path: '/health-inspections', label: 'Health Inspections', icon: '🏥' },
    { path: '/cleaning', label: 'Cleaning', icon: '🧹' },
  ]},
  { title: 'CUSTOMERS', items: [
    { path: '/customers', label: 'Customers', icon: '👤' },
    { path: '/loyalty', label: 'Loyalty', icon: '⭐' },
  ]},
  { title: 'FACILITIES', items: [
    { path: '/equipment', label: 'Equipment', icon: '🔧' },
    { path: '/waste', label: 'Waste Tracking', icon: '♻️' },
  ]},
  { title: '✨ AI INSIGHTS', items: [
    { path: '/ai/menu-optimization', label: 'Menu Optimization', icon: '🎯' },
    { path: '/ai/brand-concept', label: 'Brand Concepts', icon: '💡' },
    { path: '/ai/demand-forecast', label: 'Demand Forecast', icon: '📊' },
    { path: '/ai/sentiment-analysis', label: 'Sentiment Analysis', icon: '💬' },
    { path: '/ai/dynamic-pricing', label: 'Dynamic Pricing', icon: '💲' },
    { path: '/ai/social-media', label: 'Social Media', icon: '📱' },
  ]},
];

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    navigate('/');
  };

  if (!token) {
    return <Login onLogin={(t) => setToken(t)} />;
  }

  return (
    <div>
      <nav className="sidebar">
        <NavLink to="/" className="sidebar-logo" style={{ textDecoration: 'none', color: 'white' }}>
          <span>👻</span>
          Ghost Kitchen
        </NavLink>

        <div style={{ padding: '8px 12px' }}>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon">🏠</span>
            Dashboard
          </NavLink>
        </div>

        {navSections.map(section => (
          <div key={section.title} className="nav-section">
            <div className="nav-section-title">{section.title}</div>
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-link-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}

        <div className="sidebar-logout">
          <button onClick={handleLogout}>🚪 Sign Out</button>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/menus" element={<Menus />} />
          <Route path="/kitchen-stations" element={<KitchenStations />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/packaging" element={<Packaging />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/food-costs" element={<FoodCosts />} />
          <Route path="/quality-control" element={<QualityControl />} />
          <Route path="/temperature-logs" element={<TemperatureLogs />} />
          <Route path="/health-inspections" element={<HealthInspections />} />
          <Route path="/labor-scheduling" element={<LaborScheduling />} />
          <Route path="/platform-fees" element={<PlatformFees />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/delivery-zones" element={<DeliveryZones />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/loyalty" element={<Loyalty />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/cleaning" element={<Cleaning />} />
          <Route path="/waste" element={<Waste />} />
          <Route path="/profitability" element={<Profitability />} />
          <Route path="/ai/menu-optimization" element={<AIMenuOptimization />} />
          <Route path="/ai/brand-concept" element={<AIBrandConcept />} />
          <Route path="/ai/demand-forecast" element={<AIDemandForecast />} />
          <Route path="/ai/sentiment-analysis" element={<AISentimentAnalysis />} />
          <Route path="/ai/dynamic-pricing" element={<AIDynamicPricing />} />
          <Route path="/ai/social-media" element={<AISocialMedia />} />
        </Routes>
      </main>
    </div>
  );
}
