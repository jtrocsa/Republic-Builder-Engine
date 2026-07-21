import { describe, it, expect, vi, beforeEach } from "vitest";

// Minimal thenable/chainable stand-in for supabase-js's PostgrestFilterBuilder,
// backed by a queue so a single test can control the sequence of calls
// advanceClassroomUnit() makes (a read via getClassroomUnitFloor, then a
// write) without both calls seeing the same canned response.
let resultsQueue = [];
function nextResult() {
  return resultsQueue.length ? resultsQueue.shift() : { data: null, error: null };
}
function makeQueryBuilder() {
  const builder = {
    select: () => builder,
    eq: () => builder,
    upsert: () => builder,
    single: () => Promise.resolve(nextResult()),
    maybeSingle: () => Promise.resolve(nextResult()),
    then: (resolve, reject) => Promise.resolve(nextResult()).then(resolve, reject),
  };
  return builder;
}

vi.mock("../../apps/web/src/lib/supabase-client.js", () => ({
  supabase: { from: vi.fn(() => makeQueryBuilder()) },
}));

vi.mock("../../apps/web/src/repositories/remote-auth-repository.js", () => ({
  getSession: vi.fn().mockResolvedValue({ user: { id: "teacher-1" } }),
}));

import {
  getClassroomUnitFloor,
  advanceClassroomUnit,
} from "../../apps/web/src/repositories/remote-classroom-unit-repository.js";

beforeEach(() => {
  resultsQueue = [];
});

describe("getClassroomUnitFloor", () => {
  it("defaults to 0 when no row exists yet", async () => {
    resultsQueue = [{ data: null, error: null }];
    expect(await getClassroomUnitFloor("classroom-1")).toBe(0);
  });

  it("returns the stored enabled_unit_index", async () => {
    resultsQueue = [{ data: { enabled_unit_index: 2 }, error: null }];
    expect(await getClassroomUnitFloor("classroom-1")).toBe(2);
  });
});

describe("advanceClassroomUnit", () => {
  it("increments from the current floor by one", async () => {
    resultsQueue = [
      { data: { enabled_unit_index: 0 }, error: null }, // getClassroomUnitFloor's read
      { data: { enabled_unit_index: 1 }, error: null }, // the upsert's returned row
    ];
    const next = await advanceClassroomUnit("classroom-1", 2);
    expect(next).toBe(1);
  });

  it("clamps at maxIndex instead of advancing past the last unit", async () => {
    resultsQueue = [
      { data: { enabled_unit_index: 2 }, error: null },
      { data: { enabled_unit_index: 2 }, error: null },
    ];
    const next = await advanceClassroomUnit("classroom-1", 2);
    expect(next).toBe(2);
  });
});
