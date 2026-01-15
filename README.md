# Acquisition Pods

Landing-page and consent ledger requirements live in `info.md`. This repo now includes a TypeScript scaffold to build the product.

## Docs
- `docs/architecture.md` — system flow and component overview.
- `docs/integrations.md` — webhook payloads, retry rules, and admin headers.

## Quick start
- Install dependencies: `npm install`
- Run in watch mode: `npm run dev`
- Run tests: `npm test`
- Lint/format: `npm run lint` / `npm run format`
- Build for production: `npm run build` then `npm start`
- Environment: set `DATABASE_URL` for Postgres; port defaults to `3000`.

## Frontend (admin UI)
- Install frontend deps: `cd frontend && npm install`
- Run frontend: `npm run dev` (defaults to port 5173)
- Frontend env lives in `frontend/.env`:
  - `VITE_API_BASE=http://localhost:3000`
  - `VITE_ADMIN_KEY=...` (optional; match backend `ADMIN_API_KEY` if set)

## Project structure
- `src/` — application code; Fastify server lives in `app.ts`, entry point in `index.ts`.
- `src/routes/` — HTTP handlers for health checks, lead intake, etc.
- `src/config/` — environment parsing and shared configuration.
- `src/services/`, `src/domain/`, `src/infra/` — domain logic, interfaces, and in-memory/Prisma repositories.
- `tests/` — unit tests (Vitest) mirroring `src/` paths.
- `docs/` — user/developer docs; add integration notes and API contracts here.
- `infra/` — CI/CD, IaC, and operational configs as they are added.
- `AGENTS.md` — contributor guide with coding, testing, and PR expectations.
- `prisma/` — data model for campaigns, landing pages, disclosures, leads, sponsors, deliveries, suppressions.
- `docs/architecture.md` — system flow and component overview.
- `docs/integrations.md` — webhook payloads, retry rules, and admin headers.

## Development notes
- ESM + TypeScript targeting Node 18+. Adjust `tsconfig.json` if runtime differs.
- Use `npm run check` locally or in CI to run lint + tests together.
- Update `info.md` or add `docs/requirements.md` as requirements evolve; keep AGENTS.md in sync with any command changes.
- Prisma schema defined in `prisma/schema.prisma`; run `npx prisma generate` after installing dependencies to emit the client.
- Without a `DATABASE_URL`, the API uses an in-memory lead repository for local/dev; set `DATABASE_URL` to persist leads in Postgres.
- Swagger UI is available at `/docs` when the server runs.
- Env extras: `BASE_DOMAIN` enables host-based landing routing (subdomain selection), `WEBHOOK_DEFAULT_ENDPOINT` sets the delivery target for webhook adapter, `ADMIN_API_KEY` protects admin endpoints.
- New endpoints:
  - `POST /api/campaigns` → create campaign (name, subdomain).
  - `POST /api/campaigns/:campaignId/landing-versions` → create a draft landing page version (templateRef, content, optional disclosureVersionId).
  - `POST /api/campaigns/:campaignId/landing-versions/:versionId/publish` → publish a version and set it as the campaign’s current version.
  - `POST /api/campaigns/:campaignId/disclosures` → create a disclosure version (hash stored automatically).
  - `GET /api/landing/:subdomain` → fetch published landing data for rendering (campaign current version); add `?versionId=...` to preview a specific draft.
  - `GET /api/landing/:subdomain?draft=true` → fetch latest draft for preview.
  - `GET /` (host-based) → render HTML for the published landing when `BASE_DOMAIN` matches the Host header’s domain.
  - Example: with `BASE_DOMAIN=localhost:3000`, visit `http://subdomain.localhost:3000/`.
  - `POST /api/campaigns/:campaignId/sponsors` → add sponsor with webhook endpoint/role; `GET/PATCH/DELETE /api/campaigns/:campaignId/sponsors/:sponsorId` to manage.
  - `GET /api/deliveries` → list delivery attempts (filterable by leadId/sponsorId).
  - `POST /api/leads` → intake lead (email, campaignId, optional landingPageVersionId/disclosureVersionId + metadata).
