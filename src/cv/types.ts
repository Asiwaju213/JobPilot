/**
 * CV ingestion types.
 *
 * Defines the boundary between "something that provides CV text" and the
 * rest of the system. Later, different ingestion strategies (PDF, DOCX,
 * plain text, AI-assisted extraction) will share this contract.
 *
 * ORIGINAL — kept in the prototype until the new backend structure is verified.
 */

/** A source of CV text. Currently only file-path-based sourcing is implemented. */
export type CvSource = {
  kind: "file";
  path: string;
};

/** The raw text extracted from a CV source. This is the artifact passed to the AI layer (when it exists) for structured profile extraction. */
export type ExtractedCv = {
  source: CvSource;
  text: string;
  extractedAt: Date;
};
