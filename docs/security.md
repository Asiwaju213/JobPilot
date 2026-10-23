# JobPilot — Security

Last updated: 2026-10-23

## Threat Model (Summary)

| Area | Threat | Mitigation |
|---|---|---|
| Authentication | Session fixation | New session token created on login; old token invalidated on logout |
| Authentication | Session hijacking | HttpOnly, Secure (prod), SameSite=Lax cookies; 7-day TTL |
| Authentication | Brute force | Rate limiting (planned — currently manual; see below) |
| Authorization | Cross-user data access | `userId` in every Prisma where clause; ownership enforced server-side |
| API | Mass assignment / over-posting | Zod schemas; fields not in the schema are ignored |
| API | SQL injection | Prisma ORM (parameterized queries) |
| API | Request size | Body size limits (planned) |
| Files | Malicious PDFs/parsers | File type and size validation (planned); content-based validation (planned) |
| Files | Path traversal | Server-side file save with sanitized paths (planned) |
| AI | Prompt injection | CV text/jd treated as untrusted; outputs validated against schemas |
| AI | Data leakage | No CV sent to LLM without explicit consent; redaction (planned) |
| AI | LLM authorization | LLMs cannot approve sensitive actions; all sensitive actions require human approval |
| Browser | Cross-user context leakage | Isolated browser contexts per user (planned); session isolation |
| Email | Accidental bulk send | Per-message approval required (default); delivery error handling (planned) |
| Infrastructure | Secrets in source | `.env` in `.gitignore`; no credentials in code |

## Implemented Protections (Phase A–B)

- ✅ Session-based auth (opaque tokens, no JWT)
- ✅ HttpOnly, SameSite=Lax, Secure-optional cookie
- ✅ 7-day session TTL with expiry check
- ✅ Session invalidation on logout
- ✅ Session fixation protection (new token on login)
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Constant-time password comparison; same error for wrong email/password
- ✅ Zod runtime validation of all request bodies
- ✅ Ownership enforcement on profiles (userId in Prisma where clause)
- ✅ Duplicate email rejection (409)
- ✅ Email normalization (case-insensitive)
- ✅ No password or session token in API responses or logs
- ✅ TypeScript strict mode (caught type errors at compile time)

## Not Yet Implemented (Phase G–L)

- ⏳ Rate limiting (abuse controls)
- ⏳ Request body size limits
- ⏳ CSRF protection (cookie-based auth with SameSite=Lax + JSON API is a partial mitigation)
- ⏳ CORS restriction to trusted origins (currently `origin: true`)
- ⏳ Security headers (HSTS, X-Frame-Options, CSP, etc.)
- ⏳ File upload validation (type/size, content sniffing, path sanitization)
- ⏳ Uploaded file privacy (storage path controls, private access)
- ⏳ Prompt injection defenses for AI layer
- ⏳ Rate limiting for AI provider calls
- ⏳ Email verification workflow
- ⏳ Account recovery (password reset flow)
- ⏳ Audit logging for sensitive actions
- ⏳ Secret storage with encryption (StoredSecret model exists; encryption not implemented)

## Verified

- ✅ Login returns 401 for both nonexistent email and wrong password (no enumeration)
- ✅ Session tokens are not returned in API responses (only the user snapshot)
- ✅ Profile ownership is enforced: user A cannot view/update/delete user B's profiles
- ✅ Logout invalidates the session (subsequent /api/auth/me returns 401)

## Recommended Next Steps (Phase L)

1. Add rate limiting (fastify-rate-limit or similar).
2. Restrict CORS origin to the configured frontend domain.
3. Add security headers (helmet or manual).
4. Implement account recovery (password reset) with email verification.
5. Implement file upload security (validation, private storage, access control).
6. Implement audit logging for sensitive actions.
7. Add threat-model review with penetration testing before production.
