# JobPilot — Integrations

Last updated: 2026-10-23

## Job Discovery Sources

Job discovery is implemented via a source-adapter architecture. Each adapter implements the `JobSource` interface. Adapters are registered in the `Source` table.

### Planned Adapters

| Source | Adapter | Access | Status |
|---|---|---|---|
| Internal/example | Local JSON file | Test data | Prototype placeholder |
| LinkedIn | LinkedIn API | Requires login/credentials | Not started |
| Indeed | Indeed API | Requires API key | Not started |
| Glassdoor | Glassdoor API | Requires key/credentials | Not started |
| Adzuna | Adzuna API | Requires API key | Not started |
| Built-in RSS/feed | RSS/Atom | Public feeds | Not started |
| Company career pages | Scraper | Per-page | Not started |

### Requirements for Each Adapter

Each source adapter must support:

- **Search and pagination** — search with page/limit, return paginated results.
- **Normalization** — map source fields to canonical `Job` fields.
- **Source identifiers and canonical URLs** — `sourceJobId`, `applicationUrl`.
- **Publication and closing dates** — `discoveredAt`, `lastCheckedAt`, `deadline`.
- **Location and work arrangement** — `locationNormalized`, `workArrangement`.
- **Job description and requirements** — `descriptionText`, `requiredSkills`.
- **Rate limits, retries, timeouts** — built into the adapter.
- **Attribution and provenance** — `sourceId`, `sourceJobId`.
- **Incremental refreshes** — `lastSeenAt`, `lastCheckedAt`.

### Research Required

Before implementing any adapter, verify:

1. Official API documentation (available endpoints, authentication, rate limits).
2. Terms of service for automated collection.
3. Whether the source requires CAPTCHA/bot protection (do not bypass).
4. Whether the source has a free tier or requires paid subscription.

## Email Provider

Email is used for:

- Account verification emails (planned)
- Password reset emails (planned)
- Application submission notifications (planned)
- Scheduled search result notifications (planned)

### Planned Provider Abstraction

An `EmailService` interface with provider adapters:

| Provider | Status |
|---|---|
| Resend | Not started |
| SendGrid | Not started |
| SMTP (custom) | Not started |
| Email dev / Mailtrap (dev) | Not started |

### Requirements

- Replaceable provider (switch by config).
- Per-message approval required (default).
- Delivery error handling and retries.
- Prevention of accidental bulk sending.
- Never log email content or recipient addresses.

## AI Provider

The AI layer is a modular, swappable interface. The matching engine and CV extraction use AI where it adds value; deterministic rules are used where they are more reliable.

### Planned Providers

| Provider | Status |
|---|---|
| OpenAI-compatible (local compat) | Not started |
| Anthropic Claude | Not started |
| OpenRouter (multi-provider) | Not started |
| Ollama (local) | Not started |

### AI Use Cases

- **CV structured extraction** — parse CV text into structured candidate profile.
- **Match scoring** — AI-assisted matching where deterministic rules are uncertain.
- **Cover letter generation** — generate tailored cover letters from profile + job.
- **Application responses** — draft answers to application form questions.

### Requirements

- Structured output validated against Zod schemas (no insecure LLM output).
- Prompt versioning with each match record.
- Cost tracking (per-request).
- Provider failures handled gracefully (fallback to rule-based matching).
- No CV sent to AI without explicit user consent.
- No secrets or unnecessary personal information sent to LLM providers.

## Browser Automation

Browser automation uses Playwright (via Hermes) to open job application pages, fill forms, and submit applications.

### Security Requirements

- Isolated browser contexts per user (no cross-user leakage).
- No credentials or session tokens shared.
- No CAPTCHA, MFA, or access control bypass.
- Human approval checkpoint before final submission.
- Submission evidence captured (screenshots, form data).

### Supported Workflows

- Open supported job application pages.
- Identify required form fields.
- Fill fields from approved profile.
- Attach the correct CV.
- Prepare answers for review.
- Detect missing information and unsupported questions.
- Pause for human intervention when needed.
- Capture submission evidence.
- Report success, failure, or uncertainty honestly.

## Storage

### Phase 0: Local filesystem

- CV files stored in `backend/storage/` (relative path in `Cv.storagePath`).
- Private: not publicly accessible via HTTP.

### Future: S3-compatible object storage

- `Cv.storageUrl` will be set for remote blob storage.
- `Cv.storagePath` remains for local backup/legacy access.

## Database

- PostgreSQL 18 with Prisma 5 ORM.
- Migrations in `backend/prisma/migrations/`.
- The full schema includes User, Session, Profile, Cv, ExtractedCvData, Job, Source, JobDiscovery, JobMatch, Application, ScheduledSearch, Notification, StoredSecret, AuditLog.
