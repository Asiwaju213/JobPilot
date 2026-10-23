/**
 * JobPilot — application entry point.
 *
 * Demonstrates the Phase 1 flow: read a CV file, extract its text, build a
 * candidate profile from it, and print the result as JSON.
 *
 * CV file path can be passed as the first CLI argument. If none is given,
 * a default path is used so the entry point can be run without arguments
 * for a smoke test.
 */

import { extractText } from "./cv/ingest.js";
import { buildProfile } from "./profile/build.js";
import { CvSource } from "./cv/types.js";

const DEFAULT_CV_PATH = "cv.txt";

function cvSourceFromArg(): CvSource {
  const arg = process.argv[2];
  if (arg && arg.trim()) {
    return { kind: "file", path: arg.trim() };
  }
  return { kind: "file", path: DEFAULT_CV_PATH };
}

async function main() {
  const source = cvSourceFromArg();

  console.log(`Reading CV from: ${source.path}`);

  const extracted = await extractText(source);

  console.log(`Extracted ${extracted.text.length} characters of CV text.`);

  const profile = buildProfile(extracted.text);

  console.log("\n--- Candidate Profile ---");
  console.log(JSON.stringify(profile, null, 2));
  console.log("--- End of Profile ---\n");
}

main().catch((error) => {
  console.error("JobPilot error:", error);
  process.exit(1);
});
