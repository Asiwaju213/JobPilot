/**
 * PATCH /api/profiles/:id — Update a profile.
 *
 * Validation:
 *   - Requires a valid authenticated session
 *   - The profile ID must be a valid UUID
 *   - Body must be a valid object with optional fields per updateProfileSchema
 *   - Profile must exist and belong to the authenticated user
 *   - Duplicate profile name for the same user returns 409
 *   - userId cannot be changed through the body (unknown fields are stripped)
 *
 * Behaviour:
 *   - Partial update: only provided fields are changed
 *   - Returns the updated profile on success
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { updateProfileSchema, profileIdSchema } from "./types.js";
import { findProfileByIdForUser, updateProfileForUser } from "./db.js";
import { mapProfile } from "./types.js";

export async function handleUpdateProfile(
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

  // ── Validate body ────────────────────────────────────────────────────────
  const body = request.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return reply.code(400).send({ message: "Invalid request body" });
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.errors.map(
      (e) => `${e.path.join(".")}: ${e.message}`,
    );
    return reply.code(400).send({
      message: "Validation failed",
      errors,
    });
  }

  const data = parsed.data;

  // ── Sanitize: never allow userId to be changed ──────────────────────────
  // Zod strips unknown keys, but this is defence in depth in case the schema
  // is loosened later.
  delete (data as Record<string, unknown>).userId;

  // ── Find profile (ownership check) ──────────────────────────────────────
  let existing;
  try {
    existing = await findProfileByIdForUser(parsedId.data, userId);
  } catch (error) {
    request.log.error(error, "Database error while checking profile ownership");
    return reply.code(500).send({ message: "Internal server error" });
  }
  if (!existing) {
    return reply.code(404).send({ message: "Profile not found" });
  }

  // ── Update profile ───────────────────────────────────────────────────────
  try {
    const updated = await updateProfileForUser(parsedId.data, userId, data);
    return { profile: mapProfile(updated) };
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      return reply.code(409).send({
        message: "A profile with this name already exists for your account",
      });
    }
    if (isPrismaNotFoundError(error)) {
      // The profile was deleted between the ownership check and the update.
      return reply.code(404).send({ message: "Profile not found" });
    }
    request.log.error(error, "Database error during profile update");
    return reply.code(500).send({ message: "Internal server error" });
  }
}

function isPrismaUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}

function isPrismaNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2025"
  );
}
