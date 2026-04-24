import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'station_id', label: 'Station ID' },
  { key: 'brand_id', label: 'Brand ID' },
  { key: 'day_of_week', label: 'Day' },
  { key: 'start_time', label: 'Start' },
  { key: 'end_time', label: 'End' },
  { key: 'staff_count', label: 'Staff', type: 'number' },
];

const formFields = [
  { key: 'station_id', label: 'Station ID', type: 'number', placeholder: '1' },
  { key: 'brand_id', label: 'Brand ID', type: 'number', placeholder: '1' },
  { key: 'day_of_week', label: 'Day of Week', type: 'select', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  { key: 'start_time', label: 'Start Time', type: 'time' },
  { key: 'end_time', label: 'End Time', type: 'time' },
  { key: 'staff_count', label: 'Staff Count', type: 'number', placeholder: '3' },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Schedule notes...' },
];

export default function Scheduling() {
  return <CrudPage title="Kitchen Schedules" icon="📅" apiPath="/api/scheduling" columns={columns} formFields={formFields} subtitle="Station scheduling by brand and day" />;
}
