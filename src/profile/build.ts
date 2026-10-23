/**
 * Candidate profile builder.
 *
 * Takes raw CV text and produces a structured CandidateProfile. This is the
 * module where the AI extraction layer will be plugged in once it exists.
 *
 * For now, the implementation is a stub: it returns an empty-profile
 * skeleton with metadata indicating that AI extraction is not yet
 * implemented. The interface is real; the implementation is a placeholder
 * that compiles, runs, and is ready to be swapped out.
 */

import { CandidateProfile } from "./types.js";

/**
 * Build a CandidateProfile from raw CV text.
 *
 * Currently returns an unpopulated skeleton with metadata noting that
 * AI-based extraction is not yet implemented. Once the AI layer exists,
 * this function will call it, parse the structured output, and return a
 * fully (or partially) populated CandidateProfile.
 */
export function buildProfile(rawText: string): CandidateProfile {
  return {
    sourceText: rawText,
    metadata: {
      builtAt: new Date(),
      extractionMethod: "stub — AI extraction not yet implemented",
      schemaVersion: "1.0.0",
    },
  };
}
