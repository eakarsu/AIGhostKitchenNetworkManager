const express = require('express');
const router = express.Router();

router.post('/plan', (req, res) => {
  const body = req.body || {};
  const orders = Array.isArray(body.orders) ? body.orders : [];
  const stations = Array.isArray(body.stations) && body.stations.length ? body.stations : ['hot line', 'cold line', 'expo'];
  const load = Object.fromEntries(stations.map((s) => [s, 0]));
  const assignments = orders.map((order, idx) => {
    const station = stations.reduce((best, s) => load[s] < load[best] ? s : best, stations[0]);
    const minutes = Number(order.prep_minutes || 8);
    load[station] += minutes;
    return { order_id: order.id || `order-${idx + 1}`, brand: order.brand || 'brand', station, prep_minutes: minutes };
  });
  const maxLoad = Math.max(...Object.values(load), 0);
  res.json({
    load_minutes: load,
    risk_band: maxLoad > 60 ? 'overloaded' : maxLoad > 35 ? 'tight' : 'balanced',
    assignments,
    actions: maxLoad > 60 ? ['Throttle marketplace availability for the busiest brand.', 'Move cross-trained staff to the highest-load station.'] : ['Keep current station staffing.'],
    generated_at: new Date().toISOString(),
  });
});

module.exports = router;
