/**
 * POST /api/auth/logout
 *
 * Invalidates the current session and clears the session cookie.
 * Safe to call when already logged out.
 *
 * Behaviour:
 *   - Deletes the session from the database if a valid token exists
 *   - Clears the session cookie
 *   - Returns 200 even if there was no active session
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../db/prisma.js";

export async function handleLogout(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const token = request.cookies?.session;

  if (token) {
    // Use deleteMany to avoid "record not found" errors if session doesn't exist
    try {
      await prisma().session.deleteMany({ where: { token } });
    } catch (error) {
      request.log.error(error, "Database error during session deletion");
      // Continue to clear the cookie even if DB deletion failed
    }
  }

  reply.clearCookie("session", { path: "/" });
  return { message: "Logged out" };
}
