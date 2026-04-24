import AIPage from '../components/AIPage';

const fields = [
  { key: 'cuisine_type', label: 'Cuisine Type', type: 'select', options: ['Chinese', 'Italian', 'Mexican', 'American', 'Japanese', 'Indian', 'Mediterranean', 'Korean', 'French', 'BBQ', 'Hawaiian', 'Thai', 'Middle Eastern', 'Caribbean', 'Vegan', 'Fusion', 'Healthy Bowl', 'Comfort Food', 'Desserts', 'Breakfast'] },
  { key: 'target_market', label: 'Target Market', type: 'textarea', placeholder: 'Describe your target demographic...', default: 'Young professionals aged 25-40, health-conscious but enjoy indulgent food, tech-savvy, willing to pay premium for quality, located in urban downtown area, frequent delivery app users' },
  { key: 'location', label: 'Location', placeholder: 'e.g. Downtown Manhattan, NYC', default: 'Downtown Manhattan, NYC' },
];

export default function AIBrandConcept() {
  return <AIPage title="Brand Concept Generator" icon="💡" endpoint="brand-concept" fields={fields} subtitle="Generate new virtual restaurant brand concepts" />;
}
