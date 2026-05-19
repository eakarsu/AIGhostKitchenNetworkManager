# Audit Apply Notes — AIGhostKitchenNetworkManager

Audit source: `_AUDIT/reports/batch_04.md` (#13). Verdict: substantive (26 routes, 8 AI endpoints).

## Original recommendations

Missing AI counterparts:
- `/ghost-kitchen-site-selection`
- `/brand-portfolio-optimization`
- `/ingredient-substitution`
- `/driver-route-optimization`

## Implementations applied

Added three AI endpoints to `backend/routes/ai.js`:

1. `POST /api/ai/site-selection` — scores candidate locations across demographics, competition density, courier supply, rent, expected orders.
2. `POST /api/ai/brand-portfolio-optimize` — pulls existing per-brand performance; AI returns recommended brand mix with weights, candidates to test, drop candidates, cannibalization risks.
3. `POST /api/ai/ingredient-substitution` — given recipe + missing ingredient + dietary restrictions; AI returns ranked substitutes with flavor/texture/cost impact.

All use existing `callOpenRouter`, `parseAIJson`, `saveAiResult`. Schema-tolerant. Syntax-checked.

## Backlog (prioritized)

### Mechanical
- `/driver-route-optimization` — needs delivery-zone + driver model integration.
- Cross-brand cannibalization detection (deeper analysis).

### Needs creds / external
- Real foot-traffic / demographic data feed.
- DoorDash / Uber Eats / Grubhub partner APIs.
- POS integration.

### Needs product decision
- Customer communication channel.
- Compliance / certification tracking workflow.

### Custom features
- Agentic kitchen automation (real-time station orchestration).
- Workforce burnout prediction.
- Real-time vision-based food safety monitoring.
- Seasonal menu pivot advisor.

## Apply pass 3 (frontend)

Action: **LEFT-AS-IS** — frontend already wired.

- `frontend/src/pages/AISiteSelection.jsx`, `AIBrandPortfolio.jsx`, `AIIngredientSubstitution.jsx` cover the three apply2 endpoints (`/api/ai/site-selection`, `/api/ai/brand-portfolio-optimize`, `/api/ai/ingredient-substitution`).
- All AI pages route through `components/AIPage.jsx`, which POSTs to `/api/ai/${endpoint}` with JWT Bearer from `localStorage` and surfaces backend errors (503-no-key passes through).
- No FE changes made. Log: `_AUDIT/apply3_logs/ab3_56.md`.

## Apply pass 4 (mechanical backlog)

Action: **LEFT-AS-IS** — both MECHANICAL items already present.

Verified existing implementations:
- `POST /api/ai/driver-route-optimization` in `backend/routes/ai.js` (drivers + delivery_zones + pending orders -> bundled-route plan; `callOpenRouter` + `parseAIJson` + `saveAiResult`; 503-on-no-key via `aiErrorStatus()`).
- `POST /api/ai/cannibalization-detection` in `backend/routes/ai.js` (per-brand revenue + cross-brand menu overlap -> overlap pairs + portfolio actions; same helper stack and 503 mapping).
- FE pages `frontend/src/pages/AIDriverRouteOptimization.jsx` and `AICannibalizationDetection.jsx` already POST via `components/AIPage.jsx` (JWT bearer from localStorage, server errors surfaced).

Remaining backlog deferred per audit note (NEEDS-CREDS / NEEDS-PRODUCT-DECISION / custom features). `node --check backend/routes/ai.js` PASS. Log: `_AUDIT/apply4_logs/ab3_56.md`.
