import AIPage from '../components/AIPage';

/**
 * Frontend for `POST /api/ai/site-selection` (added in backend/routes/ai.js).
 * Mirrors AIMenuOptimization.jsx style exactly — same fields shape and AIPage wrapper.
 */
const fields = [
  {
    key: 'candidate_locations',
    label: 'Candidate Locations',
    type: 'textarea',
    placeholder:
      'List candidate sites with key context (rent, sqft, neighborhood, demographics)...',
    default:
      '1) 200 W 42nd St (Times Square area) - 1800 sqft, $14k/mo rent, dense office workers\n2) 411 Bedford Ave (Williamsburg) - 1200 sqft, $9k/mo, young professionals\n3) 86-12 Roosevelt Ave (Jackson Heights) - 2400 sqft, $7k/mo, dense residential, multi-cuisine demand',
  },
  {
    key: 'fleet_brands',
    label: 'Brands you would operate from this site',
    type: 'textarea',
    placeholder: 'Brands and target order volume...',
    default:
      'Dragon Wok Express (300/wk), Burger Republic (200/wk), Mediterranean Bliss (150/wk)',
  },
  {
    key: 'demand_signals',
    label: 'Demand signals (search trends, competitor density, courier supply)',
    type: 'textarea',
    placeholder:
      'Pull from internal analytics, DoorDash heatmaps, or simple notes...',
    default:
      'High lunch demand near office cluster; weak dinner. Top searches: chicken, noodles, salads. 12 active competitors within 1 mile.',
  },
];

export default function AISiteSelection() {
  return (
    <AIPage
      title="Site Selection"
      icon="📍"
      endpoint="site-selection"
      fields={fields}
      subtitle="Score candidate locations across demographics, competition, courier supply, rent, and expected orders."
    />
  );
}
