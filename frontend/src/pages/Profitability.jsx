import CrudPage from '../components/CrudPage';

const columns = [
  { key: 'brand_id', label: 'Brand ID' },
  { key: 'kitchen_location', label: 'Location' },
  { key: 'period', label: 'Period' },
  { key: 'revenue', label: 'Revenue', type: 'currency' },
  { key: 'net_profit', label: 'Net Profit', type: 'currency' },
  { key: 'profit_margin', label: 'Margin', type: 'percent' },
];

const formFields = [
  { key: 'brand_id', label: 'Brand ID', type: 'number', placeholder: '1' },
  { key: 'kitchen_location', label: 'Kitchen Location', placeholder: 'e.g. Downtown Kitchen' },
  { key: 'period', label: 'Period', placeholder: 'e.g. March 2024' },
  { key: 'revenue', label: 'Revenue', type: 'number', placeholder: '25000' },
  { key: 'food_cost', label: 'Food Cost', type: 'number', placeholder: '7500' },
  { key: 'labor_cost', label: 'Labor Cost', type: 'number', placeholder: '5000' },
  { key: 'packaging_cost', label: 'Packaging Cost', type: 'number', placeholder: '1000' },
  { key: 'platform_fees', label: 'Platform Fees', type: 'number', placeholder: '3000' },
  { key: 'overhead', label: 'Overhead', type: 'number', placeholder: '2000' },
  { key: 'net_profit', label: 'Net Profit', type: 'number', placeholder: '6500' },
  { key: 'profit_margin', label: 'Profit Margin %', type: 'number', placeholder: '26' },
];

export default function Profitability() {
  return <CrudPage title="Profitability Analysis" icon="📈" apiPath="/api/profitability" columns={columns} formFields={formFields} subtitle="Profit analysis per brand and kitchen" />;
}
