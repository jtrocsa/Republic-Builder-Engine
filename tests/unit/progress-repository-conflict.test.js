import { describe, it, expect } from "vitest";
import { resolveProgressConflict } from "../../apps/web/src/repositories/progress-repository.js";

describe("resolveProgressConflict", () => {
  it("keeps local when there is no remote copy at all", () => {
    const local = { lastSavedAt: 1000, currentScreen: "field" };
    expect(resolveProgressConflict(local, null)).toBe(local);
  });

  it("prefers remote when it is strictly newer than local", () => {
    const local = { lastSavedAt: 1000, currentScreen: "field" };
    const remote = {
      progress: { currentScreen: "institute" },
      updatedAt: new Date(5000).toISOString(),
    };
    expect(resolveProgressConflict(local, remote)).toBe(remote.progress);
  });

  it("keeps local when it is strictly newer than remote", () => {
    const local = { lastSavedAt: 9000, currentScreen: "field" };
    const remote = {
      progress: { currentScreen: "institute" },
      updatedAt: new Date(1000).toISOString(),
    };
    expect(resolveProgressConflict(local, remote)).toBe(local);
  });

  it("keeps local as the tiebreaker when timestamps are equal", () => {
    const timestamp = 5000;
    const local = { lastSavedAt: timestamp, currentScreen: "field" };
    const remote = {
      progress: { currentScreen: "institute" },
      updatedAt: new Date(timestamp).toISOString(),
    };
    expect(resolveProgressConflict(local, remote)).toBe(local);
  });

  it("treats a local save with no lastSavedAt (brand-new browser/device) as older than any real remote copy", () => {
    const local = { lastSavedAt: null, currentScreen: "institute" };
    const remote = {
      progress: { currentScreen: "field", unlocked: ["case-001", "case-002"] },
      updatedAt: new Date(1000).toISOString(),
    };
    expect(resolveProgressConflict(local, remote)).toBe(remote.progress);
  });
});

/**
 * Ownership, which is asked before the timestamps and is not a tiebreaker.
 *
 * Chronicle is played on school Chromebooks that rotate between students every period, and a save
 * had no owner — so the comparison above was run against whatever the previous student left, and
 * the previous student's save is reliably the newer one. Measured end to end before this existed:
 * a returning student signed in with their own password and their three completed cases were
 * replaced by their classmate's one, in their own cloud row. See `tests/e2e/classroom-lifecycle.spec.js`
 * and decision log `0147`.
 */
describe("resolveProgressConflict — whose save is on this machine", () => {
  const ADA = "00000000-0000-4000-8000-0000000000aa";
  const BEDE = "00000000-0000-4000-8000-0000000000bb";

  it("refuses a classmate's save even though it is newer, and takes this student's remote copy", () => {
    const local = { lastSavedAt: 9000, ownerUserId: ADA, completedCases: ["case-001"] };
    const remote = {
      progress: { completedCases: ["case-001", "case-002", "case-003"] },
      updatedAt: new Date(1000).toISOString(),
    };
    expect(
      resolveProgressConflict(local, remote, BEDE),
      "a save belonging to another student won on recency — this is a student signing in on the " +
        "Chromebook their classmate used last period and being handed that classmate's game"
    ).toBe(remote.progress);
  });

  it("returns null — start clean — when the local save is a classmate's and this student has none", () => {
    const local = { lastSavedAt: 9000, ownerUserId: ADA, completedCases: ["case-001"] };
    expect(
      resolveProgressConflict(local, null, BEDE),
      "a student's first sign-in on a classmate's machine continued the classmate's save"
    ).toBeNull();
  });

  it("keeps this student's own newer save, exactly as before", () => {
    const local = { lastSavedAt: 9000, ownerUserId: BEDE, completedCases: ["case-004"] };
    const remote = { progress: { completedCases: [] }, updatedAt: new Date(1000).toISOString() };
    expect(resolveProgressConflict(local, remote, BEDE)).toBe(local);
  });

  it("still absorbs an unowned save, which is how progress made before signing in reaches an account", () => {
    const local = { lastSavedAt: 9000, ownerUserId: null, completedCases: ["case-001"] };
    const remote = { progress: { completedCases: [] }, updatedAt: new Date(1000).toISOString() };
    expect(
      resolveProgressConflict(local, remote, BEDE),
      "a solo player's progress was discarded when they signed in for the first time"
    ).toBe(local);
  });

  it("is pure last-write-wins when no signed-in user is given", () => {
    const local = { lastSavedAt: 9000, ownerUserId: ADA };
    const remote = { progress: {}, updatedAt: new Date(1000).toISOString() };
    expect(resolveProgressConflict(local, remote)).toBe(local);
  });
});
