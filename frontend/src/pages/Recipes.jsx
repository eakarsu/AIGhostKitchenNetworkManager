import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'name', label: 'Recipe Name' },
  { key: 'brand_id', label: 'Brand ID' },
  { key: 'prep_time_minutes', label: 'Prep Time' },
  { key: 'cook_time_minutes', label: 'Cook Time' },
  { key: 'servings', label: 'Servings' },
  { key: 'cost_per_serving', label: 'Cost/Serving', type: 'currency' },
];

const formFields = [
  { key: 'brand_id', label: 'Brand ID', type: 'number', placeholder: '1' },
  { key: 'name', label: 'Recipe Name', placeholder: 'e.g. Kung Pao Chicken' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief recipe description...' },
  { key: 'ingredients', label: 'Ingredients', type: 'textarea', placeholder: '500g chicken breast, 2 tbsp soy sauce...' },
  { key: 'instructions', label: 'Instructions', type: 'textarea', placeholder: 'Step-by-step instructions...' },
  { key: 'prep_time_minutes', label: 'Prep Time (min)', type: 'number', placeholder: '15' },
  { key: 'cook_time_minutes', label: 'Cook Time (min)', type: 'number', placeholder: '10' },
  { key: 'servings', label: 'Servings', type: 'number', placeholder: '4' },
  { key: 'cost_per_serving', label: 'Cost Per Serving', type: 'number', placeholder: '2.50' },
];

export default function Recipes() {
  return <CrudPage title="Recipes" icon="📖" apiPath="/api/recipes" columns={columns} formFields={formFields} subtitle="Brand-specific recipe management" />;
}
