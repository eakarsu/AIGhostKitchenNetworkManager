# Apply Pass 5 — AIGhostKitchenNetworkManager
Date: 2026-05-08
Stack: Node-Express + React (Vite), Postgres `pg`.

## Verified present
- All AI counterparts complete (passes 2 & 4): `/site-selection`, `/brand-portfolio-optimize`, `/ingredient-substitution`, `/driver-route-optimization`, `/cannibalization-detection`. Total 8 + 5 = 13 AI endpoints.
- 26 non-AI route files all present.

## Implemented this pass (2 mechanical features, 13 endpoints; additive only)
1. **Customer communication queue + templates** — closes audit gap "No customer communication" + backlog "Customer communication channel".
   - `backend/routes/customerComms.js` (~120 lines): templates with `{{var}}` interpolation, queue with status state-machine (`queued|sent|failed|cancelled`), batch-dispatch endpoint that surfaces ready messages and lists required env vars for Twilio/SendGrid (`TWILIO_*`, `SENDGRID_*`).
   - Endpoints: `GET/POST /templates`, `GET/POST /queue`, `POST /queue/:id/transition`, `GET /dispatch/next`.
2. **Compliance / certification tracking** — closes audit gap "No compliance/certifications tracking" + backlog item.
   - `backend/routes/compliance.js` (~95 lines): typed certifications, expiry-window queries (7/30/60-day windows), aggregate dashboard endpoint.
   - Endpoints: `GET/POST/PUT/DELETE /api/compliance`, `GET /api/compliance/types`, `GET /api/compliance/dashboard`.
3. **Frontend** — `frontend/src/pages/Compliance.jsx` (uses existing `CrudPage` component) and `frontend/src/pages/CustomerComms.jsx` (custom tabbed UI). Both routed in `frontend/src/App.jsx` at `/compliance` and `/customer-comms`.
4. Routes wired in `backend/server.js` immediately after `/api/ai`.

## Deferred
- **Twilio / SendGrid / FCM integration** for actual message dispatch — NEEDS-CREDS (env documented at `/api/customer-comms/dispatch/next`).
- **Real foot-traffic / demographic data feed (for site-selection upgrade)** — NEEDS-CREDS.
- **DoorDash / Uber Eats / Grubhub partner APIs** — NEEDS-CREDS (existing customFeatures router has webhook ingest stub).
- **POS integration** — NEEDS-CREDS.
- **Agentic kitchen automation, workforce burnout prediction, vision-based food-safety monitoring, seasonal menu pivot advisor** — NEEDS-PRODUCT-DECISION.

## Smoke test
- `node -c` on `customerComms.js`, `compliance.js`, `server.js` — PASS.
- Did not boot full stack (Postgres). DDL idempotent.
- Template interpolation spot-check: `{{name}}` substitution + missing-var → empty string (matches docstring).
