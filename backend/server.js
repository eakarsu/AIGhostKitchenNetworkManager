require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const pool = require('./db');
const authMiddleware = require('./middleware/auth');

if (!process.env.JWT_SECRET) { console.warn('WARNING: JWT_SECRET not set, using insecure default'); }

const app = express();

// Security middleware — relaxed CSP so Vite dev server / inline scripts work
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — env-driven allowlist (CLIENT_URL or comma-separated CORS_ORIGINS)
const allowed = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:3000')
  .split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.includes('*') || allowed.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Global rate limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
}));

// AI rate limiter — 20/hr keyed by user (matches sibling-project pattern)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req, res) => (req.user ? `user:${req.user.id}` : ipKeyGenerator(req, res)),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI rate limit exceeded. Max 20 requests/hour.' },
});

// Initialize AI results + custom-feature tables
async function initTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        tool_name TEXT NOT NULL,
        input_snapshot JSONB,
        result JSONB,
        model TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        supplier TEXT,
        status TEXT DEFAULT 'pending_approval',
        total_estimated NUMERIC(10,2),
        ai_generated BOOLEAN DEFAULT false,
        notes TEXT,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id SERIAL PRIMARY KEY,
        purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
        inventory_id INTEGER,
        item_name TEXT,
        quantity NUMERIC(10,2),
        unit TEXT,
        unit_cost NUMERIC(10,2)
      );

      CREATE TABLE IF NOT EXISTS forecasts (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER,
        forecast_date DATE,
        projected_orders INTEGER,
        projected_revenue NUMERIC(10,2),
        capacity_warning BOOLEAN DEFAULT false,
        ai_payload JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS platform_webhook_events (
        id SERIAL PRIMARY KEY,
        platform TEXT NOT NULL,
        external_order_id TEXT,
        raw_payload JSONB,
        normalized_order_id INTEGER,
        ai_routing JSONB,
        received_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS price_overrides (
        id SERIAL PRIMARY KEY,
        product_name TEXT,
        platform TEXT,
        original_price NUMERIC(10,2),
        recommended_price NUMERIC(10,2),
        margin_alert BOOLEAN DEFAULT false,
        ai_reasoning TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Ghost Kitchen tables initialized');
  } catch (err) {
    console.error('table init error:', err.message);
  }
}
initTables();

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

// Health check (public)
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Public auth routes
app.use('/api/auth', authRoutes);

// AI history endpoint (auth required)
app.get('/api/ai-history', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const [rows, count] = await Promise.all([
      pool.query('SELECT * FROM ai_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [req.user.id, limit, offset]),
      pool.query('SELECT COUNT(*) FROM ai_results WHERE user_id = $1', [req.user.id]),
    ]);
    res.json({ data: rows.rows, total: parseInt(count.rows[0].count), page, limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route mounting (all require auth)
app.use('/api/brands', authMiddleware, brandsRoutes);
app.use('/api/menus', authMiddleware, menusRoutes);
app.use('/api/kitchen-stations', authMiddleware, kitchenStationsRoutes);
app.use('/api/orders', authMiddleware, ordersRoutes);
app.use('/api/inventory', authMiddleware, inventoryRoutes);
app.use('/api/recipes', authMiddleware, recipesRoutes);
app.use('/api/packaging', authMiddleware, packagingRoutes);
app.use('/api/drivers', authMiddleware, driversRoutes);
app.use('/api/scheduling', authMiddleware, schedulingRoutes);
app.use('/api/food-costs', authMiddleware, foodCostRoutes);
app.use('/api/quality-control', authMiddleware, qualityControlRoutes);
app.use('/api/temperature-logs', authMiddleware, temperatureLogsRoutes);
app.use('/api/health-inspections', authMiddleware, healthInspectionRoutes);
app.use('/api/labor-scheduling', authMiddleware, laborSchedulingRoutes);
app.use('/api/platform-fees', authMiddleware, platformFeesRoutes);
app.use('/api/revenue', authMiddleware, revenueRoutes);
app.use('/api/delivery-zones', authMiddleware, deliveryZonesRoutes);
app.use('/api/customers', authMiddleware, customersRoutes);
app.use('/api/loyalty', authMiddleware, loyaltyRoutes);
app.use('/api/equipment', authMiddleware, equipmentRoutes);
app.use('/api/cleaning', authMiddleware, cleaningRoutes);
app.use('/api/waste', authMiddleware, wasteRoutes);
app.use('/api/profitability', authMiddleware, profitabilityRoutes);
app.use('/api/ai', authMiddleware, aiLimiter, aiRoutes);

// Apply pass 5 — additive mechanical routes
app.use('/api/customer-comms', authMiddleware, require('./routes/customerComms'));
app.use('/api/compliance', authMiddleware, require('./routes/compliance'));
app.use('/api/cannibalization', require('./routes/cannibalizationDetector'));
app.use('/api/agentic-kitchen', require('./routes/agenticKitchenAutomation'));

// Custom non-CRUD features (5) per audit. Mount the customFeatures router twice:
//   - /api/custom (auth + ai-limiter)               for everything except the public webhook
//   - /api/custom/platform-webhook                   PUBLIC for external platform POSTs only
const customRoutes = require('./routes/customFeatures');

// === Batch 04 Gaps & Frontend Mounts ===
const route_gap_no_ghost_kitchen_site_selection_ai = require('./routes/gap-no-ghost-kitchen-site-selection-ai');
const route_gap_no_brand_portfolio_optimization = require('./routes/gap-no-brand-portfolio-optimization');
const route_gap_no_ingredient_substitution_ai = require('./routes/gap-no-ingredient-substitution-ai');
const route_gap_no_driver_route_optimization = require('./routes/gap-no-driver-route-optimization');
const route_gap_no_video_based_quality_control = require('./routes/gap-no-video-based-quality-control');
const route_gap_no_payment_processing_surface = require('./routes/gap-no-payment-processing-surface');
const route_gap_no_vendor_supplier_directory_beyond_inve = require('./routes/gap-no-vendor-supplier-directory-beyond-inve');
const route_gap_no_real_time_websocket_order_board = require('./routes/gap-no-real-time-websocket-order-board');
const route_gap_no_multi_location_franchise_rollup = require('./routes/gap-no-multi-location-franchise-rollup');
const route_gap_no_file_upload_module_for_menu = require('./routes/gap-no-file-upload-module-for-menu');
// Public webhook ingester — DoorDash/UberEats/Grubhub will POST here.
// We mount the customFeatures router under the same prefix so its `router.post('/platform-webhook/:platform')` handler responds without auth.
app.use('/api/custom', (req, res, next) => {
  // Allow only the public webhook POST through without auth; everything else continues into the next mount which requires auth.
  if (req.method === 'POST' && req.path.startsWith('/platform-webhook/') && !req.path.includes('/events')) {
    return customRoutes(req, res, next);
  }
  return next();
});
// Authenticated mount for the rest.
app.use('/api/custom', authMiddleware, aiLimiter, customRoutes);

const PORT = process.env.BACKEND_PORT || 3001;


app.use('/api/gap-no-ghost-kitchen-site-selection-ai', route_gap_no_ghost_kitchen_site_selection_ai);
app.use('/api/gap-no-brand-portfolio-optimization', route_gap_no_brand_portfolio_optimization);
app.use('/api/gap-no-ingredient-substitution-ai', route_gap_no_ingredient_substitution_ai);
app.use('/api/gap-no-driver-route-optimization', route_gap_no_driver_route_optimization);
app.use('/api/gap-no-video-based-quality-control', route_gap_no_video_based_quality_control);
app.use('/api/gap-no-payment-processing-surface', route_gap_no_payment_processing_surface);
app.use('/api/gap-no-vendor-supplier-directory-beyond-inve', route_gap_no_vendor_supplier_directory_beyond_inve);
app.use('/api/gap-no-real-time-websocket-order-board', route_gap_no_real_time_websocket_order_board);
app.use('/api/gap-no-multi-location-franchise-rollup', route_gap_no_multi_location_franchise_rollup);
app.use('/api/gap-no-file-upload-module-for-menu', route_gap_no_file_upload_module_for_menu);

// === Custom Kitchen Views (4 endpoints) — mounted BEFORE 404/listen ===
const customViewsRoutes = require('./routes/customViews');
app.use('/api/custom-views', authMiddleware, customViewsRoutes);

// 404 catch-all — keep AFTER custom-views mount
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found', path: req.originalUrl }));

app.listen(PORT, () => {
  console.log(`Ghost Kitchen API server running on port ${PORT}`);
});
