import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'employee_name', label: 'Employee' },
  { key: 'role', label: 'Role' },
  { key: 'station_id', label: 'Station ID' },
  { key: 'shift_date', label: 'Date', type: 'date' },
  { key: 'start_time', label: 'Start' },
  { key: 'end_time', label: 'End' },
  { key: 'status', label: 'Status', type: 'badge' },
];

const formFields = [
  { key: 'employee_name', label: 'Employee Name', placeholder: 'e.g. Maria Garcia' },
  { key: 'role', label: 'Role', type: 'select', options: ['line_cook', 'prep_cook', 'head_chef', 'sous_chef', 'dishwasher', 'expeditor', 'manager', 'porter'] },
  { key: 'station_id', label: 'Station ID', type: 'number', placeholder: '1' },
  { key: 'shift_date', label: 'Shift Date', type: 'date' },
  { key: 'start_time', label: 'Start Time', type: 'time' },
  { key: 'end_time', label: 'End Time', type: 'time' },
  { key: 'hourly_rate', label: 'Hourly Rate', type: 'number', placeholder: '18.00' },
  { key: 'status', label: 'Status', type: 'select', options: ['scheduled', 'confirmed', 'in_progress', 'completed', 'no_show'] },
];

export default function LaborScheduling() {
  return <CrudPage title="Labor Scheduling" icon="👥" apiPath="/api/labor-scheduling" columns={columns} formFields={formFields} subtitle="Employee shift management" />;
}
