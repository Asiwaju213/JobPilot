/**
 * DELETE /api/profiles/:id — Delete a profile.
 *
 * Validation:
 *   - Requires a valid authenticated session
 *   - The profile ID must be a valid UUID
 *   - The profile must exist AND belong to the authenticated user
 *   - Returns 404 if the profile doesn't exist or belongs to another user
 *
 * Behaviour:
 *   - Deletes the profile if owned by the authenticated user
 *   - Returns 200 with a success message on deletion
 *   - Respects Prisma relation/delete behaviour (onDelete: Cascade where
 *     configured; related records that do not cascade will block deletion)
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { deleteProfileForUser } from "./db.js";
import { profileIdSchema } from "./types.js";

export async function handleDeleteProfile(
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

  // ── Delete profile (ownership-enforced) ─────────────────────────────────
  try {
    const deleted = await deleteProfileForUser(parsedId.data, userId);
    if (!deleted) {
      return reply.code(404).send({ message: "Profile not found" });
    }
    return { message: "Profile deleted" };
  } catch (error) {
    request.log.error(error, "Database error while deleting profile");
    return reply.code(500).send({ message: "Internal server error" });
  }
}
