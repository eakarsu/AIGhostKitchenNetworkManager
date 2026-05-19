import HourlyOrderVolumeTimeline from '../components/HourlyOrderVolumeTimeline';
import BrandPerformanceHeatmap from '../components/BrandPerformanceHeatmap';
import PrepSheetPDF from '../components/PrepSheetPDF';
import PricingRulesEditor from '../components/PricingRulesEditor';

export default function CustomViewsPage() {
  return (
    <div data-testid="custom-views-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🍳 Kitchen Views</h1>
          <p className="page-subtitle">Operational analytics + tooling for ghost kitchen network performance</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        <HourlyOrderVolumeTimeline />
        <BrandPerformanceHeatmap />
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)' }}>
          <PrepSheetPDF />
          <PricingRulesEditor />
        </div>
      </div>
    </div>
  );
}
