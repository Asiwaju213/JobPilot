/**
 * GET /api/auth/me
 *
 * Returns the authenticated user's public account information based on the
 * session cookie. Returns 401 if there is no valid session.
 *
 * Behaviour:
 *   - Reads the session cookie
 *   - Looks up the session in the database
 *   - Rejects expired sessions
 *   - Never returns passwordHash
 *   - Safe to call when logged out (returns 401)
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../db/prisma.js";
import { mapUser } from "./types.js";

export async function handleMe(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const token = request.cookies?.session;

  if (!token) {
    return reply.code(401).send({ message: "Not authenticated" });
  }

  // ── Look up session ──────────────────────────────────────────────────────
  let session;
  try {
    session = await prisma().session.findUnique({
      where: { token },
      include: { user: true },
    });
  } catch (error) {
    request.log.error(error, "Database error during session lookup");
    return reply.code(500).send({ message: "Internal server error" });
  }

  if (!session) {
    return reply.code(401).send({ message: "Not authenticated" });
  }

  // ── Check expiration ─────────────────────────────────────────────────────
  if (session.expiresAt < new Date()) {
    // Clean up expired session
    try {
      await prisma().session.delete({ where: { id: session.id } });
    } catch (_) {
      // Best-effort cleanup — don't fail the request if cleanup fails
    }
    return reply.code(401).send({ message: "Session expired" });
  }

  return { user: mapUser(session.user) };
}
