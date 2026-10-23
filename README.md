# JobPilot

Personal AI-powered job search and application assistant.

## Stack

- **Runtime:** Node.js + TypeScript (ESM)
- **Database:** PostgreSQL 18 + Prisma ORM
- **Frontend (future):** React + TypeScript + Vite
- **AI layer:** modular — swappable LLM provider
- **Browser automation (future):** Playwright via Hermes

## Phase 1 — Project architecture and CV/profile management

- [ ] Initialize project (Node + TypeScript)
- [ ] Set up Prisma schema for candidate profiles
- [ ] Build CV ingestion — read CV file, extract text
- [ ] Build structured candidate profile from CV text
- [ ] Store profile in PostgreSQL

## Rules

- Do not install dependencies without explicit approval.
- Do not jump ahead to later phases.
- Keep the AI layer modular and swappable.
- Require human approval before any application is submitted.
- Database migrations go through Prisma.
- TypeScript strict mode is non-negotiable.
# JobPilot
