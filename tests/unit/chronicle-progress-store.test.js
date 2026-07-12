import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_PROGRESS,
  readProgress,
  saveProgress,
  resetProgress,
  hasSavedProgress,
} from "../../apps/web/src/engine/chronicle-progress-store.js";

// Matches the private KEY constant in chronicle-progress-store.js, documented in
// CLAUDE.md as "republic-builder.chronicle.unit-01.v2". Not exported, so duplicated
// here deliberately to exercise the localStorage boundary the store owns.
const STORAGE_KEY = "republic-builder.chronicle.unit-01.v2";

beforeEach(() => {
  localStorage.clear();
});

describe("readProgress", () => {
  it("returns fresh defaults when nothing is saved (normal case)", () => {
    expect(readProgress()).toEqual(DEFAULT_PROGRESS);
  });

  it("deep-merges a saved partial shape over the defaults (normal case)", () => {
    saveProgress({
      ...DEFAULT_PROGRESS,
      currentScreen: "field",
      profile: { name: "Test Chronicler", appearance: "b" },
      unlocked: ["case-001", "case-002"],
    });

    const result = readProgress();

    expect(result.currentScreen).toBe("field");
    expect(result.profile).toEqual({ name: "Test Chronicler", appearance: "b" });
    expect(result.unlocked).toEqual(["case-001", "case-002"]);
    // Untouched fields still come from defaults.
    expect(result.exchangeLedger).toEqual(DEFAULT_PROGRESS.exchangeLedger);
  });

  it("falls back to fresh defaults when localStorage holds invalid JSON (invalid data)", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");

    expect(readProgress()).toEqual(DEFAULT_PROGRESS);
  });

  it("discards a corrupted non-array `unlocked` field instead of trusting it (regression case)", () => {
    // Guards the defensive merge in readProgress() against a malformed/legacy save
    // shape - if `unlocked` were trusted as-is here, a corrupted save could silently
    // lock the player out of every case.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ unlocked: "case-001" }));

    expect(readProgress().unlocked).toEqual(["case-001"]);
  });

  it("discards a corrupted non-array `completedCases` field instead of trusting it (boundary case)", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedCases: { 0: "case-001" } }));

    expect(readProgress().completedCases).toEqual([]);
  });
});

describe("saveProgress / hasSavedProgress / resetProgress", () => {
  it("hasSavedProgress reflects whether a save exists", () => {
    expect(hasSavedProgress()).toBe(false);
    saveProgress(DEFAULT_PROGRESS);
    expect(hasSavedProgress()).toBe(true);
  });

  it("resetProgress removes the save and returns fresh defaults", () => {
    saveProgress({ ...DEFAULT_PROGRESS, currentScreen: "archive" });
    expect(hasSavedProgress()).toBe(true);

    const result = resetProgress();

    expect(hasSavedProgress()).toBe(false);
    expect(result).toEqual(DEFAULT_PROGRESS);
  });
});
