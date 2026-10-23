/**
 * POST /api/auth/register
 *
 * Registers a new user account.
 *
 * Validation:
 *   - Email: required, valid format, max 255 chars, normalized to lowercase
 *   - Password: required, min 8 chars, max 128 chars
 *
 * Behaviour:
 *   - Rejects duplicate emails with 409 Conflict
 *   - Hashes password with bcrypt (salt rounds 12) before storage
 *   - Never stores or returns plaintext password
 *   - Returns 201 with public user snapshot on success
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../db/prisma.js";
import { registerSchema, mapUser } from "./types.js";
import { hash } from "bcrypt";

const BCRYPT_ROUNDS = 12;

export async function handleRegister(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // ── Validate body ──────────────────────────────────────────────────────
  const body = request.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return reply.code(400).send({ message: "Invalid request body" });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.errors.map(
      (e) => `${e.path.join(".")}: ${e.message}`,
    );
    return reply.code(400).send({
      message: "Validation failed",
      errors,
    });
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  // ── Check for duplicate email ───────────────────────────────────────────
  try {
    const existing = await prisma().user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return reply.code(409).send({
        message: "An account with this email already exists",
      });
    }
  } catch (error) {
    request.log.error(error, "Database error during registration check");
    return reply.code(500).send({ message: "Internal server error" });
  }

  // ── Hash password ───────────────────────────────────────────────────────
  let passwordHash: string;
  try {
    passwordHash = await hash(password, BCRYPT_ROUNDS);
  } catch (error) {
    request.log.error(error, "Password hashing failed");
    return reply.code(500).send({ message: "Internal server error" });
  }

  // ── Create user ─────────────────────────────────────────────────────────
  try {
    const user = await prisma().user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
      },
    });
    return reply.code(201).send({ user: mapUser(user) });
  } catch (error) {
    request.log.error(error, "Database error during user creation");
    return reply.code(500).send({ message: "Internal server error" });
  }
}
