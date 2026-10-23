/**
 * JobPilot backend — Phase 0 API skeleton.
 *
 * Boots the Fastify server with CORS and cookie plugins registered.
 * The application route definitions live in src/app.ts.
 *
 * For Phase 0, this establishes the server startup pattern. Real routes
 * (auth, users, profiles, CVs) will be added in subsequent steps.
 */
import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";

import { registerApp } from "./app.js";
import { disconnect as disconnectPrisma } from "./db/prisma.js";

async function main() {
  const server = Fastify({ logger: true });

  // CORS: allows browsers from other origins to call the API with credentials.
  // In production, restrict `origin` to the known frontend domain.
  await server.register(cors, {
    origin: true,
    credentials: true,
  });

  // Cookie parser: required so the server can read session cookies sent
  // by the browser. The secret signs the cookie; change it in production.
  await server.register(cookie, {
    secret: process.env.COOKIE_SECRET || "change-me-in-production",
  });

  // Application routes (health check, and later auth / user / profile / CV)
  await registerApp(server);

  const port = Number(process.env.PORT) || 8080;
  const host = process.env.HOST || "0.0.0.0";

  // Graceful shutdown: disconnect Prisma and close the HTTP server.
  const shutdown = async (signal: string) => {
    server.log.info(`Received ${signal}. Shutting down...`);
    try {
      await server.close();
      await disconnectPrisma();
      server.log.info("Shutdown complete.");
    } catch (err) {
      server.log.error(err, "Error during shutdown");
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  try {
    await server.listen({ port, host });
    console.log(`Backend listening on http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
