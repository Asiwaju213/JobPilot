/**
 * POST /api/profiles — Create a new profile for the authenticated user.
 *
 * Validation:
 *   - Requires a valid authenticated session (session cookie)
 *   - Body must be a valid object
 *   - Profile name is required, must be a non-empty string ≤ 200 chars
 *   - Other fields are optional but validated for type/length when present
 *   - Duplicate profile name for the same user returns 409
 *
 * Behaviour:
 *   - Creates a profile owned by the authenticated user
 *   - Never exposes passwordHash, session tokens, or other users' data
 *   - Returns 201 with the created profile on success
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { createProfileSchema } from "./types.js";
import { createProfileForUser } from "./db.js";
import { mapProfile } from "./types.js";

export async function handleCreateProfile(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // ── Authenticate ────────────────────────────────────────────────────────
  const userId = request.user?.id;
  if (!userId) {
    return reply.code(401).send({ message: "Not authenticated" });
  }

  // ── Validate body ────────────────────────────────────────────────────────
  const body = request.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return reply.code(400).send({ message: "Invalid request body" });
  }

  const parsed = createProfileSchema.safeParse(body);
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

  // ── Enforce default for required-but-unspecified Prisma fields ──────────
  // employmentTypePreference is required in the DB with no @default.
  if (data.employmentTypePreference === undefined) {
    data.employmentTypePreference = "[]";
  }

  // ── Create profile ───────────────────────────────────────────────────────
  try {
    const profile = await createProfileForUser(userId, data);
    return reply.code(201).send({ profile: mapProfile(profile) });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      return reply.code(409).send({
        message: "A profile with this name already exists for your account",
      });
    }
    request.log.error(error, "Database error during profile creation");
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