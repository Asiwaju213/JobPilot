/**
 * POST /api/auth/login
 *
 * Authenticates a user with email and password, creates a new session,
 * and sets a session cookie.
 *
 * Validation:
 *   - Email: required, valid format, max 255 chars, normalized to lowercase
 *   - Password: required, max 128 chars
 *
 * Behaviour:
 *   - Does NOT reveal whether the email or password was incorrect
 *     (both cases return 401 with the same message)
 *   - Creates a fresh session on successful login (prevents session fixation)
 *   - Sets an HttpOnly session cookie
 *   - Never returns or logs the password or session token
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../db/prisma.js";
import { loginSchema, mapUser } from "./types.js";
import { compare } from "bcrypt";
import { randomBytes } from "node:crypto";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function handleLogin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // ── Validate body ──────────────────────────────────────────────────────
  const body = request.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return reply.code(400).send({ message: "Invalid request body" });
  }

  const parsed = loginSchema.safeParse(body);
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

  // ── Find user ───────────────────────────────────────────────────────────
  let user;
  try {
    user = await prisma().user.findUnique({
      where: { email: normalizedEmail },
    });
  } catch (error) {
    request.log.error(error, "Database error during login lookup");
    return reply.code(500).send({ message: "Internal server error" });
  }

  if (!user) {
    // Don't reveal that the email doesn't exist — same message as wrong password
    return reply.code(401).send({ message: "Invalid email or password" });
  }

  // ── Verify password ─────────────────────────────────────────────────────
  let passwordValid = false;
  try {
    passwordValid = await compare(password, user.passwordHash);
  } catch (error) {
    // If the stored hash is corrupted, treat as authentication failure
    request.log.error(error, "Password comparison failed");
    return reply.code(401).send({ message: "Invalid email or password" });
  }

  if (!passwordValid) {
    return reply.code(401).send({ message: "Invalid email or password" });
  }

  // ── Create new session (prevents session fixation) ─────────────────────
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  try {
    await prisma().session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });
  } catch (error) {
    request.log.error(error, "Database error during session creation");
    return reply.code(500).send({ message: "Internal server error" });
  }

  // ── Set session cookie ───────────────────────────────────────────────────
  const isProduction = process.env.NODE_ENV === "production";
  reply.cookie("session", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });

  return { user: mapUser(user) };
}
