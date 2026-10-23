/**
 * JobPilot backend — environment configuration.
 *
 * Reads environment variables (loaded from .env by dotenv/config in index.ts)
 * and exposes them as a typed object. This centralizes all process.env access
 * so it is easy to see what the backend expects and to add validation later.
 *
 * Required environment variables (Phase 0):
 * - DATABASE_URL       PostgreSQL connection string (used by Prisma)
 * - COOKIE_SECRET      Secret used to sign session cookies
 *
 * Optional environment variables (Phase 0):
 * - PORT               HTTP port (default 8080)
 * - HOST               Host to bind to (default 0.0.0.0)
 *
 * The Prisma schema at backend/prisma/schema.prisma reads DATABASE_URL
 * via env("DATABASE_URL").
 */

export const config = {
  databaseUrl: process.env.DATABASE_URL,
  cookieSecret: process.env.COOKIE_SECRET || "change-me-in-production",
  port: Number(process.env.PORT) || 8080,
  host: process.env.HOST || "0.0.0.0",
};
