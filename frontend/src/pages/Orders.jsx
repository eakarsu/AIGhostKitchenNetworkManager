import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'order_number', label: 'Order #' },
  { key: 'platform', label: 'Platform' },
  { key: 'customer_name', label: 'Customer' },
  { key: 'total', label: 'Total', type: 'currency' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'created_at', label: 'Date', type: 'date' },
];

const formFields = [
  { key: 'order_number', label: 'Order Number', placeholder: 'e.g. ORD-2024-0100' },
  { key: 'brand_id', label: 'Brand ID', type: 'number', placeholder: '1' },
  { key: 'platform', label: 'Platform', type: 'select', options: ['Uber Eats', 'DoorDash', 'Grubhub', 'Direct'] },
  { key: 'customer_name', label: 'Customer Name', placeholder: 'John Doe' },
  { key: 'items', label: 'Items', type: 'textarea', placeholder: '2x Kung Pao Chicken, 1x Fried Rice' },
  { key: 'total', label: 'Total', type: 'number', placeholder: '35.99' },
  { key: 'status', label: 'Status', type: 'select', options: ['pending', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'] },
  { key: 'station_id', label: 'Station ID', type: 'number', placeholder: '1' },
  { key: 'delivery_address', label: 'Delivery Address', type: 'textarea', placeholder: '123 Main St...' },
  { key: 'driver_id', label: 'Driver ID', type: 'number', placeholder: '1' },
  { key: 'prep_time_minutes', label: 'Prep Time (min)', type: 'number', placeholder: '20' },
];

export default function Orders() {
  return <CrudPage title="Orders" icon="📦" apiPath="/api/orders" columns={columns} formFields={formFields} subtitle="Aggregated orders from Uber Eats, DoorDash & Grubhub" />;
}
