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
