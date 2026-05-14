import CrudPage from '../components/CrudPage';

/**
 * Apply pass 5 frontend: Compliance / certification tracking using existing
 * CrudPage component for standard CRUD interactions. Backend at /api/compliance.
 */

const columns = [
  { key: 'cert_type', label: 'Type' },
  { key: 'cert_number', label: '#' },
  { key: 'employee_name', label: 'Employee' },
  { key: 'jurisdiction', label: 'Jurisdiction' },
  { key: 'expires_on', label: 'Expires' },
];

const formFields = [
  { key: 'cert_type', label: 'Cert Type', type: 'select', options: ['food_handler', 'manager_servsafe', 'health_permit', 'business_license', 'fire_inspection', 'liquor_license', 'employer_id', 'other'] },
  { key: 'cert_number', label: 'Cert #' },
  { key: 'employee_name', label: 'Employee (if applicable)' },
  { key: 'kitchen_id', label: 'Kitchen ID', type: 'number' },
  { key: 'brand_id', label: 'Brand ID', type: 'number' },
  { key: 'issued_by', label: 'Issued By' },
  { key: 'issued_date', label: 'Issued Date', type: 'date' },
  { key: 'expires_on', label: 'Expires On', type: 'date' },
  { key: 'jurisdiction', label: 'Jurisdiction' },
  { key: 'file_url', label: 'File URL' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function Compliance() {
  return <CrudPage title="Compliance & Certifications" icon="📋" apiPath="/api/compliance" columns={columns} formFields={formFields} subtitle="Track expiring certifications across kitchens, brands, and staff" />;
}
