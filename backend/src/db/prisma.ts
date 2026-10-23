/**
 * JobPilot Prisma database client.
 *
 * Exports a singleton PrismaClient instance that is lazily initialised on
 * first access. The client reads its connection URL from the Prisma schema
 * datasource (backend/prisma/schema.prisma), which in turn reads
 * DATABASE_URL from the environment (loaded by dotenv/config in index.ts).
 *
 * Usage:
 *   import { prisma } from "./db/prisma.js";
 *   const users = await prisma.user.findMany();
 *
 * Lifecycle:
 *   - The client is created once and reused for the lifetime of the process.
 *   - On Fastify shutdown (process signal or server.close), call prisma.$disconnect()
 *     to release database connections cleanly.
 *
 * Phase 0 scope: this module only provides the client. No queries are executed
 * here; query code lives in route handlers and service modules added in later
 * steps.
 */

import { PrismaClient } from "@prisma/client";

let _prisma: PrismaClient | undefined;

/**
 * Return the shared PrismaClient instance, creating it on first call.
 *
 * Lazy initialisation keeps the startup path simple (no database connection
 * is opened until something actually queries the database). For a long-running
 * server this is fine because the client is reused for every request.
 */
export function prisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient();
  }
  return _prisma;
}

/**
 * Expose the client directly as a value for convenience.
 *
 * Importers can use either:
 *   import { prisma } from "./db/prisma.js";  // function call
 *   import { db } from "./db/prisma.js";      // direct reference
 *
 * Both return the same underlying instance.
 */
export const db = prisma();

/**
 * Gracefully disconnect the PrismaClient and release all database connections.
 *
 * Call this during application shutdown (e.g. on SIGTERM, or after
 * Fastify#close() completes) to avoid hanging database connections.
 */
export async function disconnect(): Promise<void> {
  if (_prisma) {
    await _prisma.$disconnect();
    _prisma = undefined;
  }
}
