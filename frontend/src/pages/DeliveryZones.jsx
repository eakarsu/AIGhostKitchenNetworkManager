import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'name', label: 'Zone Name' },
  { key: 'zone_code', label: 'Code' },
  { key: 'radius_miles', label: 'Radius (mi)' },
  { key: 'base_delivery_fee', label: 'Delivery Fee', type: 'currency' },
  { key: 'estimated_time_minutes', label: 'Est. Time (min)' },
  { key: 'status', label: 'Status', type: 'badge' },
];

const formFields = [
  { key: 'name', label: 'Zone Name', placeholder: 'e.g. Downtown Core' },
  { key: 'zone_code', label: 'Zone Code', placeholder: 'e.g. DT-01' },
  { key: 'radius_miles', label: 'Radius (miles)', type: 'number', placeholder: '3.0' },
  { key: 'base_delivery_fee', label: 'Base Delivery Fee', type: 'number', placeholder: '2.99' },
  { key: 'estimated_time_minutes', label: 'Estimated Time (min)', type: 'number', placeholder: '25' },
  { key: 'active_drivers', label: 'Active Drivers', type: 'number', placeholder: '5' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'peak_only'] },
];

export default function DeliveryZones() {
  return <CrudPage title="Delivery Zones" icon="🗺️" apiPath="/api/delivery-zones" columns={columns} formFields={formFields} subtitle="Delivery zone management and fees" />;
}
