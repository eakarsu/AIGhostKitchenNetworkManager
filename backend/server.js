require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route imports
const authRoutes = require('./routes/auth');
const brandsRoutes = require('./routes/brands');
const menusRoutes = require('./routes/menus');
const kitchenStationsRoutes = require('./routes/kitchenStations');
const ordersRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const recipesRoutes = require('./routes/recipes');
const packagingRoutes = require('./routes/packaging');
const driversRoutes = require('./routes/drivers');
const schedulingRoutes = require('./routes/scheduling');
const foodCostRoutes = require('./routes/foodCost');
const qualityControlRoutes = require('./routes/qualityControl');
const temperatureLogsRoutes = require('./routes/temperatureLogs');
const healthInspectionRoutes = require('./routes/healthInspection');
const laborSchedulingRoutes = require('./routes/laborScheduling');
const platformFeesRoutes = require('./routes/platformFees');
const revenueRoutes = require('./routes/revenue');
const deliveryZonesRoutes = require('./routes/deliveryZones');
const customersRoutes = require('./routes/customers');
const loyaltyRoutes = require('./routes/loyalty');
const equipmentRoutes = require('./routes/equipment');
const cleaningRoutes = require('./routes/cleaning');
const wasteRoutes = require('./routes/waste');
const profitabilityRoutes = require('./routes/profitability');
const aiRoutes = require('./routes/ai');

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/menus', menusRoutes);
app.use('/api/kitchen-stations', kitchenStationsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/packaging', packagingRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/food-costs', foodCostRoutes);
app.use('/api/quality-control', qualityControlRoutes);
app.use('/api/temperature-logs', temperatureLogsRoutes);
app.use('/api/health-inspections', healthInspectionRoutes);
app.use('/api/labor-scheduling', laborSchedulingRoutes);
app.use('/api/platform-fees', platformFeesRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/delivery-zones', deliveryZonesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/cleaning', cleaningRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/profitability', profitabilityRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.BACKEND_PORT || 3001;

app.listen(PORT, () => {
  console.log(`Ghost Kitchen API server running on port ${PORT}`);
});
