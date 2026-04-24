import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'name', label: 'Equipment' },
  { key: 'type', label: 'Type' },
  { key: 'station_id', label: 'Station ID' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'last_maintenance', label: 'Last Service', type: 'date' },
  { key: 'next_maintenance', label: 'Next Service', type: 'date' },
];

const formFields = [
  { key: 'name', label: 'Equipment Name', placeholder: 'e.g. Commercial Wok Range' },
  { key: 'station_id', label: 'Station ID', type: 'number', placeholder: '1' },
  { key: 'type', label: 'Type', type: 'select', options: ['cooking', 'refrigeration', 'prep', 'cleaning', 'ventilation', 'storage', 'safety', 'display'] },
  { key: 'brand', label: 'Brand', placeholder: 'e.g. Vulcan' },
  { key: 'model', label: 'Model', placeholder: 'e.g. VHP848' },
  { key: 'purchase_date', label: 'Purchase Date', type: 'date' },
  { key: 'last_maintenance', label: 'Last Maintenance', type: 'date' },
  { key: 'next_maintenance', label: 'Next Maintenance', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: ['operational', 'maintenance_needed', 'under_repair', 'decommissioned'] },
  { key: 'warranty_until', label: 'Warranty Until', type: 'date' },
  { key: 'cost', label: 'Cost', type: 'number', placeholder: '5000' },
];

export default function Equipment() {
  return <CrudPage title="Equipment" icon="🔧" apiPath="/api/equipment" columns={columns} formFields={formFields} subtitle="Equipment maintenance tracking" />;
}
