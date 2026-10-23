/**
 * JobPilot backend — application route registration.
 *
 * This module registers all HTTP routes and server hooks on the Fastify
 * instance. For Phase 0 it provides only a health check endpoint. Later
 * steps add auth, user, profile, and CV routes here.
 *
 * Keeping route registration separate from the server bootstrap (index.ts)
 * makes the route set easier to test and to extend.
 */

import Fastify, { FastifyRequest } from "fastify";
import { prisma } from "./db/prisma.js";
import {
  handleRegister,
  handleLogin,
  handleMe,
  handleLogout,
} from "./auth/index.js";
import {
  handleCreateProfile,
  handleListProfiles,
  handleGetProfile,
  handleUpdateProfile,
  handleDeleteProfile,
} from "./profiles/index.js";
import {
  handleCreateCv,
  handleListCvs,
  handleGetCv,
  handleDeleteCv,
} from "./cv/index.js";

// ── Request extension: authenticated user ───────────────────────────────────
// After the session-authentication hook runs, request.user is populated with
// the authenticated user's ID (or undefined when not authenticated).
declare module "fastify" {
  interface FastifyRequest {
    user?: { id: string };
  }
}

export async function registerApp(server: Fastify.FastifyInstance) {
  // ── Session authentication hook ──────────────────────────────────────────
  // Runs on every request. If a valid session cookie is present, attaches the
  // authenticated user's ID to request.user so downstream handlers can enforce
  // ownership without repeating the session lookup.
  server.addHook("onRequest", async (request, reply) => {
    const token = request.cookies?.session;
    if (!token) {
      return; // no session cookie — request.user stays undefined
    }
    try {
      const session = await prisma().session.findUnique({
        where: { token },
        select: { id: true, userId: true, expiresAt: true },
      });
      if (!session) {
        return; // invalid token — request.user stays undefined
      }
      if (session.expiresAt < new Date()) {
        // Expired — clean up and treat as unauthenticated
        await prisma()
          .session.delete({ where: { id: session.id } })
          .catch(() => {});
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (request as any).user = { id: session.userId };
    } catch (error) {
      request.log.error(error, "Session lookup failed");
      // Don't fail the request on DB errors — just treat as unauthenticated
    }
  });

  // Health check endpoint — useful for load balancers and deployment probes.
  // Phase 0: also verifies that the database is reachable by executing a
  // trivial Prisma query. If the database is down, this endpoint returns
  // 503 so that orchestrators can distinguish "app running" from "app healthy".
  server.get("/api/health", async (request, reply) => {
    try {
      // Use $queryRaw with a literal to avoid Prisma type-generation dependency
      // on any specific table existing. This just checks that a connection
      // can be established and a query executed.
      await prisma().$queryRaw`SELECT 1`;
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
      };
    } catch (error) {
      request.log.error(error, "Health check database query failed");
      reply.code(503);
      return {
        status: "degraded",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: String(error),
      };
    }
  });

  // TODO: add user routes, profile routes, CV routes,
  // job discovery routes, application routes, etc.

  // ── Auth routes ──────────────────────────────────────────────────────────
  // Phase 1: session-cookie authentication (register, login, logout, me).
  // These endpoints use the existing Prisma client (backend/src/db/prisma.ts)
  // and the existing cookie plugin configuration (registered in index.ts).
  server.post("/api/auth/register", handleRegister);
  server.post("/api/auth/login", handleLogin);
  server.get("/api/auth/me", handleMe);
  server.post("/api/auth/logout", handleLogout);

  // ── Profile routes ───────────────────────────────────────────────────────
  // Phase 1: profile CRUD for the authenticated user. Every profile
  // operation is scoped to the authenticated user's ID — a user can never
  // see, update, or delete another user's profiles.
  server.post("/api/profiles", handleCreateProfile);
  server.get("/api/profiles", handleListProfiles);
  server.get("/api/profiles/:id", handleGetProfile);
  server.patch("/api/profiles/:id", handleUpdateProfile);
  server.delete("/api/profiles/:id", handleDeleteProfile);

  // ── CV routes ────────────────────────────────────────────────────────────
  // Phase 1: CV upload, listing, retrieval, and deletion. CV files are
  // stored privately in the local storage directory. Text extraction and
  // structured profile building are wired up (stub today).
  server.post("/api/cvs", handleCreateCv);
  server.get("/api/cvs", handleListCvs);
  server.get("/api/cvs/:id", handleGetCv);
  server.delete("/api/cvs/:id", handleDeleteCv);
}
