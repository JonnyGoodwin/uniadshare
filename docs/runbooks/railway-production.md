# Railway Production Runbook

Use this runbook to deploy the backend with a persistent Postgres database on Railway.

## 1) Prepare migrations locally

1. Set a local Postgres `DATABASE_URL`.
2. Create a migration for any schema change:
   - `npm run prisma:migrate:dev -- --name <change-name>`
3. Commit both:
   - `prisma/schema.prisma`
   - `prisma/migrations/**`

Initial migration already exists in this repo at:
- `prisma/migrations/20260302110000_init/migration.sql`

## 2) Create Railway services

1. Create a new Railway project.
2. Add a `PostgreSQL` service.
3. Add this backend repo as a service in the same project.
4. Ensure the backend service has `DATABASE_URL` from the Postgres service reference.

## 3) Configure backend environment variables

Set these on the backend service:

- `NODE_ENV=production`
- `DATABASE_URL=<Railway Postgres connection string>`
- `BASE_DOMAIN=<your-domain>` (required for host-based landing routes)
- `WEBHOOK_DEFAULT_ENDPOINT=<default delivery endpoint>` (recommended)
- `ADMIN_EMAIL=<admin login email>`
- `ADMIN_PASSWORD=<admin login password>`
- `AUTH_SESSION_SECRET=<long random secret>`
- `AUTH_TOKEN_TTL_HOURS=12` (optional override)

`PORT` is provided by Railway at runtime.

## 4) Deploy behavior

This repo includes `railway.json` with:
- Build: Nixpacks
- Start command: `npm run start:railway`

`start:railway` runs:

```bash
npm run prisma:migrate:deploy && npm run start
```

So each deploy applies committed Prisma migrations before booting the API.

## 5) Verify in production

1. Check service logs for successful migration output (`prisma migrate deploy`).
2. Confirm `GET /health` returns `ok`.
3. Create a test pod and lead via API to verify DB writes persist across restarts.

## 6) Ongoing schema changes

For every schema change:

1. Generate migration locally (`prisma:migrate:dev`).
2. Commit migration files.
3. Deploy to Railway.
4. Railway startup applies migration automatically via `start:railway`.
