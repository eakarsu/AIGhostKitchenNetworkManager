import AIPage from '../components/AIPage';

const fields = [
  { key: 'brand_name', label: 'Brand Name', type: 'select', options: ['Dragon Wok Express', 'Bella Napoli Pizza', 'Taco Loco Fiesta', 'Burger Republic', 'Sakura Sushi House', 'Mumbai Street Kitchen', 'Mediterranean Bliss', 'Seoul Kitchen BBQ', 'Le Petit Bistro', 'Smoke & Grill House', 'The Poke Bowl Co', 'Bangkok Street Food', 'Falafel Kingdom', 'Caribbean Flame', 'Green Garden Vegan'] },
  { key: 'current_menu', label: 'Current Menu Items', type: 'textarea', placeholder: 'List your current menu items with prices and sales data...\ne.g. Kung Pao Chicken ($14.99, 150 orders/week), Fried Rice ($8.99, 200 orders/week)', default: 'Kung Pao Chicken ($14.99, 150 orders/week)\nGeneral Tso Chicken ($13.99, 120 orders/week)\nFried Rice ($8.99, 200 orders/week)\nLo Mein ($11.99, 95 orders/week)\nSpring Rolls ($7.99, 180 orders/week)\nHot & Sour Soup ($6.99, 60 orders/week)\nBeef Broccoli ($15.99, 85 orders/week)\nSweet & Sour Pork ($13.99, 70 orders/week)' },
  { key: 'platform_data', label: 'Platform Analytics', type: 'textarea', placeholder: 'Share delivery platform performance data...', default: 'Uber Eats: 45% of orders, avg rating 4.5, avg delivery time 28min\nDoorDash: 35% of orders, avg rating 4.3, avg delivery time 32min\nGrubhub: 20% of orders, avg rating 4.6, avg delivery time 30min\nPeak hours: 11:30am-1:30pm, 5:30pm-8:30pm\nTop searched: spicy chicken, noodles, combo meals' },
];

export default function AIMenuOptimization() {
  return <AIPage title="Menu Optimization" icon="🎯" endpoint="menu-optimization" fields={fields} subtitle="AI-powered menu analytics and recommendations" />;
}
