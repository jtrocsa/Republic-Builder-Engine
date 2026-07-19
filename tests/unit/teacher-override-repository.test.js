import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocked before the module under test imports them, so
// teacher-override-repository.js's activeStore() switch is fully
// controllable without touching a real Supabase backend.
vi.mock("../../apps/web/src/repositories/remote-teacher-override-store.js", () => ({
  loadOverridesForClassroom: vi.fn().mockResolvedValue(undefined),
  getOverride: vi.fn(() => "remote value"),
  hasOverride: vi.fn(() => true),
  resolveField: vi.fn((_contentId, _fieldName, officialValue) => `remote:${officialValue}`),
  setOverride: vi.fn().mockResolvedValue(undefined),
  clearOverride: vi.fn().mockResolvedValue(undefined),
  clearAllOverrides: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../apps/web/src/repositories/remote-auth-repository.js", () => ({
  getProfile: vi.fn().mockResolvedValue({ role: "teacher", displayName: "Ms. Rivera" }),
  getCurrentClassroomId: vi.fn().mockResolvedValue("classroom-1"),
  getSession: vi.fn().mockResolvedValue({ user: { id: "teacher-1" } }),
}));

import * as remoteStore from "../../apps/web/src/repositories/remote-teacher-override-store.js";
import {
  getOverride,
  hasOverride,
  resolveField,
  setOverride,
  setActiveClassroom,
} from "../../apps/web/src/repositories/teacher-override-repository.js";
import { setOverride as setLocalOverride } from "../../apps/web/src/repositories/local-teacher-override-store.js";

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("no active classroom (signed out / local dev)", () => {
  it("falls back to the local store's resolution when no classroom is active", () => {
    setLocalOverride("unit-01", "title", "Local Override");
    expect(resolveField("unit-01", "title", "Official Title")).toBe("Local Override");
  });

  it("never calls the remote store before a classroom is set active", () => {
    resolveField("unit-01", "title", "Official Title");
    expect(remoteStore.resolveField).not.toHaveBeenCalled();
  });
});

describe("after a classroom becomes active", () => {
  it("loads that classroom's overrides and switches resolution to the remote store", async () => {
    await setActiveClassroom("classroom-1");

    expect(remoteStore.loadOverridesForClassroom).toHaveBeenCalledWith("classroom-1");
    expect(resolveField("unit-01", "title", "Official Title")).toBe("remote:Official Title");
    expect(getOverride("unit-01", "title")).toBe("remote value");
    expect(hasOverride("unit-01", "title")).toBe(true);
  });

  it("passes the signed-in user's id as the override's author on write", async () => {
    await setActiveClassroom("classroom-1");
    await setOverride("unit-01", "title", "New Title");
    expect(remoteStore.setOverride).toHaveBeenCalledWith(
      "unit-01",
      "title",
      "New Title",
      "teacher-1"
    );
  });
});
