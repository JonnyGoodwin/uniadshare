# Repository Guidelines

Use this guide to keep backend and frontend changes consistent for Acquisition Pods (Sparkloop-style landing pages, consent ledger, and delivery flows).

## Project Structure & Module Organization

- Backend lives at the repo root: `src/` (Fastify app in `app.ts`, entry `index.ts`), `src/routes/`, `src/services/`, `src/domain/`, `src/infra/`, shared config in `src/config/`.
- Data model is in `prisma/schema.prisma`; generated client outputs to `node_modules/.prisma`.
- Tests (Vitest) mirror `src/` in `tests/`. Docs/requirements in `info.md` and `docs/`. Infra/ops lives in `infra/`.
- Frontend is in `frontend/` (Vite + React + Tailwind). Components sit in `frontend/src/components/`, pages in `frontend/src/pages/`, shared types/api in `frontend/src/lib/`.

## Build, Test, and Development Commands

- Require Node 18.17+; install deps at repo root with `npm install`, then emit Prisma client via `npx prisma generate`.
- Backend: `npm run dev` (Fastify watch on port 3000), `npm run build` then `npm start` (compiled server), `npm test`, `npm run lint`, `npm run check` (lint + tests).
- Frontend: from `frontend/`, run `npm install`, `npm run dev` (defaults to 5173), `npm run build`, `npm run lint`, `npm run preview`.
- Swagger UI is available at `/docs` when the backend is running.

## Environment & Configuration

- Backend `.env` at repo root: `PORT` (3000 default), `DATABASE_URL` (Postgres; omitting keeps in-memory repos), `BASE_DOMAIN` (e.g., `localhost:3000` for host-based lander routing), `WEBHOOK_DEFAULT_ENDPOINT`, optional `ADMIN_API_KEY` (include as `x-admin-key` for admin routes).
- Frontend `.env` in `frontend/`: `VITE_API_BASE` (e.g., `http://localhost:3000`), `VITE_ADMIN_KEY` (mirror backend key if set). Restart `npm run dev` after changes.
- Never commit secrets; keep `.env` ignored and document new variables in `README.md`.

## Coding Style & Naming Conventions

- TypeScript + ESM; 2-space indent; `camelCase` for values, `PascalCase` for types/components.
- Keep modules small and side effects at boundaries (routes/infra). Favor typed DTOs and Zod schemas at route edges.
- Run `npm run lint` (or `npm run format` if added) before pushing. Mirror folder structure for new files and keep shared logic in `src/domain` or `src/common` equivalents.

## Testing Guidelines

- Add/extend Vitest specs in `tests/`, naming them `*.spec.ts`. Mock external I/O (webhooks, DB) via interfaces in `src/infra`.
- For features that touch APIs, add route-level tests plus service-level unit coverage. Aim to cover new logic paths and regression cases.

## Commit & Pull Request Guidelines

- Use Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- Keep commits scoped and describe the why in the body. PRs should note scope, risks, and tests run (`npm test`, `npm run lint`), and include payload samples or screenshots for UX/API changes.
