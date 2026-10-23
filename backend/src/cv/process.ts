/**
 * JobPilot — CV ingestion pipeline with persistence and extraction review.
 *
 * This module wires the prototype CV ingestion module with the persisted
 * Cv model and structured extraction review.
 *
 * Pipeline:
 *   1. Upload file (storage + Cv record)
 *   2. Extract text (PDF/TXT/MD via prototype extractors)
 *   3. Build structured profile (current: stub; Phase C AI integration)
 *   4. Store extracted data (ExtractedCvData) + provenance
 *   5. Review/wait for AI review (Phase C).
 *
 * The extraction is currently a stub. The profile builder returns an
 * unpopulated skeleton with metadata noting that AI extraction is not yet
 * implemented. The interface is real; the implementation is a placeholder
 * that compiles, runs, and is ready to be swapped out.
 */

import { extractText as extractCvText } from "../cvs/ingest.js";
import { uploadCv, listCvsForUser, getCvForUser } from "./storage.js";
import { prisma } from "../db/prisma.js";

/**
 * Build a structured profile from raw CV text.
 *
 * This is a stub. The AI extraction layer will be plugged in here in
 * a later phase. Currently returns an unpopulated skeleton with metadata
 * noting that AI extraction is not yet implemented.
 *
 * This mirrors the prototype's profile builder (root/src/profile/build.ts).
 */
export function buildProfile(rawText: string): any {
  return {
    sourceText: rawText,
    metadata: {
      builtAt: new Date(),
      extractionMethod: "stub — AI extraction not yet implemented",
      schemaVersion: "1.0.0",
    },
  };
}

/**
 * Upload and process a CV file.
 *
 * 1. Validates and stores the file.
 * 2. Extracts raw text.
 * 3. Builds a structured profile (stub today).
 * 4. Stores the extracted data with provenance.
 *
 * @param userId - The owner of the CV.
 * @param originalName - The original file name.
 * @param mimeType - The MIME type of the file.
 * @param buffer - The file content buffer.
 * @returns The created Cv record with extraction status.
 */

/**
 * Upload and process a CV file.
 *
 * 1. Validates and stores the file.
 * 2. Extracts raw text.
 * 3. Builds a structured profile (stub today).
 * 4. Stores the extracted data with provenance.
 *
 * @param userId - The owner of the CV.
 * @param originalName - The original file name.
 * @param mimeType - The MIME type of the file.
 * @param buffer - The file content buffer.
 * @returns The created Cv record with extraction status.
 */
export async function processCvUpload(
  userId: string,
  originalName: string,
  mimeType: string,
  buffer: Buffer,
): Promise<any> {
  // Step 1: Upload file (storage + Cv record)
  const cv = await uploadCv(userId, originalName, mimeType, buffer.length, buffer);

  // Step 2: Extract raw text
  const extracted = await extractCvText({ kind: "file", path: cv.storagePath });

  // Step 3: Build structured profile
  const profile = buildProfile(extracted.text);

  // Step 4: Store extracted data with provenance
  await prisma().extractedCvData.create({
    data: {
      cvId: cv.id,
      data: JSON.stringify({
        profile: {
          name: profile.name,
          summary: profile.summary,
          contact: profile.contact,
          skills: profile.skills,
          experience: profile.experience,
          education: profile.education,
          languages: profile.languages,
          metadata: profile.metadata,
        },
        sourceText: profile.sourceText,
      }),
      extractedAt: new Date(),
      provider: "stub",
      model: "n/a",
      schemaVersion: "1.0.0",
    },
  });

  // Step 5: Update Cv with processing status
  await prisma().cv.update({
    where: { id: cv.id },
    data: {
      processingStatus: "Ready",
      processedAt: new Date(),
    },
  });

  // Attach extracted profile to Cv record for convenience
  cv.extractedProfile = profile;
  return cv;
}

/**
 * List all CVs for a user.
 */
export async function listCvs(userId: string): Promise<any[]> {
  return listCvsForUser(userId);
}

/**
 * Get a CV by ID, scoped to a user.
 */
export async function getCv(cvId: string, userId: string): Promise<any | null> {
  return getCvForUser(cvId, userId);
}
