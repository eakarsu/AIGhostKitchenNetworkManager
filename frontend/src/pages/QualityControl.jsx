import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'station_id', label: 'Station ID' },
  { key: 'checklist_type', label: 'Type' },
  { key: 'completed_by', label: 'Completed By' },
  { key: 'score', label: 'Score', type: 'number' },
  { key: 'completed_at', label: 'Completed', type: 'date' },
];

const formFields = [
  { key: 'station_id', label: 'Station ID', type: 'number', placeholder: '1' },
  { key: 'checklist_type', label: 'Checklist Type', type: 'select', options: ['opening', 'closing', 'mid_shift', 'deep_clean', 'food_safety', 'equipment_check'] },
  { key: 'items', label: 'Checklist Items', type: 'textarea', placeholder: 'Item 1: Pass, Item 2: Pass...' },
  { key: 'completed_by', label: 'Completed By', placeholder: 'Employee name' },
  { key: 'score', label: 'Score (1-100)', type: 'number', placeholder: '95' },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes...' },
  { key: 'completed_at', label: 'Completed At', type: 'datetime-local' },
];

export default function QualityControl() {
  return <CrudPage title="Quality Control" icon="✅" apiPath="/api/quality-control" columns={columns} formFields={formFields} subtitle="Quality assurance checklists" />;
}
