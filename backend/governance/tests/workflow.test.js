'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluate } = require('../domain');

test('domain workflow accepts a reviewable, grounded case', () => {
  const evaluation = evaluate({
  location: { id: 'kitchen-1', capacityOrdersPerHour: 20 },
  menu: [{ id: 'meal-1', allergens: ['soy'], ingredients: [{ sku: 'rice', quantity: 1 }] }],
  inventory: [{ sku: 'rice', available: 12 }],
  orders: [{ id: 'order-1', itemId: 'meal-1', declaredAllergens: ['dairy'],
    price: 18, foodCost: 6, platformFee: 2, refund: 0 }]
});
  assert.deepEqual(evaluation.errors, []);
  assert.equal(evaluation.result.decision, 'reviewable');
  assert.ok(Array.isArray(evaluation.assumptions));
  assert.equal(typeof evaluation.uncertainty, 'object');
});

test('domain workflow fails closed on unsafe or incomplete input', () => {
  const evaluation = evaluate({ location: { id: 'k', capacityOrdersPerHour: 1 }, menu: [], inventory: [], orders: [{ id: 'o', itemId: 'missing' }] });
  assert.ok(evaluation.errors.length > 0);
  assert.notEqual(evaluation.result.decision, 'reviewable');
});
