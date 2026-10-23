# JobPilot — Testing

Last updated: 2026-10-23

## Test Strategy

- **Unit tests**: Pure functions (CV parsing, profile building, matching rules).
- **Integration tests**: API endpoints with a test database; verify state changes.
- **End-to-end tests**: Full user journeys (register → login → create profile → CV upload → match → apply).
- **Manual/Bash tests**: The existing `auth_test.sh` covers basic auth; expand it.

## Current Status

| Test Area | Status | Evidence |
|---|---|---|
| Registration | ✅ Done | `POST /api/auth/register` → 201; duplicate → 409 |
| Login | ✅ Done | `POST /api/auth/login` → 200; 401 for bad creds |
| Current user | ✅ Done | `GET /api/auth/me` → 200 with user; 401 when logged out |
| Logout | ✅ Done | `POST /api/auth/logout` → 200; session invalidated |
| Profile CRUD | ✅ Done | Create, list, get, update, delete all verified |
| Ownership | ✅ Done | User A cannot view user B's profiles (404) |
| TypeScript | ✅ Done | `npx tsc --noEmit` → exit 0 (both backend and frontend) |
| Runtime | ✅ Done | Server starts; health check returns `database: connected` |

## Test Commands

### Backend

```bash
cd backend
npm run build        # tsc
npm run db:generate  # prisma generate
npm run db:migrate   # prisma migrate dev
npm run db:studio    # prisma studio
```

### Frontend

```bash
cd frontend
npm run build        # tsc && vite build
npm run dev          # vite dev server (port 3000)
```

### Root

```bash
npm run build        # root build (placeholder)
```

## Manual Test Checklist (verified)

- [x] Register new account
- [x] Login with correct credentials
- [x] Login with wrong password → 401
- [x] Login with nonexistent email → 401
- [x] Duplicate registration → 409
- [x] Email case normalization (Mixed@Example.COM → normalized)
- [x] `/api/auth/me` returns user when authenticated
- [x] `/api/auth/me` returns 401 when not authenticated
- [x] `/api/auth/logout` invalidates session
- [x] Profile create (201)
- [x] Profile list (200)
- [x] Profile get (200 / 404)
- [x] Profile update (200 / 404)
- [x] Profile delete (200 / 404)
- [x] Cross-user isolation (cannot access another user's profiles)

## Untested Workflows

- [ ] CV upload + extraction
- [ ] Job discovery from external sources
- [ ] Job matching (rule-based + AI)
- [ ] Application lifecycle (draft → approved → submitted)
- [ ] Browser automation workflows
- [ ] Email draft generation and sending
- [ ] Scheduled searches
- [ ] Password recovery
- [ ] Account deletion

## Test Data & Accounts

- Synthetic test accounts should be created with clearly identifiable emails (e.g., `test1@example.com`).
- The test database (`jobpilot`) is used for local testing. Do not run destructive migrations against production.
