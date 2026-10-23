/**
 * CV ingestion module.
 *
 * Takes a CV source and extracts raw text from it. Dispatches to a
 * format-specific extractor based on the file extension:
 *   - .pdf  → pdf-parse
 *   - .txt  → plain text reader
 *   - .md   → plain text reader
 *
 * This is the slot where additional format handlers (DOCX, HTML, AI-assisted
 * extraction) will be plugged in later.
 *
 * Throws if the source kind is unsupported, the file cannot be read, the
 * extension is unsupported, or the format extractor fails.
 *
 * COPIED from the prototype src/cv/ingest.ts. The original is preserved
 * until the new backend structure is verified.
 */

import { readFile } from "node:fs/promises";
import { CvSource, ExtractedCv } from "./types.js";
import { extractPdfText } from "./extractors/pdf.js";

/** File extensions that are currently supported for CV ingestion. */
const SUPPORTED_EXTENSIONS = new Set<string>([".pdf", ".txt", ".md"]);

/**
 * Get the lowercased file extension (including the dot) from a path.
 * Returns "" if the path has no extension.
 */
function getExtension(path: string): string {
  const idx = path.lastIndexOf(".");
  if (idx === -1 || idx === path.length - 1) return "";
  return path.slice(idx).toLowerCase();
}

/**
 * Extract raw text from a CV source.
 *
 * Dispatches to a format-specific extractor based on the file extension.
 * Currently supports PDF, plain text, and markdown files.
 */
export async function extractText(source: CvSource): Promise<ExtractedCv> {
  if (source.kind !== "file") {
    throw new Error(
      `Unsupported CV source kind: ${source.kind}. Only "file" is supported currently.`,
    );
  }

  const ext = getExtension(source.path);

  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error(
      `Unsupported CV file extension "${ext}" for file "${source.path}". ` +
        `Supported extensions: ${[...SUPPORTED_EXTENSIONS].join(", ")}.`,
    );
  }

  if (ext === ".pdf") {
    const text = await extractPdfText(source.path);
    return { source, text, extractedAt: new Date() };
  }

  // .txt and .md — plain text reader
  let text: string;
  try {
    text = await readFile(source.path, "utf-8");
  } catch (error) {
    throw new Error(`Cannot read file "${source.path}": ${error}`);
  }

  return {
    source,
    text,
    extractedAt: new Date(),
  };
}
