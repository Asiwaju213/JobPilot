# JobPilot — Agent Development Rules

## Project overview

JobPilot is a personal AI-powered job search and application assistant. It reads your CV, builds a structured candidate profile, searches for relevant jobs, compares job descriptions against your profile, tracks applications, and eventually applies on your behalf — always requiring your approval first.

## Stack

- **Runtime:** Node.js + TypeScript (ESM)
- **Database:** PostgreSQL 18 + Prisma ORM
- **Frontend (future):** React + TypeScript + Vite
- **AI layer:** modular and swappable — never hard-code a specific LLM provider
- **Browser automation (future):** Playwright via Hermes

## Core principles

1. **Approval-first.** No application is ever submitted without explicit human approval. The system may draft, suggest, and prepare — but the final submit is always you.
2. **Modular AI.** The AI/LLM layer is an interface, not a hard dependency on one provider. Swapping providers should be a config change, not a rewrite.
3. **Type safety.** Strict TypeScript everywhere. No `any` without a documented reason and a follow-up ticket to remove it.
4. **Database via Prisma.** All schema changes go through Prisma migrations. No ad-hoc SQL in application code.
5. **Phase discipline.** Do not build features from later phases during an earlier phase. Phase 1 is CV/profile management only.

## Development workflow

- Install dependencies only when explicitly approved.
- Run `npm run dev` for development (tsx watch).
- Run `npm run build` to compile before committing or shipping.
- Keep the `.env` file out of version control — it is in `.gitignore`.
- Database credentials live in `.env` and are never hard-coded.

## Code conventions

- ESM imports everywhere (`"type": "module"` in package.json).
- File names: kebab-case for modules, PascalCase for components/types.
- Exports: named exports preferred over default exports.
- Error handling: no swallowed errors. Log or propagate.
- Testing: add tests for core logic (CV parsing, profile building, matching) when those modules are created.

## What not to do

- Do not hard-code API keys, DB URLs, or credentials.
- Do not build job search, browser automation, or email sending during Phase 1.
- Do not skip the Prisma schema step when the database layer is added.
- Do not merge AI-provider-specific logic into shared modules.

## Environment

- Node.js v24
- npm 11
- PostgreSQL 18 running locally on default port
- Windows 11 development machine
- Working directory: `C:\Users\kalej\JobPilot`
