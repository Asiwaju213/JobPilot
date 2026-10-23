/**
 * JobPilot — CV route handlers.
 *
 * Endpoints:
 *   POST /api/cvs               — Upload and process a CV
 *   GET  /api/cvs               — List CVs for the authenticated user
 *   GET  /api/cvs/:id           — Get a single CV
 *   DELETE /api/cvs/:id         — Delete a CV
 *
 * All endpoints require a valid session (ownership enforced by userId).
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { uploadCv, listCvsForUser, getCvForUser, deleteCv } from "./storage.js";
import { processCvUpload } from "./process.js";

// ── POST /api/cvs ──────────────────────────────────────────────────────────

export async function handleCreateCv(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Authenticate
  const userId = request.user?.id;
  if (!userId) {
    return reply.code(401).send({ message: "Not authenticated" });
  }

  // Check content-type
  const ct = request.headers["content-type"] || "";
  if (!ct.startsWith("multipart/form-data")) {
    return reply.code(400).send({
      message: "Expected multipart/form-data",
    });
  }

  // Read the multipart body (Fastify does not auto-parse multipart)
  const body = request.body as any;
  if (!body || typeof body !== "object") {
    return reply.code(400).send({ message: "Invalid request body" });
  }

  const { file, fileName, mimeType } = body;
  if (!file) {
    return reply.code(400).send({
      message: "Expected 'file' field in form data",
    });
  }

  // Validate file
  if (!fileName || typeof fileName !== "string") {
    return reply.code(400).send({ message: "Missing 'fileName'" });
  }
  if (!mimeType || typeof mimeType !== "string") {
    return reply.code(400).send({ message: "Missing 'mimeType'" });
  }

  try {
    const cv = await processCvUpload(
      userId,
      fileName,
      mimeType,
      file,
    );
    return reply.code(201).send({ cv });
  } catch (error: any) {
    if (error instanceof SyntaxError || error.name === "PayloadTooLargeError") {
      return reply.code(413).send({
        message: "File too large",
      });
    }
    if (error instanceof TypeError) {
      return reply.code(415).send({
        message: "Unsupported media type",
      });
    }
    request.log.error(error, "CV upload failed");
    return reply.code(500).send({ message: "Internal server error" });
  }
}

// ── GET /api/cvs ───────────────────────────────────────────────────────────

export async function handleListCvs(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user?.id;
  if (!userId) {
    return reply.code(401).send({ message: "Not authenticated" });
  }
  const cvs = await listCvsForUser(userId);
  return { cvs };
}

// ── GET /api/cvs/:id ───────────────────────────────────────────────────────

export async function handleGetCv(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const userId = request.user?.id;
  if (!userId) {
    return reply.code(401).send({ message: "Not authenticated" });
  }
  const cv = await getCvForUser(request.params.id, userId);
  if (!cv) {
    return reply.code(404).send({ message: "CV not found" });
  }
  // Redact sensitive fields (in a real app, only return safe metadata)
  const { fileType, storagePath, size, processingStatus, ...safe } = cv;
  return { cv: safe };
}

// ── DELETE /api/cvs/:id ────────────────────────────────────────────────────

export async function handleDeleteCv(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const userId = request.user?.id;
  if (!userId) {
    return reply.code(401).send({ message: "Not authenticated" });
  }

  const cv = await getCvForUser(request.params.id, userId);
  if (!cv) {
    return reply.code(404).send({ message: "CV not found" });
  }

  await deleteCv(cv);
  return { message: "CV deleted" };
}
