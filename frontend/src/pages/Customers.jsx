import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'total_orders', label: 'Orders', type: 'number' },
  { key: 'total_spent', label: 'Total Spent', type: 'currency' },
  { key: 'favorite_brand', label: 'Favorite Brand' },
];

const formFields = [
  { key: 'name', label: 'Customer Name', placeholder: 'e.g. Jane Smith' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'jane@email.com' },
  { key: 'phone', label: 'Phone', placeholder: '(555) 123-4567' },
  { key: 'address', label: 'Address', type: 'textarea', placeholder: '123 Main St, City, State' },
  { key: 'total_orders', label: 'Total Orders', type: 'number', placeholder: '0' },
  { key: 'total_spent', label: 'Total Spent', type: 'number', placeholder: '0.00' },
  { key: 'favorite_brand', label: 'Favorite Brand', placeholder: 'e.g. Dragon Wok Express' },
  { key: 'preferred_platform', label: 'Preferred Platform', type: 'select', options: ['Uber Eats', 'DoorDash', 'Grubhub', 'Direct'] },
  { key: 'joined_date', label: 'Joined Date', type: 'date' },
];

export default function Customers() {
  return <CrudPage title="Customers" icon="👤" apiPath="/api/customers" columns={columns} formFields={formFields} subtitle="Cross-brand customer database" />;
}
