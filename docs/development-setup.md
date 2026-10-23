# JobPilot — Development Setup

Last updated: 2026-10-23

## Prerequisites

- Node.js v24 (LTS or current)
- npm 11
- PostgreSQL 18 (local, default port 5432)
- A terminal with bash (git-bash/MSYS on Windows)

## 1. Clone and install

```bash
# Root (workspace-level manifest)
cd JobPilot
npm install     # installs root devDependencies only (tsx, typescript, @types/node)
```

### Backend

```bash
cd backend
npm install     # backend dependencies (fastify, prisma, bcrypt, zod, pdf-parse, etc.)
npm run db:generate   # generate Prisma client
npm run db:migrate    # apply migrations
npm run db:studio     # open Prisma Studio
```

### Frontend

```bash
cd frontend
npm install     # frontend dependencies (react, react-dom, react-router-dom, vite, etc.)
```

## 2. Configure environment

Copy `.env.example` to `.env` in both `backend/` and `frontend/`:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `.env` with your database URL and cookie secret. The `backend/.env` file is already present with masked credentials for local development.

Required variables (`backend/.env`):

```
DATABASE_URL="postgresql://postgres:***@localhost:5432/jobpilot"
COOKIE_SECRET="5391d7...7d97"
```

## 3. Start the backend

```bash
cd backend
npm run dev          # tsx watch src/index.ts
```

The server starts on `http://localhost:8080`. Health check: `GET /api/health`.

## 4. Start the frontend

```bash
cd frontend
npm run dev          # vite dev server (port 3000)
```

The frontend is served from `http://localhost:3000`. Vite proxies API calls to the backend (configured in `frontend/vite.config.ts`).

## 5. Database lifecycle

- Check migrations: `npm run db:studio`
- Apply pending migrations: `npm run db:migrate`
- Regenerate client: `npm run db:generate`
- Reset database (destructive — do this only locally and with backup): `npm run db:push`

## 6. Scripts

### Backend scripts (`backend/package.json`)

| Script | Command |
|---|---|
| `npm run dev` | `tsx watch src/index.ts` |
| `npm run build` | `tsc` |
| `npm start` | `node dist/index.js` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:push` | `prisma db push` |
| `npm run db:studio` | `prisma studio` |

### Frontend scripts (`frontend/package.json`)

| Script | Command |
|---|---|
| `npm run dev` | `vite` |
| `npm run build` | `tsc && vite build` |
| `npm run preview` | `vite preview` |

## 7. Credentials and Secrets

- Never commit `.env` (it is in `.gitignore`).
- Never share `DATABASE_URL` or `COOKIE_SECRET` in chat, logs, or commits.
- Store API keys for job sources, email providers, and AI providers in `backend/.env` as `STORED_SECRET` records (model `stored_secrets`).

## 8. Known Working State

- Backend: Node.js v24, TypeScript strict, Fastify 5, Prisma 5, PostgreSQL 18.
- Frontend: React 18, TypeScript, Vite 5, React Router 6.
- Auth: session-based with HTTP-only cookies; all CRUD verified.
- No external credentials are required for local development beyond the database.

## 9. Troubleshooting

### Backend won't start

1. Check PostgreSQL is running: `pg_isready` (or `psql -h localhost -U postgres`).
2. Check `DATABASE_URL` in `backend/.env` points to a reachable database.
3. Run `npm run db:generate` then `npm run db:migrate` to apply migrations.
4. Check that `COOKIE_SECRET` is set.

### Frontend won't start

1. Check `VITE_API_BASE_URL` in `frontend/.env` points to the backend origin.
2. The Vite dev server proxies `/api` requests to the backend.

### Prisma client out of sync

1. Run `npm run db:generate` to regenerate the client.
2. Run `npm run db:migrate` to apply any new migrations.
3. Restart the backend.
