import AIPage from '../components/AIPage';

/**
 * Frontend for `POST /api/ai/brand-portfolio-optimize` (added in backend/routes/ai.js).
 * Mirrors AIMenuOptimization.jsx style.
 */
const fields = [
  {
    key: 'current_brands',
    label: 'Current brand performance',
    type: 'textarea',
    placeholder: 'List active brands with weekly orders / revenue / margin...',
    default:
      'Dragon Wok Express - 320/wk, $11.5k revenue, 18% margin\nBurger Republic - 240/wk, $7.8k, 22% margin\nBella Napoli Pizza - 180/wk, $6.4k, 14% margin\nMediterranean Bliss - 90/wk, $3.4k, 12% margin\nCaribbean Flame - 50/wk, $1.9k, 9% margin',
  },
  {
    key: 'kitchen_constraints',
    label: 'Kitchen / station constraints',
    type: 'textarea',
    placeholder:
      'Number of stations, prep capacity, peak throughput limit...',
    default:
      '3 stations: wok, grill, oven. Peak throughput ~80 orders/hour. Limited prep cooler space.',
  },
  {
    key: 'candidate_brands',
    label: 'Candidate brands to test (optional)',
    type: 'textarea',
    placeholder: 'Brands with positive market signals worth testing...',
    default:
      'Sakura Sushi House (rising search volume), Falafel Kingdom (high lunch demand in zone), Green Garden Vegan (ESG narrative + delivery margin >25% in similar markets)',
  },
];

export default function AIBrandPortfolio() {
  return (
    <AIPage
      title="Brand Portfolio Optimize"
      icon="🏷️"
      endpoint="brand-portfolio-optimize"
      fields={fields}
      subtitle="Recommended brand mix, candidates to test, drop candidates, cannibalization risks."
    />
  );
}
