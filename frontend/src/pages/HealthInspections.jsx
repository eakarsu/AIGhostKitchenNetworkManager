import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'inspection_date', label: 'Date', type: 'date' },
  { key: 'inspector_name', label: 'Inspector' },
  { key: 'score', label: 'Score', type: 'number' },
  { key: 'max_score', label: 'Max Score', type: 'number' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'next_inspection', label: 'Next', type: 'date' },
];

const formFields = [
  { key: 'inspection_date', label: 'Inspection Date', type: 'date' },
  { key: 'inspector_name', label: 'Inspector Name', placeholder: 'e.g. John Health' },
  { key: 'score', label: 'Score', type: 'number', placeholder: '95' },
  { key: 'max_score', label: 'Max Score', type: 'number', placeholder: '100' },
  { key: 'status', label: 'Status', type: 'select', options: ['passed', 'failed', 'conditional', 'pending'] },
  { key: 'findings', label: 'Findings', type: 'textarea', placeholder: 'Inspection findings...' },
  { key: 'corrective_actions', label: 'Corrective Actions', type: 'textarea', placeholder: 'Required actions...' },
  { key: 'next_inspection', label: 'Next Inspection', type: 'date' },
];

export default function HealthInspections() {
  return <CrudPage title="Health Inspections" icon="🏥" apiPath="/api/health-inspections" columns={columns} formFields={formFields} subtitle="Inspection readiness and compliance" />;
}
