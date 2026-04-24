import AIPage from '../components/AIPage';

const fields = [
  { key: 'brand_name', label: 'Brand Name', type: 'select', options: ['Dragon Wok Express', 'Bella Napoli Pizza', 'Taco Loco Fiesta', 'Burger Republic', 'Sakura Sushi House', 'Mumbai Street Kitchen', 'Mediterranean Bliss', 'Seoul Kitchen BBQ', 'Le Petit Bistro', 'Smoke & Grill House', 'The Poke Bowl Co', 'Bangkok Street Food', 'Falafel Kingdom', 'Caribbean Flame', 'Green Garden Vegan'] },
  { key: 'brand_concept', label: 'Brand Concept & Voice', type: 'textarea', placeholder: 'Describe the brand personality...', default: 'Dragon Wok Express is a fast-casual Chinese fusion ghost kitchen. Brand voice is fun, bold, and slightly cheeky. We celebrate authentic Chinese flavors with a modern twist. Tagline: "Wok Your World!" We focus on generous portions, bold flavors, and speedy delivery.' },
  { key: 'target_audience', label: 'Target Audience', type: 'textarea', placeholder: 'Describe target audience...', default: 'Young professionals aged 22-38, food enthusiasts, social media active, love trying new cuisines, value convenience and speed, interested in food photography and foodie culture' },
  { key: 'platform', label: 'Social Media Platform', type: 'select', options: ['Instagram', 'TikTok', 'Facebook', 'Twitter/X', 'All Platforms'] },
];

export default function AISocialMedia() {
  return <AIPage title="Social Media Content" icon="📱" endpoint="social-media" fields={fields} subtitle="AI-generated social media content per brand" />;
}
