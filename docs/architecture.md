# Architecture Overview

This system manages campaigns, landing pages, disclosures, and lead delivery to sponsors.

## Core Flow
1. Create a campaign with a `subdomain`.
2. Add sponsors (optional) with webhook endpoints.
3. Create a landing page version and publish it.
4. Render or fetch the landing via:
   - HTML: `http://<subdomain>.localhost:PORT/` (requires `BASE_DOMAIN`)
   - JSON: `GET /api/landing/:subdomain`
5. Capture leads via `POST /api/leads` with a disclosure version ID.
6. Enqueue deliveries to sponsor webhooks and track attempts in the delivery queue.

## Key Components
- Fastify API: routes in `src/routes/` with Zod validation.
- Services: `src/services/` contains campaign, disclosure, lead, and delivery orchestration.
- Data layer: in-memory repositories by default; Prisma-backed repos when `DATABASE_URL` is set.
- Frontend: `frontend/` provides an admin UI for campaigns, sponsors, landing versions, and delivery monitoring.

## Data Sources & Persistence
- Without `DATABASE_URL`, data is ephemeral and resets on server restart.
- With Postgres configured, Prisma persists campaigns, disclosures, leads, delivery attempts, and sponsors.

## Delivery & Retry
- Lead ingestion triggers webhook deliveries per sponsor.
- Webhooks retry up to 3 times with 5s timeouts, using linear backoff.
