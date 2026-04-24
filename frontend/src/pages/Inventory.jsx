import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'name', label: 'Item Name' },
  { key: 'category', label: 'Category' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'unit', label: 'Unit' },
  { key: 'cost_per_unit', label: 'Cost/Unit', type: 'currency' },
  { key: 'supplier', label: 'Supplier' },
];

const formFields = [
  { key: 'name', label: 'Item Name', placeholder: 'e.g. Chicken Breast' },
  { key: 'category', label: 'Category', type: 'select', options: ['protein', 'vegetable', 'grain', 'dairy', 'spice', 'sauce', 'oil', 'packaging', 'beverage', 'dry_goods'] },
  { key: 'quantity', label: 'Quantity', type: 'number', placeholder: '100' },
  { key: 'unit', label: 'Unit', type: 'select', options: ['lbs', 'kg', 'oz', 'gallons', 'liters', 'units', 'cases', 'bags'] },
  { key: 'min_threshold', label: 'Min Threshold', type: 'number', placeholder: '10' },
  { key: 'cost_per_unit', label: 'Cost Per Unit', type: 'number', placeholder: '3.50' },
  { key: 'supplier', label: 'Supplier', placeholder: 'e.g. Sysco Foods' },
  { key: 'shared_across_brands', label: 'Shared Across Brands', type: 'select', options: ['true', 'false'] },
];

export default function Inventory() {
  return <CrudPage title="Inventory" icon="🗃️" apiPath="/api/inventory" columns={columns} formFields={formFields} subtitle="Shared ingredients across all brands" />;
}
