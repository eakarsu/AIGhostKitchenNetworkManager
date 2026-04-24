import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'name', label: 'Driver Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'vehicle_type', label: 'Vehicle' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'rating', label: 'Rating' },
  { key: 'total_deliveries', label: 'Deliveries', type: 'number' },
];

const formFields = [
  { key: 'name', label: 'Driver Name', placeholder: 'e.g. John Smith' },
  { key: 'phone', label: 'Phone', placeholder: '(555) 123-4567' },
  { key: 'vehicle_type', label: 'Vehicle Type', type: 'select', options: ['car', 'motorcycle', 'bicycle', 'scooter', 'van'] },
  { key: 'license_plate', label: 'License Plate', placeholder: 'ABC-1234' },
  { key: 'status', label: 'Status', type: 'select', options: ['available', 'delivering', 'offline', 'on_break'] },
  { key: 'current_location', label: 'Current Location', placeholder: 'e.g. Downtown Area' },
  { key: 'rating', label: 'Rating (1-5)', type: 'number', placeholder: '4.8' },
  { key: 'total_deliveries', label: 'Total Deliveries', type: 'number', placeholder: '0' },
];

export default function Drivers() {
  return <CrudPage title="Delivery Drivers" icon="🚗" apiPath="/api/drivers" columns={columns} formFields={formFields} subtitle="Driver coordination and management" />;
}
