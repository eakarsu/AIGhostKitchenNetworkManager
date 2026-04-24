import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'brand_id', label: 'Brand ID' },
  { key: 'menu_item_id', label: 'Menu Item ID' },
  { key: 'ingredient_cost', label: 'Ingredient', type: 'currency' },
  { key: 'total_cost', label: 'Total Cost', type: 'currency' },
  { key: 'selling_price', label: 'Selling Price', type: 'currency' },
  { key: 'profit_margin', label: 'Margin', type: 'percent' },
];

const formFields = [
  { key: 'brand_id', label: 'Brand ID', type: 'number', placeholder: '1' },
  { key: 'menu_item_id', label: 'Menu Item ID', type: 'number', placeholder: '1' },
  { key: 'ingredient_cost', label: 'Ingredient Cost', type: 'number', placeholder: '3.50' },
  { key: 'packaging_cost', label: 'Packaging Cost', type: 'number', placeholder: '0.45' },
  { key: 'labor_cost', label: 'Labor Cost', type: 'number', placeholder: '2.00' },
  { key: 'total_cost', label: 'Total Cost', type: 'number', placeholder: '5.95' },
  { key: 'selling_price', label: 'Selling Price', type: 'number', placeholder: '14.99' },
  { key: 'profit_margin', label: 'Profit Margin %', type: 'number', placeholder: '60' },
  { key: 'period', label: 'Period', placeholder: 'e.g. March 2024' },
];

export default function FoodCosts() {
  return <CrudPage title="Food Costs" icon="💰" apiPath="/api/food-costs" columns={columns} formFields={formFields} subtitle="Cost tracking and profit margins per brand" />;
}
