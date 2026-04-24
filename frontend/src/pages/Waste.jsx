import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'item_name', label: 'Item' },
  { key: 'brand_id', label: 'Brand ID' },
  { key: 'category', label: 'Category' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'reason', label: 'Reason' },
  { key: 'cost_impact', label: 'Cost Impact', type: 'currency' },
];

const formFields = [
  { key: 'brand_id', label: 'Brand ID', type: 'number', placeholder: '1' },
  { key: 'item_name', label: 'Item Name', placeholder: 'e.g. Chicken Breast' },
  { key: 'category', label: 'Category', type: 'select', options: ['food_prep', 'expired', 'overcooked', 'customer_return', 'spillage', 'contamination', 'overproduction'] },
  { key: 'quantity', label: 'Quantity', type: 'number', placeholder: '5' },
  { key: 'unit', label: 'Unit', type: 'select', options: ['lbs', 'kg', 'oz', 'units', 'portions'] },
  { key: 'reason', label: 'Reason', placeholder: 'e.g. Past expiration date' },
  { key: 'cost_impact', label: 'Cost Impact ($)', type: 'number', placeholder: '15.00' },
  { key: 'recorded_by', label: 'Recorded By', placeholder: 'Employee name' },
  { key: 'waste_date', label: 'Waste Date', type: 'date' },
];

export default function Waste() {
  return <CrudPage title="Waste Tracking" icon="♻️" apiPath="/api/waste" columns={columns} formFields={formFields} subtitle="Food waste and sustainability tracking" />;
}
