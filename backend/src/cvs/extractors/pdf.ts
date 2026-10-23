/**
 * PDF text extraction module.
 *
 * Uses pdf-parse to extract text content from PDF files. The extracted text
 * is returned as a plain string, ready to be passed to the AI extraction
 * layer (when it exists) for structured profile building.
 *
 * The PDFParse instance is always destroyed after extraction to free
 * internal resources (Worker, DOM elements, etc.).
 *
 * Errors from the underlying library are caught and re-thrown with context
 * about the file path so callers can report meaningful messages.
 *
 * COPIED from the prototype src/cv/extractors/pdf.ts. The original is preserved
 * until the new backend structure is verified.
 */

import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * Extract plain text from a PDF file at the given path.
 *
 * @param path - Absolute or relative path to the PDF file.
 * @returns The full text content of the PDF.
 * @throws If the file cannot be read, is not a valid PDF, or parsing fails.
 */
export async function extractPdfText(path: string): Promise<string> {
  let buffer: Buffer;
  try {
    buffer = await readFile(path);
  } catch (error) {
    throw new Error(`Cannot read PDF file "${path}": ${error}`);
  }

  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text;
  } catch (error) {
    throw new Error(`Failed to extract text from PDF "${path}": ${error}`);
  } finally {
    try {
      await parser.destroy();
    } catch {
      // Best-effort cleanup. Ignore errors during destroy so the
      // original extraction error (if any) is not swallowed.
    }
  }
}
