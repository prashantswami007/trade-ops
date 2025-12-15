# TradeOps Simulator

A full-stack demo for ingesting equity trades via XML, settling them with business rules, and presenting realtime dashboard metrics.

## Stack

- Frontend: React + Vite + Tailwind CSS 4 ([`TradeOpsApp`](frontend/src/App.jsx))
- Backend: Express + PostgreSQL ([`server.js`](backend/src/server.js))
- Database: Postgres schema & seed scripts ([`db/schema.sql`](backend/db/schema.sql), [`db/seed.sql`](backend/db/seed.sql))

## Quick Start

### 1) Clone & install

```bash
# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

### 2) Database

Provision a PostgreSQL database, then run:

```bash
psql "$DATABASE_URL" -f backend/db/schema.sql
psql "$DATABASE_URL" -f backend/db/seed.sql   # optional sample data
```

To reset:

```bash
psql "$DATABASE_URL" -f backend/db/truncate.sql
```

### 3) Environment

Backend `.env` (example):

```bash
PORT=3001
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/tradeops?sslmode=require
```

Frontend `.env`:

```bash
VITE_API_BASE=http://localhost:3001/api
```

### 4) Run

```bash
# backend (from backend/)
npm run dev   # or: npm start

# frontend (from frontend/)
npm run dev
```

Frontend will default to `http://localhost:5173`, backend to `http://localhost:3001`.

## API

- `POST /api/upload-trades` — upload XML file (field name `trades`); see sample format in [`TradeOpsApp`](frontend/src/App.jsx).
- `GET /api/trades` — list trades with client names.
- `GET /api/dashboard-stats` — aggregate metrics for volume, commissions, and failures.
- `GET /health` — health check.

## XML Sample

A ready-made example lives at [`sample-data/trades.xml`](backend/sample-data/trades.xml). The UI also shows & copies a minimal snippet for quick testing.

## Scripts

Backend ([`package.json`](backend/package.json)):
- `npm run dev` — start with nodemon.
- `npm start` — start server.

Frontend ([`package.json`](frontend/package.json)):
- `npm run dev` — Vite dev server.
- `npm run build` — production build.
- `npm run preview` — preview built assets.
- `npm run lint` — ESLint checks.

## Notes

- CORS is configured to allow `http://localhost:5173` and the Render frontend URL in [`server.js`](backend/src/server.js).
- Tailwind CSS is enabled via Vite plugin ([`vite.config.js`](frontend/vite.config.js)) with `@tailwindcss/vite`.
