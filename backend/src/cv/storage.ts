/**
 * JobPilot — CV upload and storage.
 *
 * Securely stores uploaded CV files in the local development storage
 * directory (/storage) and records the file metadata in the database.
 *
 * Security controls:
 *  - File type validation (MIME type, extension)
 *  - File size limit (5 MB)
 *  - Secure path construction (no path traversal)
 *  - Private storage (no public HTTP exposure)
 */

import { randomBytes } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "../db/prisma.js";

/** Local storage root (development). In production this would be S3. */
export const STORAGE_ROOT = join(__dirname, "..", "..", "storage");

/** Maximum upload size: 5 MB */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Allowed MIME types for CV uploads. */
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/x-markdown",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

/** Allowed file extensions. */
export const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".txt",
  ".md",
  ".doc",
  ".docx",
]);

/** Content-type validation error. */
export class InvalidFileType extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidFileType";
  }
}

/** File size limit exceeded error. */
export class FileSizeLimitExceeded extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileSizeLimitExceeded";
  }
}

/**
 * Get the file extension from a filename.
 */
export function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  if (idx === -1 || idx === filename.length - 1) return "";
  return filename.slice(idx).toLowerCase();
}

/**
 * Get the extension associated with a MIME type.
 */
export function getExtensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "text/markdown": ".md",
    "text/x-markdown": ".md",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  };
  return map[mime] || "";
}

/**
 * Sanitize a filename for safe storage.
 *
 * Removes any directory components and collapses whitespace.
 */
export function sanitizeFileName(filename: string): string {
  return filename.replace(/^[\\/]+|([\\/])+/g, "").trim() || "unnamed";
}

/**
 * Generate a safe storage filename.
 *
 * Uses a random token to avoid path traversal and collisions.
 */
export function generateStorageFileName(
  originalName: string,
  mimeType: string,
): string {
  const ext = getExtension(originalName) || getExtensionFromMime(mimeType) || "";
  const random = randomBytes(16).toString("hex");
  return `${random}${ext}`;
}

/**
 * Validate an uploaded file.
 *
 * Checks MIME type, file extension, and size.
 *
 * @param size - File size in bytes.
 * @param mimeType - MIME type of the file.
 * @param filename - Original file name (for extension check).
 * @throws {InvalidFileType} If the MIME type is not allowed.
 * @throws {FileSizeLimitExceeded} If the file exceeds the size limit.
 */
export function validateUpload(
  size: number,
  mimeType: string,
  filename: string,
): void {
  if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
    throw new InvalidFileType(
      `File type "${mimeType}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}.`,
    );
  }

  const ext = getExtension(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new InvalidFileType(
      `File extension "${ext}" is not allowed. Allowed extensions: ${[...ALLOWED_EXTENSIONS].join(", ")}.`,
    );
  }

  if (size > MAX_FILE_SIZE) {
    throw new FileSizeLimitExceeded(
      `File size ${size} bytes exceeds the ${MAX_FILE_SIZE} byte limit.`,
    );
  }
}

/**
 * Upload a CV file.
 *
 * Writes the file to the local storage directory and creates a Cv record
 * in the database.
 *
 * @param userId - The owner of the CV.
 * @param originalName - The original file name.
 * @param mimeType - The MIME type of the file.
 * @param size - The file size in bytes.
 * @param buffer - The file content buffer.
 * @returns The created Cv record.
 */
export async function uploadCv(
  userId: string,
  originalName: string,
  mimeType: string,
  size: number,
  buffer: Buffer,
): Promise<any> {
  // Validate file
  validateUpload(size, mimeType, originalName);

  // Sanitize filename
  const safeName = sanitizeFileName(originalName);

  // Generate storage filename
  const storageName = generateStorageFileName(safeName, mimeType);

  // Ensure storage directory exists
  await mkdir(STORAGE_ROOT, { recursive: true });

  // Write file
  const storagePath = join(STORAGE_ROOT, storageName);
  await writeFile(storagePath, buffer);

  // Create database record
  const cv = await prisma().cv.create({
    data: {
      userId,
      label: safeName,
      fileType: getExtension(safeName).slice(1) || mimeType.split("/")[1] || "bin",
      storagePath: storagePath.replace(/\\/g, "/"),
      size,
      processingStatus: "Uploaded",
    },
  });

  return cv;
}

/**
 * Delete a CV file and its database record.
 *
 * @param cv - The Cv record to delete.
 * @returns True if the record was deleted.
 */
export async function deleteCv(cv: any): Promise<boolean> {
  let deleted = false;

  // Delete file from storage
  if (cv.storagePath) {
    try {
      await unlink(cv.storagePath);
    } catch {
      // File may not exist; that's OK
    }
  }

  // Delete database record
  const result = await prisma().cv.delete({
    where: { id: cv.id },
  });

  if (result) deleted = true;
  return deleted;
}

/**
 * List all CVs for a user.
 */
export async function listCvsForUser(userId: string): Promise<any[]> {
  return prisma().cv.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
  });
}

/**
 * Get a CV by ID, scoped to a user.
 */
export async function getCvForUser(
  cvId: string,
  userId: string,
): Promise<any | null> {
  return prisma().cv.findUnique({
    where: { id: cvId, userId },
  });
}
