# JobPilot — Architecture

## Overview

JobPilot is a personal AI-powered job search and application assistant. Users create a career profile and upload a CV, and JobPilot matches them to opportunities, prepares applications, and tracks results.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v24 + TypeScript (ESM) |
| Backend | Fastify 5 + @fastify/cookie + @fastify/cors |
| Database | PostgreSQL 18 + Prisma 5 ORM |
| Validation | Zod 3 |
| Password hashing | bcrypt 5 |
| AI layer | Modular — pluggable provider interface (future) |
| Frontend | React 18 + Vite 5 + React Router 6 + TypeScript |
| CV parsing | pdf-parse (PDF text extraction) |

## Directory Structure

```
JobPilot/
├── backend/          # Fastify backend (TypeScript, ESM)
│   ├── src/
│   │   ├── app.ts       # Route registration + onRequest auth hook
│   │   ├── index.ts     # Server bootstrap + graceful shutdown
│   │   ├── config.ts    # Environment configuration
│   │   ├── db/prisma.ts # Prisma client singleton
│   │   ├── auth/        # Auth route handlers
│   │   ├── profiles/    # Profile route handlers
│   │   ├── shared/      # Shared enums (backend copy)
│   │   └── cv/          # CV ingestion (prototype)
│   ├── prisma/
│   │   ├── schema.prisma   # Prisma schema
│   │   └── migrations/     # Prisma migrations
│   └── node_modules/
├── frontend/         # React + Vite frontend (TypeScript)
│   └── src/
│       ├── pages/       # React pages
│       └── App.tsx
├── shared/           # Shared enums/types (frontend import target)
├── docs/             # Architecture, decisions, security, testing, status
└── package.json      # Root workspace (monorepo root placeholder)
```

## Component Responsibilities

- **backend/src/app.ts**: Registers all HTTP routes and the `onRequest` session-authentication hook. Every authenticated request has `request.user.id` populated.
- **backend/src/auth/**: Session-based authentication (register, login, logout, current-user) using HTTP-only cookies and bcrypt.
- **backend/src/profiles/**: Profile CRUD with ownership enforcement (scoped by `userId`).
- **backend/src/db/prisma.ts**: Lazy-initialized PrismaClient singleton with graceful disconnect on shutdown.
- **backend/src/config.ts**: Centralized environment-variable access with no hard-coded secrets.
- **backend/prisma/schema.prisma**: Full database schema including User, Session, Profile, Cv, Job, Source, JobDiscovery, JobMatch, Application, ScheduledSearch, Notification, StoredSecret, AuditLog.
- **frontend/: Pages**: React components for the UI.
- **shared/enums.ts**: Shared enums/types (re-exported from `backend/src/shared/enums.ts`).

## Request Flow

```
Browser
  │
  ▼
React Router (frontend)
  │  GET /api/*  (API calls with credentials)
  ▼
Fastify server
  │
  ▼
onRequest hook → session cookie lookup → request.user = { id }
  │
  ▼
Route handler → Prisma query → response
```

## Authentication & Session Management

- Session tokens are opaque, cryptographically random (32 bytes hex).
- Session TTL: 7 days.
- Cookie: `HttpOnly`, `SameSite=Lax`, `secure` in production.
- Session lookup happens on every request (`onRequest` hook).
- Password hashing: bcrypt with 12 rounds.
- Login uses a constant-time comparison and does not reveal whether the email or password was incorrect.

## Database Lifecycle

- PrismaClient is a lazy-initialized singleton (`prisma()` function, `db` export).
- On Fastify shutdown (`SIGINT`/`SIGTERM`), `prisma.$disconnect()` is called.
- Migrations are stored in `backend/prisma/migrations/`.

## Environment Configuration

- `DATABASE_URL`: PostgreSQL connection string (loaded via `dotenv/config`).
- `COOKIE_SECRET`: Secret used by @fastify/cookie for session signing.
- `PORT`: HTTP port (default 8080).
- `HOST`: Host to bind to (default 0.0.0.0).

All environment access is centralized in `backend/src/config.ts`. The `.env` file is in `.gitignore`.

## Design Principles

1. **Approval-first**: No application is submitted without explicit human approval.
2. **Modular AI**: AI provider is an interface, not a hard dependency.
3. **Type safety**: Strict TypeScript everywhere; no `any` without a documented reason.
4. **Database via Prisma**: All schema changes go through Prisma migrations.
5. **Phase discipline**: Build features in phase order (A, B, C, ... L).
