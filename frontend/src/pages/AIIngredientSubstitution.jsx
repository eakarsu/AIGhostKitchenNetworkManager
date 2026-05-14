import AIPage from '../components/AIPage';

/**
 * Frontend for `POST /api/ai/ingredient-substitution` (added in backend/routes/ai.js).
 * Mirrors AIMenuOptimization.jsx style.
 */
const fields = [
  {
    key: 'recipe',
    label: 'Recipe',
    type: 'textarea',
    placeholder: 'Paste the recipe with quantities...',
    default:
      'Kung Pao Chicken (serves 4)\n- 500g chicken thigh, diced\n- 1/2 cup roasted peanuts\n- 4 dried red chilies\n- 3 tbsp soy sauce\n- 1 tbsp Shaoxing wine\n- 1 tbsp Chinese black vinegar\n- 1 tsp Sichuan peppercorns',
  },
  {
    key: 'missing_ingredient',
    label: 'Missing ingredient',
    type: 'text',
    placeholder: 'e.g., Shaoxing wine, peanuts, Chinese black vinegar',
    default: 'Shaoxing wine',
  },
  {
    key: 'dietary_restrictions',
    label: 'Dietary / regulatory restrictions',
    type: 'text',
    placeholder: 'e.g., halal, kosher, peanut-free, gluten-free',
    default: 'halal (no alcohol)',
  },
  {
    key: 'budget_constraint',
    label: 'Budget constraint (optional)',
    type: 'text',
    placeholder: 'e.g., keep cost-per-portion under $0.40',
    default: '',
  },
];

export default function AIIngredientSubstitution() {
  return (
    <AIPage
      title="Ingredient Substitution"
      icon="🔄"
      endpoint="ingredient-substitution"
      fields={fields}
      subtitle="Ranked substitutes with flavor, texture, and cost impact."
    />
  );
}
