import AIPage from '../components/AIPage';

const fields = [
  { key: 'brand_name', label: 'Brand Name', type: 'select', options: ['Dragon Wok Express', 'Bella Napoli Pizza', 'Taco Loco Fiesta', 'Burger Republic', 'Sakura Sushi House', 'Mumbai Street Kitchen', 'Mediterranean Bliss', 'Seoul Kitchen BBQ', 'Le Petit Bistro', 'Smoke & Grill House', 'The Poke Bowl Co', 'Bangkok Street Food', 'Falafel Kingdom', 'Caribbean Flame', 'Green Garden Vegan'] },
  { key: 'location', label: 'Kitchen Location', placeholder: 'e.g. Downtown Kitchen, Midtown Hub', default: 'Downtown Kitchen' },
  { key: 'historical_data', label: 'Historical Data', type: 'textarea', placeholder: 'Enter recent order history and patterns...', default: 'Last 4 weeks average:\nMonday: 85 orders (Lunch: 40, Dinner: 45)\nTuesday: 90 orders (Lunch: 42, Dinner: 48)\nWednesday: 95 orders (Lunch: 45, Dinner: 50)\nThursday: 110 orders (Lunch: 50, Dinner: 60)\nFriday: 145 orders (Lunch: 55, Dinner: 90)\nSaturday: 160 orders (Lunch: 65, Dinner: 95)\nSunday: 130 orders (Lunch: 70, Dinner: 60)\n\nTrending up 12% month over month\nRainy days see 25% increase in orders\nLocal events boost orders by 40%\nAvg order value: $28.50' },
];

export default function AIDemandForecast() {
  return <AIPage title="Demand Forecasting" icon="📊" endpoint="demand-forecast" fields={fields} subtitle="Predict demand by location and time" />;
}
