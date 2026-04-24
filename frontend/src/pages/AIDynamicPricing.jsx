import AIPage from '../components/AIPage';

const fields = [
  { key: 'brand_name', label: 'Brand Name', type: 'select', options: ['Dragon Wok Express', 'Bella Napoli Pizza', 'Taco Loco Fiesta', 'Burger Republic', 'Sakura Sushi House', 'Mumbai Street Kitchen', 'Mediterranean Bliss', 'Seoul Kitchen BBQ', 'Le Petit Bistro', 'Smoke & Grill House', 'The Poke Bowl Co', 'Bangkok Street Food', 'Falafel Kingdom', 'Caribbean Flame', 'Green Garden Vegan'] },
  { key: 'menu_items', label: 'Menu Items & Current Prices', type: 'textarea', placeholder: 'List items with prices and cost...', default: 'Kung Pao Chicken - $14.99 (cost: $4.20, 150 orders/week)\nGeneral Tso Chicken - $13.99 (cost: $3.80, 120 orders/week)\nFried Rice - $8.99 (cost: $1.50, 200 orders/week)\nLo Mein - $11.99 (cost: $2.20, 95 orders/week)\nSpring Rolls (6pc) - $7.99 (cost: $1.80, 180 orders/week)\nBeef Broccoli - $15.99 (cost: $5.10, 85 orders/week)\nSweet & Sour Pork - $13.99 (cost: $3.90, 70 orders/week)\nHot & Sour Soup - $6.99 (cost: $1.20, 60 orders/week)' },
  { key: 'demand_data', label: 'Demand Patterns', type: 'textarea', placeholder: 'Describe demand patterns...', default: 'Peak lunch: 11:30am-1:30pm (high demand)\nPeak dinner: 5:30pm-8:30pm (very high demand)\nOff-peak: 2pm-5pm (low demand)\nWeekend demand 40% higher than weekday\nRainy days: +25% orders\nAvg platform commission: 25%' },
  { key: 'competitor_prices', label: 'Competitor Prices', type: 'textarea', placeholder: 'List competitor pricing...', default: 'Panda Express: Kung Pao $10.99, Fried Rice $5.99\nP.F. Chang\'s: Kung Pao $16.99, Fried Rice $11.99\nLocal Chinese #1: Kung Pao $12.99, Fried Rice $7.99\nLocal Chinese #2: Kung Pao $13.49, Fried Rice $8.49' },
];

export default function AIDynamicPricing() {
  return <AIPage title="Dynamic Pricing" icon="💲" endpoint="dynamic-pricing" fields={fields} subtitle="AI-powered pricing recommendations" />;
}
