/**
 * GET /api/profiles/:id — Retrieve a single profile.
 *
 * Validation:
 *   - Requires a valid authenticated session
 *   - The profile ID must be a valid UUID
 *   - The profile must exist AND belong to the authenticated user
 *
 * Behaviour:
 *   - Returns 404 if the profile doesn't exist or belongs to another user
 *   - Never exposes another user's profiles or internal fields (userId)
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { findProfileByIdForUser } from "./db.js";
import { mapProfile, profileIdSchema } from "./types.js";

export async function handleGetProfile(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  // ── Authenticate ────────────────────────────────────────────────────────
  const userId = request.user?.id;
  if (!userId) {
    return reply.code(401).send({ message: "Not authenticated" });
  }

  // ── Validate profile ID ─────────────────────────────────────────────────
  const parsedId = profileIdSchema.safeParse(request.params.id);
  if (!parsedId.success) {
    return reply.code(400).send({
      message: "Validation failed",
      errors: ["id: Invalid profile ID"],
    });
  }

  // ── Find profile (ownership-enforced) ───────────────────────────────────
  try {
    const profile = await findProfileByIdForUser(parsedId.data, userId);
    if (!profile) {
      return reply.code(404).send({ message: "Profile not found" });
    }
    return { profile: mapProfile(profile) };
  } catch (error) {
    request.log.error(error, "Database error while retrieving profile");
    return reply.code(500).send({ message: "Internal server error" });
  }
}
