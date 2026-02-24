# Acquisition Pods Frontend

Admin UI for managing campaigns, landing versions, sponsors, and delivery/consent monitoring.

## Requirements
- Node 18.17+

## Setup
1. Install dependencies:
   - `npm install`
2. Create `frontend/.env`:
   - `VITE_API_BASE=http://localhost:3000`
   - `VITE_ADMIN_KEY=...` (optional; set if backend uses `ADMIN_API_KEY`)

## Commands
- `npm run dev` - start Vite dev server (default `http://localhost:5173`)
- `npm run build` - type-check and build production assets
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Backend dependency
The frontend expects the backend API running on `VITE_API_BASE`.

## Admin-protected endpoints
When backend `ADMIN_API_KEY` is configured, the frontend sends `x-admin-key` for admin routes such as:
- `GET /api/deliveries`
- `GET /api/consent`
