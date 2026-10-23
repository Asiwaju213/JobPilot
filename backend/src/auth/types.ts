/**
 * Auth types and validation schemas for JobPilot.
 *
 * Defines the request validation schemas (using Zod, already a project
 * dependency) and the shared response types for auth endpoints.
 */

import { z } from "zod";

// ── Registration ──────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be at most 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ── Login ─────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be at most 255 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be at most 128 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ── Public user snapshot (returned by /api/auth/me, /api/auth/register) ──

export interface PublicUser {
  id: string;
  email: string;
  emailVerified: boolean;
  status: string;
}

export function mapUser(user: {
  id: string;
  email: string;
  emailVerified: boolean;
  status: string;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    status: user.status,
  };
}
