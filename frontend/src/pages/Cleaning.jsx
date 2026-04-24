import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'area', label: 'Area' },
  { key: 'task', label: 'Task' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'assigned_to', label: 'Assigned To' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'next_due', label: 'Next Due', type: 'date' },
];

const formFields = [
  { key: 'area', label: 'Area', placeholder: 'e.g. Kitchen Floor' },
  { key: 'task', label: 'Task', placeholder: 'e.g. Deep scrub and sanitize' },
  { key: 'frequency', label: 'Frequency', type: 'select', options: ['daily', 'twice_daily', 'weekly', 'biweekly', 'monthly', 'quarterly'] },
  { key: 'assigned_to', label: 'Assigned To', placeholder: 'Employee name' },
  { key: 'last_completed', label: 'Last Completed', type: 'datetime-local' },
  { key: 'next_due', label: 'Next Due', type: 'datetime-local' },
  { key: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed', 'overdue'] },
  { key: 'checklist', label: 'Checklist', type: 'textarea', placeholder: 'Cleaning steps...' },
];

export default function Cleaning() {
  return <CrudPage title="Cleaning Schedules" icon="🧹" apiPath="/api/cleaning" columns={columns} formFields={formFields} subtitle="Cleaning task management" />;
}
