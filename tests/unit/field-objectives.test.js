// What the field's Mission Tracker checklist says about each record.
//
// Tested apart from the markup because the interesting decisions are all in the derivation: which
// name a row shows (the person, the object, or the record), and which of the three states it is in.
// Both are things a future change to a map's anchors could silently get wrong — a row reading a
// source's long historical title instead of "John Dickinson" is still a row, just a useless one.

import { describe, expect, it } from "vitest";

import { fieldObjectives } from "../../apps/web/src/main.js";

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
