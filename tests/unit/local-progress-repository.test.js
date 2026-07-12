import { describe, it, expect, beforeEach } from "vitest";
import { DEFAULT_PROGRESS } from "../../apps/web/src/engine/chronicle-progress-store.js";
import {
  loadProgress,
  saveProgress,
  resetProgress,
  hasSavedProgress,
  migrateProgress,
} from "../../apps/web/src/repositories/local-progress-repository.js";

// Matches the private KEY constant in chronicle-progress-store.js, documented in
// CLAUDE.md as "republic-builder.chronicle.unit-01.v2". Not exported, so duplicated
// here deliberately to exercise the localStorage boundary the store owns.
const STORAGE_KEY = "republic-builder.chronicle.unit-01.v2";

beforeEach(() => {
  localStorage.clear();
});

describe("loadProgress", () => {
  it("returns fresh defaults plus a schema version when nothing is saved (no save exists)", () => {
    const result = loadProgress();
    expect(result).toEqual({ ...DEFAULT_PROGRESS, schemaVersion: 1 });
  });

  it("loads an existing save through the same deep-merge behavior as the underlying store (existing save)", () => {
    saveProgress({
      ...DEFAULT_PROGRESS,
      currentScreen: "field",
      profile: { name: "Test Chronicler", appearance: "b" },
      unlocked: ["case-001", "case-002"],
    });

    const result = loadProgress();

    expect(result.currentScreen).toBe("field");
    expect(result.profile).toEqual({ name: "Test Chronicler", appearance: "b" });
    expect(result.unlocked).toEqual(["case-001", "case-002"]);
    // Preserves unrelated fields untouched by the save above.
    expect(result.exchangeLedger).toEqual(DEFAULT_PROGRESS.exchangeLedger);
  });
});

describe("saveProgress", () => {
  it("persists under the same storage key the underlying store uses (saving progress)", () => {
    saveProgress({ ...DEFAULT_PROGRESS, currentScreen: "archive" });

    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(loadProgress().currentScreen).toBe("archive");
  });

  it("preserves fields it did not touch when saving a partial update (unrelated fields)", () => {
    saveProgress({
      ...DEFAULT_PROGRESS,
      unlocked: ["case-001", "case-002"],
      profile: { name: "Test Chronicler", appearance: "b" },
    });

    const result = loadProgress();
    expect(result.unlocked).toEqual(["case-001", "case-002"]);
    expect(result.profile).toEqual({ name: "Test Chronicler", appearance: "b" });
    expect(result.reconstruction).toEqual(DEFAULT_PROGRESS.reconstruction);
    expect(result.review).toEqual(DEFAULT_PROGRESS.review);
  });
});

describe("resetProgress / hasSavedProgress", () => {
  it("hasSavedProgress reflects whether a save exists", () => {
    expect(hasSavedProgress()).toBe(false);
    saveProgress(DEFAULT_PROGRESS);
    expect(hasSavedProgress()).toBe(true);
  });

  it("resetProgress removes the save and returns fresh defaults (reset behavior)", () => {
    saveProgress({ ...DEFAULT_PROGRESS, currentScreen: "archive" });
    expect(hasSavedProgress()).toBe(true);

    const result = resetProgress();

    expect(hasSavedProgress()).toBe(false);
    expect(result).toEqual({ ...DEFAULT_PROGRESS, schemaVersion: 1 });
  });
});

describe("existing save compatibility", () => {
  it("loads a pre-repository save that has no schemaVersion field without dropping any data (save compatibility)", () => {
    // Simulates a save written before this repository existed - the raw
    // store shape, with no schemaVersion field at all.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...DEFAULT_PROGRESS,
        currentScreen: "archive",
        unlocked: ["case-001", "case-002", "case-003"],
      })
    );

    const result = loadProgress();

    expect(result.schemaVersion).toBe(1);
    expect(result.currentScreen).toBe("archive");
    expect(result.unlocked).toEqual(["case-001", "case-002", "case-003"]);
  });

  it("never wipes an existing save just because it predates schemaVersion (never silently delete)", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_PROGRESS, currentScreen: "field" })
    );

    loadProgress();

    expect(hasSavedProgress()).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });
});

describe("migrateProgress", () => {
  it("stamps schemaVersion onto data that doesn't have it yet (migration behavior)", () => {
    const result = migrateProgress({ ...DEFAULT_PROGRESS });
    expect(result.schemaVersion).toBe(1);
  });

  it("is a no-op for data that already carries the current schemaVersion (boundary case)", () => {
    const alreadyStamped = { ...DEFAULT_PROGRESS, schemaVersion: 1 };
    expect(migrateProgress(alreadyStamped)).toBe(alreadyStamped);
  });
});
