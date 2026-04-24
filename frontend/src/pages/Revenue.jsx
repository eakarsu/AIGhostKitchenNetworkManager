import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'brand_id', label: 'Brand ID' },
  { key: 'platform', label: 'Platform' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'orders_count', label: 'Orders', type: 'number' },
  { key: 'gross_revenue', label: 'Gross', type: 'currency' },
  { key: 'net_revenue', label: 'Net', type: 'currency' },
];

const formFields = [
  { key: 'brand_id', label: 'Brand ID', type: 'number', placeholder: '1' },
  { key: 'platform', label: 'Platform', type: 'select', options: ['Uber Eats', 'DoorDash', 'Grubhub', 'Direct'] },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'orders_count', label: 'Orders Count', type: 'number', placeholder: '45' },
  { key: 'gross_revenue', label: 'Gross Revenue', type: 'number', placeholder: '2500.00' },
  { key: 'platform_fees', label: 'Platform Fees', type: 'number', placeholder: '625.00' },
  { key: 'net_revenue', label: 'Net Revenue', type: 'number', placeholder: '1875.00' },
  { key: 'avg_order_value', label: 'Avg Order Value', type: 'number', placeholder: '28.50' },
];

export default function Revenue() {
  return <CrudPage title="Revenue Records" icon="📊" apiPath="/api/revenue" columns={columns} formFields={formFields} subtitle="Revenue tracking per brand and platform" />;
}
