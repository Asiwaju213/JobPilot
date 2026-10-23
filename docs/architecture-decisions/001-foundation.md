# Architecture Decision Record — Phase A Foundation

Date: 2026-10-23

## 1. Decision: Backend = Fastify + TypeScript (ESM)

**Context:** The project needed a fast, modular backend with JSON validation, session-based auth, and a Prisma ORM integration. The existing codebase already used Fastify, TypeScript, and ESM.

**Decision:** Keep Fastify as the HTTP server, switch to TypeScript with `module: NodeNext` and `moduleResolution: NodeNext`, and use ESM (`"type": "module"` in package.json).

**Rationale:** Fastify is well-suited for this stack — lightweight, fast, plugin-based. TypeScript provides type safety. ESM is the standard for Node.js 24.

**Consequences:** The build uses `tsc` (not ts-node/babel). The root tsconfig has `rootDir: ./src`, so all backend source lives under `backend/src/`. Import paths use `.js` extensions (ESM + NodeNext).

---

## 2. Decision: Prisma as the ORM, one schema for the full platform

**Context:** The database layer needed to support User, Session, Profile, Cv, and future Job/Application/Notification/ScheduledSearch entities.

**Decision:** Use Prisma with a single schema (`backend/prisma/schema.prisma`). The schema covers the full platform data model from Phase 0 (a subset) through Phase 6 (all entities planned). The migration was already generated and applied.

**Rationale:** Prisma provides type-safe queries, migrations, and a clean data model. One schema keeps the domain model consistent across the stack.

**Consequences:** The Prisma client is generated in `backend/node_modules/.prisma/client/`. Type imports for `ProfileCreateInput` etc. come from `@prisma/client`, where these types live inside the `Prisma` namespace.

---

## 3. Decision: Shared enums in `shared/enums.ts`, re-exported from `backend/src/shared/enums.ts`

**Context:** Both frontend and backend needed the same enums (OpportunityType, ApplicationState, etc.) without duplication.

**Decision:** The canonical enum definitions live in `shared/enums.ts` (frontend import target). The backend imports from `backend/src/shared/enums.ts` and re-exports the same values so the frontend can resolve them cleanly.

**Rationale:** Prevents duplicate definitions and keeps the domain model in sync.

**Consequences:** The two files must be kept in sync manually (no automated cross-package sharing without npm workspaces, which was explicitly rejected).

---

## 4. Decision: Session authentication, not JWT

**Context:** The project specification explicitly requires database-backed sessions.

**Decision:** Use HTTP-only cookies with a Prisma-backed Session table. Session tokens are 32-byte hex strings stored in the database. The `onRequest` hook looks up the session on every request.

**Rationale:** Session-based auth is the specified approach. The DB-backed Session table allows server-side invalidation, expiry checks, and auditability.

**Consequences:** The `onRequest` session hook populates `request.user = { id }` for authenticated requests. All profile/account routes enforce ownership by `userId`.

---

## 5. Decision: Profile CRUD ownership enforcement via `userId` in Prisma where clauses

**Context:** The Prisma schema had `profiles.userId` as a foreign key. The code needed to prevent cross-user access.

**Decision:** Every profile query includes `userId` in the Prisma `where` clause. Delete uses `deleteMany` to avoid "record not found" errors and to only delete the owner's profile.

**Consequences:** Cross-user access returns 404 (never 403) to avoid information leakage. The `findProfileByIdForUser` helper returns null if the profile doesn't exist or belongs to another user.

---

## 6. Decision: Zod for runtime request validation

**Context:** Request bodies needed validation (email, password, profile fields).

**Decision:** Use Zod schemas for all request bodies (register, login, profile create/update). Validation errors return 400 with a structured `errors` array.

**Consequences:** Validation is centralized, testable, and produces consistent error responses.

---

## 7. Decision: bcrypt with 12 rounds for password hashing

**Context:** Passwords need strong, standards-compliant hashing.

**Decision:** Use `bcrypt` with 12 cost rounds. Passwords are hashed at registration; login uses `bcrypt.compare`.

**Consequences:** Registration is slightly slower but acceptable (~100ms). Password verification on login is also ~100ms per attempt. The cost can be raised later if needed.

