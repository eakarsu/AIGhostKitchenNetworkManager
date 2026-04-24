import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'customer_id', label: 'Customer ID' },
  { key: 'brand_id', label: 'Brand ID' },
  { key: 'points', label: 'Points', type: 'number' },
  { key: 'tier', label: 'Tier', type: 'badge' },
  { key: 'total_earned', label: 'Total Earned', type: 'number' },
  { key: 'total_redeemed', label: 'Redeemed', type: 'number' },
];

const formFields = [
  { key: 'customer_id', label: 'Customer ID', type: 'number', placeholder: '1' },
  { key: 'brand_id', label: 'Brand ID', type: 'number', placeholder: '1' },
  { key: 'points', label: 'Current Points', type: 'number', placeholder: '500' },
  { key: 'tier', label: 'Tier', type: 'select', options: ['bronze', 'silver', 'gold', 'platinum'] },
  { key: 'total_earned', label: 'Total Points Earned', type: 'number', placeholder: '1000' },
  { key: 'total_redeemed', label: 'Total Redeemed', type: 'number', placeholder: '500' },
  { key: 'last_activity', label: 'Last Activity', type: 'date' },
];

export default function Loyalty() {
  return <CrudPage title="Loyalty Programs" icon="⭐" apiPath="/api/loyalty" columns={columns} formFields={formFields} subtitle="Cross-brand loyalty rewards" />;
}
