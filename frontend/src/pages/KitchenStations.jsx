import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'name', label: 'Station Name' },
  { key: 'station_type', label: 'Type' },
  { key: 'capacity', label: 'Capacity', type: 'number' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'assigned_brands', label: 'Assigned Brands' },
];

const formFields = [
  { key: 'name', label: 'Station Name', placeholder: 'e.g. Wok Station Alpha' },
  { key: 'station_type', label: 'Station Type', type: 'select', options: ['wok', 'grill', 'pizza_oven', 'fryer', 'sushi', 'prep', 'assembly', 'dessert', 'tandoor', 'steamer', 'cold_station'] },
  { key: 'capacity', label: 'Capacity (orders/hr)', type: 'number', placeholder: '30' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'maintenance'] },
  { key: 'assigned_brands', label: 'Assigned Brands', placeholder: 'e.g. Dragon Wok, Seoul Kitchen' },
  { key: 'equipment', label: 'Equipment', type: 'textarea', placeholder: 'List equipment at this station...' },
];

export default function KitchenStations() {
  return <CrudPage title="Kitchen Stations" icon="🍳" apiPath="/api/kitchen-stations" columns={columns} formFields={formFields} subtitle="Station assignment and prep display" />;
}
