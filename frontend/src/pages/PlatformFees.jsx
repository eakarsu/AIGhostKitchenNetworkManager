import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'platform', label: 'Platform' },
  { key: 'brand_id', label: 'Brand ID' },
  { key: 'fee_type', label: 'Fee Type' },
  { key: 'percentage', label: 'Rate', type: 'percent' },
  { key: 'total_orders', label: 'Orders', type: 'number' },
  { key: 'total_fees', label: 'Total Fees', type: 'currency' },
];

const formFields = [
  { key: 'platform', label: 'Platform', type: 'select', options: ['Uber Eats', 'DoorDash', 'Grubhub', 'Direct'] },
  { key: 'brand_id', label: 'Brand ID', type: 'number', placeholder: '1' },
  { key: 'fee_type', label: 'Fee Type', type: 'select', options: ['commission', 'service_fee', 'delivery_fee', 'marketing', 'subscription'] },
  { key: 'percentage', label: 'Percentage', type: 'number', placeholder: '25.0' },
  { key: 'flat_fee', label: 'Flat Fee', type: 'number', placeholder: '0.00' },
  { key: 'period', label: 'Period', placeholder: 'e.g. March 2024' },
  { key: 'total_orders', label: 'Total Orders', type: 'number', placeholder: '500' },
  { key: 'total_fees', label: 'Total Fees', type: 'number', placeholder: '1250.00' },
];

export default function PlatformFees() {
  return <CrudPage title="Platform Fees" icon="💳" apiPath="/api/platform-fees" columns={columns} formFields={formFields} subtitle="Track fees from Uber Eats, DoorDash & Grubhub" />;
}
