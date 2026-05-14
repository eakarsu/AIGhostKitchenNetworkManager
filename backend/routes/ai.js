const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const pool = require('../db');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

function parseAIJson(text) {
  try { return JSON.parse(text); } catch (_) {}
  const stripped = text.replace(/```(?:json)?\n?/g, '').trim();
  try { return JSON.parse(stripped); } catch (_) {}
  const start = text.indexOf('{'); const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) { try { return JSON.parse(text.slice(start, end + 1)); } catch (_) {} }
  return { raw_response: text };
}

async function callOpenRouter(systemPrompt, userPrompt) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Ghost Kitchen Network Manager',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.choices || !data.choices[0]) throw new Error('Invalid API response');
  return { content: data.choices[0].message.content, model: data.model || MODEL };
}

async function saveAiResult(userId, toolName, inputSnapshot, result) {
  try {
    await pool.query(
      'INSERT INTO ai_results (user_id, tool_name, input_snapshot, result, model) VALUES ($1,$2,$3,$4,$5)',
      [userId, toolName, JSON.stringify(inputSnapshot), typeof result === 'string' ? result : JSON.stringify(result), MODEL]
    );
  } catch (err) {
    console.error('Failed to save AI result:', err.message);
  }
}

// POST /menu-optimization
router.post('/menu-optimization', async (req, res) => {
  try {
    const { brand_name, current_menu, platform_data } = req.body;
    const systemPrompt = `You are an expert ghost kitchen menu optimization consultant. Return JSON with structure: {"performance_analysis": {"top_items": [], "underperformers": [], "margin_issues": []}, "recommended_changes": [{"item": "", "change": "", "reason": "", "expected_impact": ""}], "new_item_suggestions": [{"name": "", "estimated_cost": "", "estimated_price": "", "rationale": ""}], "pricing_adjustments": [{"item": "", "current_price": "", "recommended_price": "", "reason": ""}], "summary": ""}`;
    const userPrompt = `Analyze the menu for "${brand_name}".\n\nCurrent Menu:\n${JSON.stringify(current_menu, null, 2)}\n\nPlatform Data:\n${JSON.stringify(platform_data, null, 2)}\n\nReturn JSON only.`;
    const { content } = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await saveAiResult(req.user?.id, 'menu-optimization', { brand_name }, parsed);
    res.json({ success: true, result: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /brand-concept
router.post('/brand-concept', async (req, res) => {
  try {
    const { cuisine_type, target_market, location } = req.body;
    const systemPrompt = 'You are a creative virtual restaurant brand strategist specializing in ghost kitchens. Generate a complete virtual brand concept including: Brand Name, Tagline, Menu Theme, Target Demographics, Recommended Menu Items (with prices), Brand Voice & Personality, Social Media Strategy, and Competitive Advantages.';
    const userPrompt = `Create a virtual restaurant brand concept for:\n\nCuisine Type: ${cuisine_type}\nTarget Market: ${target_market}\nLocation: ${location}\n\nProvide a complete brand concept with all details.`;
    const { content: aiContent } = await callOpenRouter(systemPrompt, userPrompt);
    const result = parseAIJson(aiContent);
    await saveAiResult(req.user?.id, req.route?.path?.replace("/","") || "ai-tool", req.body, result);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /demand-forecast
router.post('/demand-forecast', async (req, res) => {
  try {
    const { brand_name, location, historical_data } = req.body;
    const systemPrompt = 'You are a demand forecasting analyst for ghost kitchens. Analyze the data and provide detailed forecasts including: Peak Hours Prediction, Day-of-Week Trends, Seasonal Adjustments, Recommended Prep Quantities, Staffing Recommendations, and Inventory Planning suggestions. Use specific numbers and percentages.';
    const userPrompt = `Provide a demand forecast for "${brand_name}" located at ${location}.\n\nHistorical Data:\n${JSON.stringify(historical_data, null, 2)}\n\nProvide detailed demand forecasting with specific numbers.`;
    const { content: aiContent } = await callOpenRouter(systemPrompt, userPrompt);
    const result = parseAIJson(aiContent);
    await saveAiResult(req.user?.id, req.route?.path?.replace("/","") || "ai-tool", req.body, result);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /sentiment-analysis
router.post('/sentiment-analysis', async (req, res) => {
  try {
    const { brand_name, reviews } = req.body;
    const systemPrompt = 'You are a customer review sentiment analysis expert for restaurants. Analyze the reviews and provide: Overall Sentiment Score (1-10), Key Positive Themes, Key Negative Themes, Urgent Issues to Address, Customer Satisfaction Trends, and Specific Actionable Improvements. Be specific and reference actual review content.';
    const userPrompt = `Analyze customer reviews for "${brand_name}".\n\nReviews:\n${JSON.stringify(reviews, null, 2)}\n\nProvide detailed sentiment analysis with actionable insights.`;
    const { content: aiContent } = await callOpenRouter(systemPrompt, userPrompt);
    const result = parseAIJson(aiContent);
    await saveAiResult(req.user?.id, req.route?.path?.replace("/","") || "ai-tool", req.body, result);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /dynamic-pricing
router.post('/dynamic-pricing', async (req, res) => {
  try {
    const { brand_name, menu_items, demand_data, competitor_prices } = req.body;
    const systemPrompt = 'You are a dynamic pricing strategist for ghost kitchen delivery platforms. Analyze the data and provide: Current Price Analysis, Recommended Price Adjustments (with specific amounts), Peak/Off-Peak Pricing Strategy, Platform-Specific Pricing, Bundle/Combo Suggestions with prices, and Projected Revenue Impact.';
    const userPrompt = `Provide dynamic pricing recommendations for "${brand_name}".\n\nMenu Items:\n${JSON.stringify(menu_items, null, 2)}\n\nDemand Data:\n${JSON.stringify(demand_data, null, 2)}\n\nCompetitor Prices:\n${JSON.stringify(competitor_prices, null, 2)}\n\nProvide specific pricing strategies and recommendations.`;
    const { content: aiContent } = await callOpenRouter(systemPrompt, userPrompt);
    const result = parseAIJson(aiContent);
    await saveAiResult(req.user?.id, req.route?.path?.replace("/","") || "ai-tool", req.body, result);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /social-media
router.post('/social-media', async (req, res) => {
  try {
    const { brand_name, brand_concept, target_audience, platform } = req.body;
    const systemPrompt = 'You are a social media content creator specializing in food brands and ghost kitchens. Create engaging social media content including: 5 Post Ideas with captions, Hashtag Strategy (15-20 relevant hashtags), Content Calendar (1 week), Story/Reel Concepts, Engagement Strategies, and Brand Voice Guidelines. Make content trendy and appetizing.';
    const userPrompt = `Create social media content for "${brand_name}".\n\nBrand Concept: ${brand_concept}\nTarget Audience: ${target_audience}\nPlatform: ${platform}\n\nProvide a complete social media content strategy.`;
    const { content: aiContent } = await callOpenRouter(systemPrompt, userPrompt);
    const result = parseAIJson(aiContent);
    await saveAiResult(req.user?.id, req.route?.path?.replace("/","") || "ai-tool", req.body, result);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /low-stock-agent — reads actual inventory from DB and suggests POs
router.post('/low-stock-agent', async (req, res) => {
  try {
    const inventoryResult = await pool.query(
      `SELECT name as item_name, quantity, unit, min_threshold, supplier
       FROM inventory
       WHERE (quantity <= min_threshold AND min_threshold IS NOT NULL) OR quantity IS NULL
       ORDER BY quantity ASC
       LIMIT 20`
    ).catch(() => ({ rows: [] }));
    const lowStockItems = inventoryResult.rows;

    const systemPrompt = `You are an inventory management AI for a ghost kitchen. Analyze low-stock items and return JSON: {"purchase_orders": [{"item": "", "current_qty": 0, "recommended_order_qty": 0, "unit": "", "supplier": "", "urgency": "immediate|urgent|normal", "reason": ""}], "total_items_flagged": 0, "immediate_action_required": [], "summary": ""}`;
    const userPrompt = `These inventory items are at or below minimum threshold:\n${JSON.stringify(lowStockItems, null, 2)}\n\nGenerate purchase order recommendations. Return JSON only.`;

    const { content } = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await saveAiResult(req.user?.id, 'low-stock-agent', { item_count: lowStockItems.length }, parsed);
    res.json({ success: true, low_stock_items: lowStockItems, recommendations: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /profitability-analysis — reads actual revenue+food cost data
router.post('/profitability-analysis', async (req, res) => {
  try {
    const [revenueData, foodCostData] = await Promise.all([
      pool.query('SELECT b.name as brand_name, SUM(r.gross_revenue) as revenue, SUM(r.orders_count) as orders FROM revenue_records r LEFT JOIN brands b ON b.id = r.brand_id GROUP BY b.name ORDER BY revenue DESC LIMIT 10').catch(() => ({ rows: [] })),
      pool.query('SELECT id, ingredient_cost, packaging_cost, labor_cost, total_cost, selling_price FROM food_costs ORDER BY total_cost DESC LIMIT 10').catch(() => ({ rows: [] })),
    ]);

    const systemPrompt = `You are a ghost kitchen profitability analyst. Analyze revenue and food cost data. Return JSON: {"overall_margin_estimate": "", "brand_analysis": [{"brand": "", "revenue": 0, "estimated_margin_percent": 0, "recommendation": ""}], "cost_reduction_opportunities": [{"area": "", "potential_savings": "", "action": ""}], "summary": ""}`;
    const userPrompt = `Revenue by brand:\n${JSON.stringify(revenueData.rows)}\n\nTop food costs:\n${JSON.stringify(foodCostData.rows)}\n\nReturn profitability analysis JSON.`;

    const { content } = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await saveAiResult(req.user?.id, 'profitability-analysis', {}, parsed);
    res.json({ success: true, result: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /site-selection — score candidate locations for a new ghost kitchen
router.post('/site-selection', async (req, res) => {
  try {
    const { candidate_locations = [], target_cuisines = [], delivery_radius_miles = 5 } = req.body || {};
    if (!Array.isArray(candidate_locations) || candidate_locations.length === 0) {
      return res.status(400).json({ error: 'candidate_locations array required' });
    }

    const existingZones = await pool.query(
      `SELECT zone_name, AVG(orders_per_day) AS avg_orders FROM delivery_zones GROUP BY zone_name LIMIT 50`
    ).catch(() => ({ rows: [] }));

    const systemPrompt = `You are a ghost-kitchen real-estate analyst. Score each candidate location for a new ghost kitchen across demographics, competition, courier supply, rent, and delivery-time accessibility. Return STRICT JSON.`;
    const userPrompt = `Candidate locations: ${JSON.stringify(candidate_locations, null, 2)}
Target cuisines: ${JSON.stringify(target_cuisines)}
Delivery radius: ${delivery_radius_miles} miles
Existing delivery zone performance: ${JSON.stringify(existingZones.rows)}

Return JSON:
{
  "summary": "...",
  "ranked_locations": [
    { "location": "string", "score_0_100": 0,
      "demographic_fit": "low|medium|high",
      "competition_density": "low|medium|high",
      "courier_supply": "low|medium|high",
      "estimated_rent_usd_sqft": 0,
      "expected_orders_per_day": 0,
      "rationale": "string" }
  ],
  "top_pick": "string",
  "risks": ["..."],
  "disclaimer": "Estimate; verify with real foot-traffic / delivery API data."
}`;

    const { content } = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await saveAiResult(req.user?.id, 'site-selection', { candidates: candidate_locations.length }, parsed);
    res.json({ success: true, result: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /brand-portfolio-optimize — recommend which brands to operate given capacity
router.post('/brand-portfolio-optimize', async (req, res) => {
  try {
    const { available_brands = [], kitchen_capacity_orders_per_day, time_horizon_days = 90 } = req.body || {};

    const brandPerf = await pool.query(
      `SELECT b.id, b.name, b.cuisine, COALESCE(SUM(r.gross_revenue), 0) AS revenue,
              COALESCE(SUM(r.orders_count), 0) AS orders
       FROM brands b
       LEFT JOIN revenue_records r ON r.brand_id = b.id
       GROUP BY b.id`
    ).catch(() => ({ rows: [] }));

    const systemPrompt = `You are a ghost-kitchen portfolio strategist. Recommend a brand mix that fits the kitchen capacity and maximizes margin while minimizing cannibalization. Return STRICT JSON.`;
    const userPrompt = `Brand performance: ${JSON.stringify(brandPerf.rows)}
Available brands (catalog): ${JSON.stringify(available_brands)}
Kitchen capacity (orders/day): ${kitchen_capacity_orders_per_day || 'unspecified'}
Time horizon: ${time_horizon_days} days

Return JSON:
{
  "summary": "...",
  "recommended_portfolio": [
    { "brand": "string", "weight_pct": 0, "expected_orders_per_day": 0, "rationale": "string" }
  ],
  "candidates_to_test": ["..."],
  "drop_candidates": ["..."],
  "cannibalization_risks": [{ "brand_a": "", "brand_b": "", "concern": "" }],
  "disclaimer": "string"
}`;

    const { content } = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await saveAiResult(req.user?.id, 'brand-portfolio-optimize', { brand_count: brandPerf.rows.length }, parsed);
    res.json({ success: true, result: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /ingredient-substitution — suggest substitutes when item unavailable
router.post('/ingredient-substitution', async (req, res) => {
  try {
    const { recipe_id, missing_ingredient, dietary_restrictions = [] } = req.body || {};
    if (!missing_ingredient) {
      return res.status(400).json({ error: 'missing_ingredient is required' });
    }

    let recipe = null;
    if (recipe_id) {
      const r = await pool.query('SELECT * FROM recipes WHERE id = $1', [recipe_id]).catch(() => ({ rows: [] }));
      recipe = r.rows[0] || null;
    }

    const systemPrompt = `You are a culinary expert. Recommend ingredient substitutes that preserve flavor profile, texture, and dietary needs while showing nutritional and cost impact. Return STRICT JSON only.`;
    const userPrompt = `Recipe: ${JSON.stringify(recipe)}
Missing ingredient: ${missing_ingredient}
Dietary restrictions: ${JSON.stringify(dietary_restrictions)}

Return JSON:
{
  "summary": "...",
  "substitutes": [
    {
      "ingredient": "string",
      "ratio": "string e.g. 1:1",
      "flavor_impact": "string",
      "texture_impact": "string",
      "dietary_compatible": true,
      "estimated_cost_per_unit_usd": 0,
      "estimated_calorie_change_pct": 0
    }
  ],
  "preferred_substitute": "string",
  "warnings": ["..."],
  "disclaimer": "string"
}`;

    const { content } = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await saveAiResult(req.user?.id, 'ingredient-substitution', { missing_ingredient }, parsed);
    res.json({ success: true, result: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper: map missing-API-key errors to 503 Service Unavailable.
function aiErrorStatus(err) {
  const msg = (err && err.message) || '';
  if (/OPENROUTER_API_KEY/i.test(msg) || /not configured/i.test(msg)) return 503;
  return 500;
}

// POST /driver-route-optimization — optimize delivery routes across active drivers
router.post('/driver-route-optimization', async (req, res) => {
  try {
    const { time_window = 'next 2 hours', constraints = {} } = req.body || {};

    const drivers = await pool.query(
      `SELECT id, name, vehicle_type, status, current_zone_id, capacity_orders, shift_start, shift_end
       FROM drivers WHERE status IN ('active','available','on_shift') LIMIT 50`
    ).catch(() => ({ rows: [] }));

    const zones = await pool.query(
      `SELECT id, name, polygon_geojson, base_eta_min FROM delivery_zones LIMIT 50`
    ).catch(() => ({ rows: [] }));

    const orders = await pool.query(
      `SELECT id, brand_id, delivery_address, delivery_zone_id, items, status, placed_at
       FROM orders WHERE status IN ('pending','assigned','preparing','ready') ORDER BY placed_at LIMIT 200`
    ).catch(() => ({ rows: [] }));

    const systemPrompt = `You are a last-mile delivery routing strategist for ghost kitchens. Produce a bundled-route plan that minimizes total drive time and food temperature decay while respecting driver capacity, shift windows, and zone boundaries. Return STRICT JSON only.`;
    const userPrompt = `Time window: ${time_window}
Constraints: ${JSON.stringify(constraints)}
Drivers: ${JSON.stringify(drivers.rows)}
Delivery zones: ${JSON.stringify(zones.rows)}
Pending orders: ${JSON.stringify(orders.rows.slice(0, 100))}

Return JSON:
{
  "summary": "...",
  "assignments": [
    { "driver_id": 0, "driver_name": "string", "ordered_stops": [{"order_id": 0, "sequence": 1, "rationale": "string"}], "estimated_minutes": 0, "estimated_miles": 0 }
  ],
  "unassigned_orders": [{ "order_id": 0, "reason": "string" }],
  "expected_total_minutes": 0,
  "warnings": ["..."],
  "disclaimer": "Plan is advisory; verify against live traffic and driver availability."
}`;

    const { content } = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await saveAiResult(req.user?.id, 'driver-route-optimization', { drivers: drivers.rows.length, orders: orders.rows.length }, parsed);
    res.json({ success: true, result: parsed });
  } catch (err) {
    res.status(aiErrorStatus(err)).json({ success: false, error: err.message });
  }
});

// POST /cannibalization-detection — detect cross-brand cannibalization within the network
router.post('/cannibalization-detection', async (req, res) => {
  try {
    const { lookback_days = 60 } = req.body || {};

    const brandPerf = await pool.query(
      `SELECT b.id, b.name, b.cuisine,
              COALESCE(SUM(r.gross_revenue), 0) AS revenue,
              COALESCE(SUM(r.orders_count), 0) AS orders
       FROM brands b
       LEFT JOIN revenue_records r ON r.brand_id = b.id
       GROUP BY b.id`
    ).catch(() => ({ rows: [] }));

    const overlap = await pool.query(
      `SELECT m.brand_id, m.name AS item_name, m.category, m.price
       FROM menus m LIMIT 500`
    ).catch(() => ({ rows: [] }));

    const systemPrompt = `You are a virtual-brand portfolio analyst. Detect cross-brand cannibalization where two or more brands operating from the same network compete for the same demand pool. Quantify overlap by cuisine, price tier, and menu items. Return STRICT JSON only.`;
    const userPrompt = `Lookback: ${lookback_days} days
Brand performance: ${JSON.stringify(brandPerf.rows)}
Menu items across brands: ${JSON.stringify(overlap.rows.slice(0, 200))}

Return JSON:
{
  "summary": "...",
  "cannibalization_pairs": [
    {
      "brand_a": "string", "brand_b": "string",
      "overlap_score": 0,
      "overlap_drivers": ["cuisine", "price_tier", "menu_items"],
      "shared_items": ["..."],
      "estimated_revenue_loss_pct": 0,
      "recommendation": "string"
    }
  ],
  "low_overlap_pairs": [{ "brand_a": "string", "brand_b": "string", "note": "string" }],
  "portfolio_actions": ["..."],
  "disclaimer": "Estimates are heuristic; validate with controlled price/menu tests."
}`;

    const { content } = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(content);
    await saveAiResult(req.user?.id, 'cannibalization-detection', { brands: brandPerf.rows.length, lookback_days }, parsed);
    res.json({ success: true, result: parsed });
  } catch (err) {
    res.status(aiErrorStatus(err)).json({ success: false, error: err.message });
  }
});

module.exports = router;
