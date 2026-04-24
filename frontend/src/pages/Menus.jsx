import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'name', label: 'Item Name' },
  { key: 'brand_id', label: 'Brand ID' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price', type: 'currency' },
  { key: 'prep_time_minutes', label: 'Prep Time' },
  { key: 'is_available', label: 'Available', type: 'boolean' },
];

const formFields = [
  { key: 'brand_id', label: 'Brand ID', type: 'number', placeholder: '1' },
  { key: 'name', label: 'Item Name', placeholder: 'e.g. Kung Pao Chicken' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the dish...' },
  { key: 'price', label: 'Price', type: 'number', placeholder: '12.99' },
  { key: 'category', label: 'Category', type: 'select', options: ['appetizer', 'main', 'side', 'dessert', 'drink', 'combo', 'special'] },
  { key: 'is_available', label: 'Available', type: 'select', options: ['true', 'false'] },
  { key: 'prep_time_minutes', label: 'Prep Time (min)', type: 'number', placeholder: '15' },
  { key: 'calories', label: 'Calories', type: 'number', placeholder: '450' },
];

export default function Menus() {
  return <CrudPage title="Menu Items" icon="📋" apiPath="/api/menus" columns={columns} formFields={formFields} subtitle="Multi-brand menu management" />;
}
