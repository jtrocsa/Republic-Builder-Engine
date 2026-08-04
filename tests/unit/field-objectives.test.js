// What the field's Mission Tracker says: the checklist row per record (fieldObjectives), and which
// single mission the block underneath it is about (pickTrackedActivity).
//
// Tested apart from the markup because the interesting decisions are all in the derivation: which
// name a row shows (the person, the object, or the record), which of the three states it is in, and
// which record the panel considers in flight. All are things a future change to a map's anchors or
// to the activity flow could silently get wrong — a row reading a source's long historical title
// instead of "John Dickinson" is still a row, just a useless one, and a mission block naming the
// wrong record still renders.

import { describe, expect, it } from "vitest";

import { fieldObjectives, pickTrackedActivity } from "../../apps/web/src/main.js";

const SOURCES = [
  { id: "a-carried", title: "Letters from a Farmer in Pennsylvania, Letter II" },
  { id: "b-on-object", title: "Petition for Freedom to the Massachusetts Council" },
  { id: "c-bare", title: "An unanchored record" },
];
const POINTS = {
  "a-carried": { anchor: { npc: "john-dickinson" }, label: "Farmer's Letters" },
  "b-on-object": {
    x: 36,
    y: 10,
    anchor: { object: "Statehouse petition table" },
    label: "Petition",
  },
  "c-bare": { x: 1, y: 1, label: "Wharf dispatch" },
};
const NPC_NAMES = { "john-dickinson": "John Dickinson" };
const npcNameFor = (id) => NPC_NAMES[id];
const secured = (...ids) => {
  const set = new Set(ids);
  return (_caseId, sourceId) => set.has(sourceId);
};

describe("fieldObjectives", () => {
  it("names each row by the thing the player has to walk to (normal case)", () => {
    const rows = fieldObjectives("case-007", SOURCES, POINTS, npcNameFor, secured());
    // The carrier, not the record's title: the person is what a player can spot across the map.
    expect(rows[0].where).toBe("John Dickinson");
    expect(rows[1].where).toBe("Statehouse petition table");
    // With no anchor at all, the point's own label is the best available answer.
    expect(rows[2].where).toBe("Wharf dispatch");
  });

  it("keeps one row per record, in the case's own order (normal case)", () => {
    const rows = fieldObjectives("case-007", SOURCES, POINTS, npcNameFor, secured());
    expect(rows.map((row) => row.id)).toEqual(["a-carried", "b-on-object", "c-bare"]);
  });

  it("marks secured records and leaves the rest available (normal case)", () => {
    const rows = fieldObjectives("case-007", SOURCES, POINTS, npcNameFor, secured("b-on-object"));
    expect(rows.map((row) => row.availability)).toEqual(["available", "secured", "available"]);
  });

  it("carries Case 1.01's ordering gate through to the rows (edge case)", () => {
    // The tracker must agree with the world about what is locked, which is why both read the same
    // sourceAvailability() rather than each deciding for itself.
    const caseOne = [
      { id: "taino-context", title: "Village" },
      { id: "columbus-letter", title: "Letter" },
    ];
    const points = {
      "taino-context": { anchor: { npc: "taino-elder" }, label: "Village observation" },
      "columbus-letter": { anchor: { npc: "columbus" }, label: "Columbus's account" },
    };
    const names = (id) => (id === "taino-elder" ? "Taíno community elder" : "Christopher Columbus");

    const before = fieldObjectives("case-001", caseOne, points, names, secured());
    expect(before.map((row) => row.availability)).toEqual(["available", "locked"]);

    const after = fieldObjectives("case-001", caseOne, points, names, secured("taino-context"));
    expect(after.map((row) => row.availability)).toEqual(["secured", "available"]);
  });

  it("falls back to the record's own title when an anchor names a missing NPC (edge case)", () => {
    // A renamed or typo'd carrier id should degrade to a usable row rather than an empty one.
    const rows = fieldObjectives("case-007", SOURCES, POINTS, () => undefined, secured());
    expect(rows[0].where).toBe("Farmer's Letters");
  });
});

// Entries arrive in the case's own source order, already filtered to the ones with activity state.
const started = (id, complete) => ({
  source: { id },
  activity: { kind: "interview" },
  state: {},
  complete,
});

describe("pickTrackedActivity", () => {
  it("names the record the player currently has open (normal case)", () => {
    const entries = [started("taino-context", true), started("columbus-letter", false)];
    expect(pickTrackedActivity(entries, "columbus-letter").source.id).toBe("columbus-letter");
  });

  it("falls back to the first unfinished mission when nothing is open (normal case)", () => {
    // progress.activeActivitySourceId is deliberately nulled by "mission-debriefed", so the tracker
    // has to answer without it for the whole walk from one record to the next.
    const entries = [started("taino-context", true), started("columbus-letter", false)];
    expect(pickTrackedActivity(entries, null).source.id).toBe("columbus-letter");
  });

  it("falls back to the most recent mission once every one is filed (edge case)", () => {
    // The last, not the first: with nothing left in flight the notebook worth re-reading is the one
    // they were most recently in. This tier is why the panel reports a finished activity at all.
    const entries = [started("taino-context", true), started("columbus-letter", true)];
    expect(pickTrackedActivity(entries, null).source.id).toBe("columbus-letter");
  });

  it("ignores an open-record id belonging to another case (edge case)", () => {
    // activeActivitySourceId outlives the case it was set in — nothing clears it on Chronotravel —
    // so a stale id has to fall through to the tiers below rather than emptying the panel.
    const entries = [started("taino-context", false)];
    expect(pickTrackedActivity(entries, "one-hogshead").source.id).toBe("taino-context");
  });

  it("reports nothing before any mission has been started (edge case)", () => {
    expect(pickTrackedActivity([], null)).toBe(null);
  });

  it("does not let a case's first record capture the panel for the rest of the case (regression)", () => {
    // The defect this was extracted for. Reading the first entry with any state at all welded the
    // progress line, the bar and the "Open the Field Notebook →" button to Case 1.01's interview
    // from the first click on the elder onward — so the button reopened a filed mission whatever
    // the player was actually working on.
    const entries = [
      started("taino-context", true),
      started("columbus-letter", true),
      started("waldseemuller-map", false),
    ];
    expect(pickTrackedActivity(entries, null).source.id).toBe("waldseemuller-map");
    expect(pickTrackedActivity(entries, "waldseemuller-map").source.id).toBe("waldseemuller-map");
  });
});
