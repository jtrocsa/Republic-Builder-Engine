// The Field Liaison, and the two rules about her that are cheap to break silently.
//
// Emery Voss is specified in docs/design/THE-FIELD-LIAISON.md and debuted in Phase 80. Two of that
// document's constraints are enforceable here rather than by review:
//
//   1. `liaisonTrust` selects tone and nothing else (§5). It is a small bounded integer, it must
//      survive a save written before it existed, and it must never run off the end of the authored
//      bands — a trust score the lines do not cover is a blank speech bubble.
//   2. Voss never names Meridian before the reveal, and the reveal lands in Unit 6 — the railhead
//      — by the author's decision, one rung later than §4's "Units 5-6" band allows. So the ban
//      covers every map she currently stands on: Units 1-2 are the trusted-helper floor, and
//      Units 3-5 carry the three deniable beats (arrives unassigned, steers away from one clue,
//      recognises equipment too fast) whose whole design is that an innocent reading stays
//      available. A line that says the word outright collapses all three, and would fail nothing
//      else.

import { describe, it, expect, beforeEach } from "vitest";

import {
  DEFAULT_PROGRESS,
  readProgress,
  saveProgress,
} from "../../apps/web/src/engine/chronicle-progress-store.js";
import {
  FIELD_MAPS,
  HUB_TARGETS,
  MAX_LIAISON_TRUST,
  liaisonLine,
} from "../../apps/web/src/main.js";

beforeEach(() => {
  localStorage.clear();
});

describe("progress.story", () => {
  it("starts at zero trust with no flags (normal case)", () => {
    expect(DEFAULT_PROGRESS.story).toEqual({ liaisonTrust: 0, flags: {} });
  });

  it("defaults itself onto a save written before it existed (edge case)", () => {
    const old = structuredClone(DEFAULT_PROGRESS);
    delete old.story;
    saveProgress(old);

    expect(readProgress().story).toEqual({ liaisonTrust: 0, flags: {} });
  });

  it("keeps a saved trust score and still backfills flags (edge case)", () => {
    saveProgress({ ...structuredClone(DEFAULT_PROGRESS), story: { liaisonTrust: 4 } });

    expect(readProgress().story).toEqual({ liaisonTrust: 4, flags: {} });
  });
});

describe("liaisonLine", () => {
  it("plays three distinct lines across the three bands (normal case)", () => {
    const lines = [liaisonLine(0), liaisonLine(1), liaisonLine(3)];

    expect(new Set(lines).size).toBe(3);
    expect(lines.every((line) => line.length > 0)).toBe(true);
  });

  it("holds each band across its whole range (normal case)", () => {
    expect(liaisonLine(2)).toBe(liaisonLine(1));
    expect(liaisonLine(MAX_LIAISON_TRUST)).toBe(liaisonLine(3));
  });

  it("still answers past the clamp and below zero (invalid data)", () => {
    expect(liaisonLine(MAX_LIAISON_TRUST + 40)).toBe(liaisonLine(3));
    expect(liaisonLine(-1)).toBe(liaisonLine(0));
  });
});

describe("the reveal ladder below Unit 6", () => {
  // Every field map with a walkable surface. Voss stands on all of them as of Phase 81E, which is
  // what the reveal ladder needed to exist at all — before it, rungs two and three had nobody to
  // happen to (docs/design/THE-MAP-PROGRAM.md §4).
  const LIAISON_MAPS = ["unit-01", "unit-02", "unit-03", "unit-04", "unit-05"];

  // Every line Voss currently has: three at the Institute, one per authored field map.
  const shippedLines = () => [
    liaisonLine(0),
    liaisonLine(1),
    liaisonLine(3),
    ...LIAISON_MAPS.map((id) => FIELD_MAPS[id].npcs.find((npc) => npc.id === "liaison").text),
  ];

  it("posts Voss on every authored field map (normal case)", () => {
    for (const id of LIAISON_MAPS) {
      const voss = FIELD_MAPS[id].npcs.find((npc) => npc.id === "liaison");
      expect(voss, `${id} has no liaison`).toBeTruthy();
      expect(voss.sprite).toBe("liaison");
      expect(FIELD_MAPS[id].behaviours.liaison).toBeTruthy();
    }
  });

  it("names her from one string, so renaming stays a content edit (normal case)", () => {
    const names = new Set([
      HUB_TARGETS.liaison.name,
      ...LIAISON_MAPS.map((id) => FIELD_MAPS[id].npcs.find((npc) => npc.id === "liaison").name),
    ]);

    expect(names).toEqual(new Set(["Emery Voss"]));
  });

  // The pill carries the name where every other NPC's carries a role, on every map — a recurring
  // companion does not get reintroduced by caption. §1 of THE-FIELD-LIAISON.md, and it is one
  // word to get wrong when copying a roster entry.
  it("labels her by name rather than by her job (normal case)", () => {
    for (const id of LIAISON_MAPS) {
      const voss = FIELD_MAPS[id].npcs.find((npc) => npc.id === "liaison");
      expect(voss.label, `${id} labels Voss by role`).toBe("Emery Voss");
    }
  });

  it("never mentions Meridian or wears its mark this early (edge case)", () => {
    const offenders = shippedLines().filter((line) => /meridian|insignia/i.test(line));

    expect(offenders, "the reveal leaked into a Units 1-2 line").toEqual([]);
  });
});
