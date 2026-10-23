/**
 * Auth route handlers — barrel export.
 *
 * Re-exports all auth handlers so app.ts can import them from a single path.
 */

export { handleRegister } from "./register.js";
export { handleLogin } from "./login.js";
export { handleMe } from "./me.js";
export { handleLogout } from "./logout.js";
