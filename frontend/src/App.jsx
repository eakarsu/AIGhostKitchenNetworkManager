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
import AISiteSelection from './pages/AISiteSelection';
import AIBrandPortfolio from './pages/AIBrandPortfolio';
import AIIngredientSubstitution from './pages/AIIngredientSubstitution';
import AIDriverRouteOptimization from './pages/AIDriverRouteOptimization';
import AICannibalizationDetection from './pages/AICannibalizationDetection';
import CustomFeatures from './pages/CustomFeatures';
import Compliance from './pages/Compliance';
import CustomerComms from './pages/CustomerComms';
import CustomViewsPage from './pages/CustomViewsPage';
import PrepLoadBalancer from './pages/PrepLoadBalancer';

// === Batch 04 Gaps & Frontend Mounts ===
import CfAgenticKitchenAutomationPrioritizing from './pages/CfAgenticKitchenAutomationPrioritizing';
import CfCrossBrandCannibalizationDetectionFl from './pages/CfCrossBrandCannibalizationDetectionFl';
import CfSeasonalMenuAdvisorTrackingIngredien from './pages/CfSeasonalMenuAdvisorTrackingIngredien';
import CfDeliveryZoneHeatMapWithSurge from './pages/CfDeliveryZoneHeatMapWithSurge';
import CfWorkforceBurnoutPredictionBasedOnLa from './pages/CfWorkforceBurnoutPredictionBasedOnLa';
import CfCameraBasedFoodSafetyMonitorDetecti from './pages/CfCameraBasedFoodSafetyMonitorDetecti';
import GapNoGhostKitchenSiteSelectionAi from './pages/GapNoGhostKitchenSiteSelectionAi';
import GapNoBrandPortfolioOptimization from './pages/GapNoBrandPortfolioOptimization';
import GapNoIngredientSubstitutionAi from './pages/GapNoIngredientSubstitutionAi';
import GapNoDriverRouteOptimization from './pages/GapNoDriverRouteOptimization';
import GapNoVideoBasedQualityControl from './pages/GapNoVideoBasedQualityControl';
import GapNoPaymentProcessingSurface from './pages/GapNoPaymentProcessingSurface';
import GapNoVendorSupplierDirectoryBeyondInve from './pages/GapNoVendorSupplierDirectoryBeyondInve';
import GapNoRealTimeWebsocketOrderBoard from './pages/GapNoRealTimeWebsocketOrderBoard';
import GapNoMultiLocationFranchiseRollup from './pages/GapNoMultiLocationFranchiseRollup';
import GapNoFileUploadModuleForMenu from './pages/GapNoFileUploadModuleForMenu';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

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
    { path: '/ai/site-selection', label: 'Site Selection', icon: '📍' },
    { path: '/ai/brand-portfolio-optimize', label: 'Brand Portfolio', icon: '🏷️' },
    { path: '/ai/ingredient-substitution', label: 'Ingredient Sub', icon: '🔄' },
    { path: '/ai/driver-route-optimization', label: 'Driver Routing', icon: '🚗' },
    { path: '/ai/cannibalization-detection', label: 'Cannibalization', icon: '⚔️' },
  ]},
  { title: '⚡ AUTOMATIONS', items: [
    { path: '/custom', label: 'Operations Automations', icon: '⚡' },
    { path: '/prep-load-balancer', label: 'Prep Load Balancer', icon: '⚖️' },
  ]},
  { title: '🍳 KITCHEN VIEWS', items: [
    { path: '/custom-views', label: 'Kitchen Views', icon: '🍳' },
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
        <Route path="/insights/timeline" element={<TimelineView />} />
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

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
          <Route path="/ai/site-selection" element={<AISiteSelection />} />
          <Route path="/ai/brand-portfolio-optimize" element={<AIBrandPortfolio />} />
          <Route path="/ai/ingredient-substitution" element={<AIIngredientSubstitution />} />
          <Route path="/ai/driver-route-optimization" element={<AIDriverRouteOptimization />} />
          <Route path="/ai/cannibalization-detection" element={<AICannibalizationDetection />} />
          <Route path="/custom" element={<CustomFeatures />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/customer-comms" element={<CustomerComms />} />
          <Route path="/custom-views" element={<CustomViewsPage />} />
          <Route path="/prep-load-balancer" element={<PrepLoadBalancer />} />
        
          {/* // === Batch 04 Gaps & Frontend Mounts === */}
          <Route path="/cf-agentic-kitchen-automation-prioritizing-" element={<CfAgenticKitchenAutomationPrioritizing />} />
          <Route path="/cf-cross-brand-cannibalization-detection-fl" element={<CfCrossBrandCannibalizationDetectionFl />} />
          <Route path="/cf-seasonal-menu-advisor-tracking-ingredien" element={<CfSeasonalMenuAdvisorTrackingIngredien />} />
          <Route path="/cf-delivery-zone-heat-map-with-surge" element={<CfDeliveryZoneHeatMapWithSurge />} />
          <Route path="/cf-workforce-burnout-prediction-based-on-la" element={<CfWorkforceBurnoutPredictionBasedOnLa />} />
          <Route path="/cf-camera-based-food-safety-monitor-detecti" element={<CfCameraBasedFoodSafetyMonitorDetecti />} />
          <Route path="/gap-no-ghost-kitchen-site-selection-ai" element={<GapNoGhostKitchenSiteSelectionAi />} />
          <Route path="/gap-no-brand-portfolio-optimization" element={<GapNoBrandPortfolioOptimization />} />
          <Route path="/gap-no-ingredient-substitution-ai" element={<GapNoIngredientSubstitutionAi />} />
          <Route path="/gap-no-driver-route-optimization" element={<GapNoDriverRouteOptimization />} />
          <Route path="/gap-no-video-based-quality-control" element={<GapNoVideoBasedQualityControl />} />
          <Route path="/gap-no-payment-processing-surface" element={<GapNoPaymentProcessingSurface />} />
          <Route path="/gap-no-vendor-supplier-directory-beyond-inve" element={<GapNoVendorSupplierDirectoryBeyondInve />} />
          <Route path="/gap-no-real-time-websocket-order-board" element={<GapNoRealTimeWebsocketOrderBoard />} />
          <Route path="/gap-no-multi-location-franchise-rollup" element={<GapNoMultiLocationFranchiseRollup />} />
          <Route path="/gap-no-file-upload-module-for-menu" element={<GapNoFileUploadModuleForMenu />} />
</Routes>
      </main>
    </div>
  );
}
