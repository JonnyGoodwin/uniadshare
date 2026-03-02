# Acquisition Pods Frontend

Admin UI for managing pods, landing versions, sponsors, and delivery/consent monitoring.

## Requirements
- Node 18.17+

## Setup
1. Install dependencies:
   - `npm install`
2. Create `frontend/.env`:
   - `VITE_API_BASE=http://localhost:3000`

## Commands
- `npm run dev` - start Vite dev server (default `http://localhost:5173`)
- `npm run build` - type-check and build production assets
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Backend dependency
The frontend expects the backend API running on `VITE_API_BASE`.

## Authentication
- The app now uses admin login at `POST /api/auth/login`.
- Configure backend admin credentials with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- After login, the frontend stores a bearer session token and sends it on admin API calls.
