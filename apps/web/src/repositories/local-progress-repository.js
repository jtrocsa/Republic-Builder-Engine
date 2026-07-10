/**
 * Thin persistence boundary around chronicle-progress-store.js. Wraps the
 * real read/write/reset behavior without changing the storage key, merge
 * behavior, or data shape underneath it — see
 * docs/architecture/LOCAL-PROGRESS-REPOSITORY.md.
 */
import {
  readProgress,
  saveProgress as writeProgress,
  resetProgress as clearProgress,
  hasSavedProgress as hasStoredProgress,
} from "../engine/chronicle-progress-store.js";

// No real schema break has ever happened to this save shape — the store's
// own readProgress() already field-merges over DEFAULT_PROGRESS, so new
// fields show up for old saves for free. This stamp exists only as the
// seam a future breaking change would migrate against; there is nothing to
// migrate yet.
const SCHEMA_VERSION = 1;

export function migrateProgress(saved) {
  if (saved.schemaVersion === SCHEMA_VERSION) return saved;
  return { ...saved, schemaVersion: SCHEMA_VERSION };
}

export function loadProgress() {
  return migrateProgress(readProgress());
}

export function saveProgress(next) {
  return writeProgress(migrateProgress(next));
}

export function resetProgress() {
  return migrateProgress(clearProgress());
}

export function hasSavedProgress() {
  return hasStoredProgress();
}
