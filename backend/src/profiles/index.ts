/**  
 * Profile route handlers — barrel export.
 *
 * Re-exports all profile handlers so app.ts can import them from a single path.
 */

export { handleCreateProfile } from "./create.js";
export { handleListProfiles } from "./list.js";
export { handleGetProfile } from "./get.js";
export { handleUpdateProfile } from "./update.js";
export { handleDeleteProfile } from "./delete.js";
