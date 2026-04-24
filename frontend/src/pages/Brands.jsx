import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'name', label: 'Brand Name' },
  { key: 'cuisine_type', label: 'Cuisine' },
  { key: 'concept', label: 'Concept' },
  { key: 'status', label: 'Status', type: 'badge' },
];

const formFields = [
  { key: 'name', label: 'Brand Name', placeholder: 'e.g. Dragon Wok Express' },
  { key: 'concept', label: 'Concept', placeholder: 'e.g. Fast-casual Chinese fusion' },
  { key: 'cuisine_type', label: 'Cuisine Type', type: 'select', options: ['Chinese', 'Italian', 'Mexican', 'American', 'Japanese', 'Indian', 'Mediterranean', 'Korean', 'French', 'BBQ', 'Hawaiian', 'Thai', 'Middle Eastern', 'Caribbean', 'Vegan'] },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the brand concept...' },
  { key: 'logo_url', label: 'Logo URL', placeholder: 'https://...' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'planning'] },
];

export default function Brands() {
  return <CrudPage title="Virtual Brands" icon="🏪" apiPath="/api/brands" columns={columns} formFields={formFields} subtitle="Manage your virtual restaurant brand portfolio" />;
}
