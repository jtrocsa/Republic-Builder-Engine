/**
 * Pure helpers shared by the join/claim/login screens. Kept dependency-free
 * (no Supabase import) so they're trivially unit-testable and so the exact
 * synthetic-email format only needs to be agreed on once between this file
 * and api/roster/claim.js's mirrored copy (Vercel serverless functions don't
 * share a bundle with the Vite client, so the derivation is intentionally
 * duplicated rather than imported across that boundary).
 */

export function deriveStudentLoginEmail(classroomId, studentIdCode) {
  return `student-${classroomId}-${studentIdCode}@chronicle.invalid`;
}

export function validateJoinCode(value) {
  return typeof value === "string" && value.trim().length >= 4;
}

export function validateStudentIdCode(value) {
  return typeof value === "string" && value.trim().length >= 1;
}

export function validatePassword(value) {
  return typeof value === "string" && value.length >= 8;
}
