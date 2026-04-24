import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'name', label: 'Item Name' },
  { key: 'brand_id', label: 'Brand ID' },
  { key: 'type', label: 'Type' },
  { key: 'cost', label: 'Cost', type: 'currency' },
  { key: 'stock_quantity', label: 'Stock', type: 'number' },
  { key: 'eco_friendly', label: 'Eco-Friendly', type: 'boolean' },
];

const formFields = [
  { key: 'brand_id', label: 'Brand ID', type: 'number', placeholder: '1' },
  { key: 'name', label: 'Packaging Name', placeholder: 'e.g. Large Pizza Box' },
  { key: 'type', label: 'Type', type: 'select', options: ['box', 'container', 'bag', 'cup', 'bowl', 'wrapper', 'tray', 'utensil_set'] },
  { key: 'cost', label: 'Cost Per Unit', type: 'number', placeholder: '0.35' },
  { key: 'stock_quantity', label: 'Stock Quantity', type: 'number', placeholder: '500' },
  { key: 'supplier', label: 'Supplier', placeholder: 'e.g. EcoPak Solutions' },
  { key: 'eco_friendly', label: 'Eco-Friendly', type: 'select', options: ['true', 'false'] },
];

export default function Packaging() {
  return <CrudPage title="Packaging" icon="🎁" apiPath="/api/packaging" columns={columns} formFields={formFields} subtitle="Per-brand packaging tracking" />;
}
