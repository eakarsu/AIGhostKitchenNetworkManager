import AIPage from '../components/AIPage';

/**
 * Frontend for `POST /api/ai/cannibalization-detection` (apply4 mechanical backlog).
 * Mirrors AIBrandPortfolio.jsx style.
 */
const fields = [
  {
    key: 'lookback_days',
    label: 'Lookback (days)',
    type: 'number',
    placeholder: '60',
    default: '60',
  },
];

export default function AICannibalizationDetection() {
  return (
    <AIPage
      title="Cross-Brand Cannibalization"
      icon="⚔️"
      endpoint="cannibalization-detection"
      fields={fields}
      subtitle="Detect pairs of in-network brands competing for the same demand pool and quantify overlap."
    />
  );
}