---

## 8. Decision: Single Prisma client via lazy-initialized singleton

**Context:** The Prisma client is heavy (query engine, connection pool). Fastify is request-driven.

**Decision:** Provide a `prisma()` function that returns the singleton `PrismaClient`, lazy-initialized on first call. Also export `db` (the initialized instance) and `disconnect()` for graceful shutdown.

**Consequences:** The client is reused for the lifetime of the process, avoiding connection churn. The `disconnect()` call on shutdown prevents hanging connections.

---

## 9. Decision: `backend/src/shared/enums.ts` as the backend copy of shared enums

**Context:** Prisma generates TypeScript types for the backend. The shared enums must be importable from both frontend and backend.

**Decision:** Create `backend/src/shared/enums.ts` with the canonical enum definitions. The frontend imports from `../shared/enums` (relative to frontend/src). The backend imports from `./shared/enums` (relative to backend/src).

**Rationale:** Keeps the enums in one place per package and avoids package-boundary resolution issues.

---

## 10. Decision: Prisma enum types vs Zod enum types — both live separately

**Context:** The Prisma schema defines enums (PostgreSQL ENUM types). The API also accepts enum-like strings (accountStatus, experienceLevel, etc.). Both the DB and the API need to agree.

**Decision:** Prisma enums are the source of truth for DB columns. The Zod validation schemas use TypeScript enums/types for runtime validation. The mapper (`mapProfile`) converts DB values to JSON-safe strings.

**Consequences:** Different layers see different type representations. `ProfileCreateData` in `backend/src/profiles/db.ts` bridges them (using `$Enums.ProfileStatus` for DB, `string` for API-facing fields like `employmentTypePreference`).

---

## 11. Decision: `employmentTypePreference` as `string` (JSON array text) in DB

**Context:** The Prisma schema had `employmentTypePreference String` (no array type).

**Decision:** Store a JSON array as a text string (e.g., `"[\"Permanent\",\"FullTime\"]"`). Validate with a Zod string schema (max 500 chars). The handler defaults to `"[]"` if undefined.

**Rationale:** Prisma doesn't have a native array type for this field in the Phase 0 schema. Text storage is flexible and backward-compatible with the existing migration.

---

## 12. Decision: Frontend = React + Vite + React Router 6

**Context:** The project needed a frontend for React + TypeScript + Vite with routing.

**Decision:** Use React 18 with the `react-jsx` runtime (automatic JSX transform). Use React Router 6 (`BrowserRouter`, `Routes`, `Route`). Vite 5 for dev and build.

**Consequences:** Frontend tsconfig uses `jsx: react-jsx`, `moduleResolution: bundler`, and `noEmit: true` (Vite handles the build). The `@vitejs/plugin-react` plugin enables React Fast Refresh.

---

## 13. Decision: No npm workspaces; two separate packages

**Context:** The repo has a frontend and backend. npm workspaces could share dependencies.

**Decision:** Keep the frontend and backend as separate packages (`jobpilot` at root, `jobpilot-backend` in `backend/`, `jobpilot-frontend` in `frontend/`). No npm workspaces.

**Rationale:** The frontend and backend have different dependency trees. The root `package.json` is a placeholder. The repo README and AGENTS.md describe a monorepo-style structure but without npm workspaces.

---

## 14. Decision: CV ingestion = file-based, format-dispatched

**Context:** The prototype provided CV text extraction for PDF/TXT/MD.

**Decision:** Keep the prototype `src/cv/` as the ingestion layer. Format is determined by file extension (not content sniffing). PDF uses `pdf-parse`; TXT/MD use `fs.readFile`.

**Consequences:** The prototype is a stub. Phase C will add persistence, content validation, and structured extraction review. The `Cv` model (in Prisma) will store the file, text, and processing status.

---

## 15. Decision: No git repository at session start

**Context:** The repo has no `.git` directory.

**Decision:** Work without git version control. The task instructions explicitly say not to commit or push. If the user wants git, they will create the repo later.

**Consequences:** No `git status` to check before/after. All changes are additive or corrective. The user can init a repo later.
