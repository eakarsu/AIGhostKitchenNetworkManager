import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'station_id', label: 'Station ID' },
  { key: 'equipment_name', label: 'Equipment' },
  { key: 'temperature', label: 'Temperature' },
  { key: 'unit', label: 'Unit' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'recorded_by', label: 'Recorded By' },
];

const formFields = [
  { key: 'station_id', label: 'Station ID', type: 'number', placeholder: '1' },
  { key: 'equipment_name', label: 'Equipment Name', placeholder: 'e.g. Walk-in Cooler #1' },
  { key: 'temperature', label: 'Temperature', type: 'number', placeholder: '38.5' },
  { key: 'unit', label: 'Unit', type: 'select', options: ['F', 'C'] },
  { key: 'status', label: 'Status', type: 'select', options: ['normal', 'warning', 'critical'] },
  { key: 'recorded_by', label: 'Recorded By', placeholder: 'Employee name' },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Any observations...' },
  { key: 'recorded_at', label: 'Recorded At', type: 'datetime-local' },
];

export default function TemperatureLogs() {
  return <CrudPage title="Temperature Logs" icon="🌡️" apiPath="/api/temperature-logs" columns={columns} formFields={formFields} subtitle="Equipment temperature monitoring" />;
}
