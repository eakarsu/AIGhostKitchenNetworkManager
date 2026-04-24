import AIPage from '../components/AIPage';

const fields = [
  { key: 'brand_name', label: 'Brand Name', type: 'select', options: ['Dragon Wok Express', 'Bella Napoli Pizza', 'Taco Loco Fiesta', 'Burger Republic', 'Sakura Sushi House', 'Mumbai Street Kitchen', 'Mediterranean Bliss', 'Seoul Kitchen BBQ', 'Le Petit Bistro', 'Smoke & Grill House', 'The Poke Bowl Co', 'Bangkok Street Food', 'Falafel Kingdom', 'Caribbean Flame', 'Green Garden Vegan'] },
  { key: 'reviews', label: 'Customer Reviews', type: 'textarea', placeholder: 'Paste customer reviews here...', default: '⭐⭐⭐⭐⭐ "Best Chinese food delivery! The Kung Pao Chicken is amazing, perfectly spicy. Always arrives hot and fresh." - Sarah M.\n⭐⭐⭐⭐ "Great food but delivery took 45 minutes. The fried rice was excellent though." - Mike T.\n⭐⭐⭐ "Food quality has gone down recently. Spring rolls were soggy and cold. Used to be much better." - Lisa K.\n⭐⭐⭐⭐⭐ "Obsessed with their General Tso! Order at least twice a week. Great portions for the price." - David R.\n⭐⭐ "Order was wrong - got lo mein instead of fried rice. Took 20 min to resolve with support." - Anna P.\n⭐⭐⭐⭐ "Solid Chinese takeout. Not the most authentic but tasty and consistent. Good value." - James W.\n⭐⭐⭐⭐⭐ "The combo meals are such a great deal! Feed my whole family for under $40." - Maria G.\n⭐⭐⭐ "Packaging leaked all over the bag. Food was decent but presentation needs work." - Tom B.\n⭐⭐⭐⭐ "Fast delivery and the app tracking was accurate. Hot & sour soup was perfect on a cold day." - Emily C.\n⭐ "Found a hair in my food. Very disappointed. Won\'t order again unless this is addressed." - Kevin L.' },
];

export default function AISentimentAnalysis() {
  return <AIPage title="Sentiment Analysis" icon="💬" endpoint="sentiment-analysis" fields={fields} subtitle="AI-powered customer review analysis" />;
}
