import AIPage from '../components/AIPage';

/**
 * Frontend for `POST /api/ai/driver-route-optimization` (apply4 mechanical backlog).
 * Mirrors AISiteSelection.jsx style.
 */
const fields = [
  {
    key: 'time_window',
    label: 'Time Window',
    type: 'text',
    placeholder: 'e.g. next 2 hours, next dinner rush',
    default: 'next 2 hours',
  },
  {
    key: 'constraints',
    label: 'Constraints (free text)',
    type: 'textarea',
    placeholder:
      'Notes about traffic, weather, special events, brand SLAs, vehicle restrictions...',
    default:
      'Avoid bridges with current congestion. Prioritize hot-food orders. Respect driver max 6 stops per route.',
  },
];

export default function AIDriverRouteOptimization() {
  return (
    <AIPage
      title="Driver Route Optimization"
      icon="🚗"
      endpoint="driver-route-optimization"
      fields={fields}
      subtitle="Bundle pending orders into optimized driver routes minimizing drive time and food temperature decay."
    />
  );
}
