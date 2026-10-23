/**
 * GET /api/profiles — List all profiles for the authenticated user.
 *
 * Validation:
 *   - Requires a valid authenticated session
 *
 * Behaviour:
 *   - Returns only profiles belonging to the authenticated user
 *   - Never returns another user's profiles
 *   - Ordered by creation date descending
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { findProfilesForUser } from "./db.js";
import { mapProfile } from "./types.js";

export async function handleListProfiles(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // ── Authenticate ────────────────────────────────────────────────────────
  const userId = request.user?.id;
  if (!userId) {
    return reply.code(401).send({ message: "Not authenticated" });
  }

  // ── Find profiles for user (ownership-enforced) ─────────────────────────
  try {
    const profiles = await findProfilesForUser(userId);
    return { profiles: profiles.map(mapProfile) };
  } catch (error) {
    request.log.error(error, "Database error while listing profiles");
    return reply.code(500).send({ message: "Internal server error" });
  }
}
