import { describe, it, expect } from "vitest";
import {
  LEITNER_INTERVAL_DAYS,
  MAX_LEITNER_BOX,
  reviewRotationItem,
  isRotationItemDue,
  selectDailyRotationQueue,
  rotationDateString,
  nextRotationDateString,
  nextStreakDays,
} from "../../apps/web/src/engine/spaced-repetition.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.parse("2026-07-28T12:00:00.000Z");

describe("reviewRotationItem", () => {
  it("promotes a never-seen item to box 2 on a correct first review (normal case)", () => {
    const result = reviewRotationItem(undefined, true, NOW);
    expect(result.box).toBe(2);
    expect(result.dueAt).toBe(NOW + LEITNER_INTERVAL_DAYS[2] * DAY_MS);
    expect(result.lastSeenAt).toBe(NOW);
  });

  it("keeps a never-seen item at box 1 on an incorrect first review (normal case)", () => {
    const result = reviewRotationItem(undefined, false, NOW);
    expect(result.box).toBe(1);
    expect(result.dueAt).toBe(NOW + LEITNER_INTERVAL_DAYS[1] * DAY_MS);
  });

  it("promotes an existing box upward by one on correct (normal case)", () => {
    const result = reviewRotationItem({ box: 3, dueAt: 0, lastSeenAt: 0 }, true, NOW);
    expect(result.box).toBe(4);
    expect(result.dueAt).toBe(NOW + LEITNER_INTERVAL_DAYS[4] * DAY_MS);
  });

  it("caps promotion at the max box (boundary case)", () => {
    const result = reviewRotationItem({ box: MAX_LEITNER_BOX, dueAt: 0, lastSeenAt: 0 }, true, NOW);
    expect(result.box).toBe(MAX_LEITNER_BOX);
  });

  it("resets a high box back to 1 on an incorrect review (regression case)", () => {
    const result = reviewRotationItem({ box: 5, dueAt: 0, lastSeenAt: 0 }, false, NOW);
    expect(result.box).toBe(1);
    expect(result.dueAt).toBe(NOW + LEITNER_INTERVAL_DAYS[1] * DAY_MS);
  });
});

describe("isRotationItemDue", () => {
  it("treats an item with no state as due (normal case)", () => {
    expect(isRotationItemDue(undefined, NOW)).toBe(true);
  });

  it("treats a past-due dueAt as due (normal case)", () => {
    expect(isRotationItemDue({ dueAt: NOW - 1000 }, NOW)).toBe(true);
  });

  it("treats a future dueAt as not due (normal case)", () => {
    expect(isRotationItemDue({ dueAt: NOW + 1000 }, NOW)).toBe(false);
  });
});

describe("selectDailyRotationQueue", () => {
  it("fills entirely with fresh items when nothing has been reviewed yet (normal case)", () => {
    const keys = ["mcq::a", "mcq::b", "mcq::c"];
    expect(selectDailyRotationQueue(keys, {}, NOW, 8)).toEqual(keys);
  });

  it("orders due items before fresh items (normal case)", () => {
    const keys = ["mcq::a", "mcq::b", "mcq::c"];
    const states = { "mcq::a": { box: 2, dueAt: NOW - 1000 } };
    expect(selectDailyRotationQueue(keys, states, NOW, 8)).toEqual([
      "mcq::a",
      "mcq::b",
      "mcq::c",
    ]);
  });

  it("sorts multiple due items by earliest dueAt first (normal case)", () => {
    const keys = ["mcq::a", "mcq::b"];
    const states = {
      "mcq::a": { box: 2, dueAt: NOW - 1000 },
      "mcq::b": { box: 2, dueAt: NOW - 5000 },
    };
    expect(selectDailyRotationQueue(keys, states, NOW, 8)).toEqual(["mcq::b", "mcq::a"]);
  });

  it("excludes not-yet-due reviewed items (normal case)", () => {
    const keys = ["mcq::a", "mcq::b"];
    const states = { "mcq::a": { box: 3, dueAt: NOW + DAY_MS } };
    expect(selectDailyRotationQueue(keys, states, NOW, 8)).toEqual(["mcq::b"]);
  });

  it("caps the result at targetCount (boundary case)", () => {
    const keys = ["mcq::a", "mcq::b", "mcq::c", "mcq::d"];
    expect(selectDailyRotationQueue(keys, {}, NOW, 2)).toEqual(["mcq::a", "mcq::b"]);
  });

  it("returns an empty array when the pool is empty (boundary case)", () => {
    expect(selectDailyRotationQueue([], {}, NOW, 8)).toEqual([]);
  });
});

describe("rotationDateString / nextRotationDateString", () => {
  it("formats as a UTC YYYY-MM-DD string (normal case)", () => {
    expect(rotationDateString(NOW)).toBe("2026-07-28");
  });

  it("advances exactly one UTC day (normal case)", () => {
    expect(nextRotationDateString("2026-07-28")).toBe("2026-07-29");
  });

  it("rolls over a month boundary correctly (boundary case)", () => {
    expect(nextRotationDateString("2026-07-31")).toBe("2026-08-01");
  });
});

describe("nextStreakDays", () => {
  it("starts a streak at 1 when nothing was ever completed (normal case)", () => {
    expect(nextStreakDays(null, "2026-07-28", 0)).toBe(1);
  });

  it("increments the streak when completed on the consecutive day (normal case)", () => {
    expect(nextStreakDays("2026-07-27", "2026-07-28", 4)).toBe(5);
  });

  it("resets to 1 after a missed day (regression case)", () => {
    expect(nextStreakDays("2026-07-20", "2026-07-28", 9)).toBe(1);
  });

  it("leaves the streak unchanged if already completed today (boundary case)", () => {
    expect(nextStreakDays("2026-07-28", "2026-07-28", 3)).toBe(3);
  });
});
