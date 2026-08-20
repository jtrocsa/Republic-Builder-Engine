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

import { findRoute } from "../../apps/web/src/engine/npc-routing.js";

import {
  DEFAULT_PROGRESS,
  readProgress,
  saveProgress,
} from "../../apps/web/src/engine/chronicle-progress-store.js";
import { MERIDIAN_REVEAL, MERIDIAN_REVEAL_TRIGGER } from "../../apps/web/src/content/cutscenes.js";
import {
  FIELD_MAPS,
  HUB_TARGETS,
  MAX_LIAISON_TRUST,
  HUB_NAV_GRID,
  liaisonLine,
  sourcesForCase,
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
  // happen to (docs/design/THE-MAP-PROGRAM.md §4). Unit 6 is on this list too as of Phase 88: the
  // reveal lands in that unit, but it lands in the Institute, and her *ambient* line on the
  // railhead is still the puzzled one that sets it up.
  const LIAISON_MAPS = ["unit-01", "unit-02", "unit-03", "unit-04", "unit-05", "unit-06"];

  // Every line Voss has before the reveal: three at the Institute, one per authored field map.
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

    expect(offenders, "the reveal leaked into a line below it").toEqual([]);
  });
});

// Phase 88, and the other half of the ban above. THE-FIELD-LIAISON.md §4 puts the reveal in Unit 6
// and the quickref's Phase 88 entry asked where the test's floor now sits: the ban covers every
// line the player can reach *before* Scene D, and these cover the ones only reachable after it. A
// ban on its own would pass a game in which the reveal quietly stopped revealing.
describe("after the reveal", () => {
  it("opens from the interaction the scene declares, once that case's missions are filed", () => {
    // The trigger is content rather than a condition buried in main.js, so it is checkable. Its
    // three fields have to point at things that exist — a target that is not in HUB_TARGETS would
    // make the scene unreachable and fail nothing.
    expect(HUB_TARGETS[MERIDIAN_REVEAL_TRIGGER.target]).toBeTruthy();
    expect(MERIDIAN_REVEAL_TRIGGER.afterCase).toMatch(/^case-\d{3}$/);
    expect(sourcesForCase(MERIDIAN_REVEAL_TRIGGER.afterCase).length).toBeGreaterThan(0);
  });

  it("says the word once it is out (normal case)", () => {
    const revealed = FIELD_MAPS["unit-06"].npcs.find((npc) => npc.id === "liaison").revealedText;

    expect(liaisonLine(0, true)).toMatch(/\S/);
    expect(revealed, "Unit 6 has no post-reveal field line").toMatch(/Meridian/);
  });

  it("supersedes the trust bands rather than adding a fourth (normal case)", () => {
    // Trust still counts what it counted; it is just no longer the interesting thing about
    // standing in front of her, and three variations on the same line would read as though the
    // game had forgotten the scene happened.
    const lines = new Set([liaisonLine(0, true), liaisonLine(1, true), liaisonLine(3, true)]);

    expect(lines.size).toBe(1);
    expect(lines.has(liaisonLine(0))).toBe(false);
  });

  it("leaves the five deniable-beat maps exactly as authored (edge case)", () => {
    // The Units 3-5 lines are the reveal ladder's second rung, and their design is that an innocent
    // reading survives a first pass. Overwriting them the moment the player knows would delete the
    // clue they are finally equipped to re-read — which is what §4 says replay exists for. Only the
    // map the reveal belongs to gets a second line.
    const withSecondLine = [
      "unit-01",
      "unit-02",
      "unit-03",
      "unit-04",
      "unit-05",
      "unit-06",
    ].filter((id) => FIELD_MAPS[id].npcs.find((npc) => npc.id === "liaison").revealedText);

    expect(withSecondLine).toEqual(["unit-06"]);
  });

  it("walks her somewhere she can actually reach (invalid data)", () => {
    // `moveActor` does `findRoute(...) || []`, so an unreachable destination is not an error — it is
    // a walk that finishes instantly where it started, with the scene playing on around it. The
    // step-off beat would silently become Voss standing still, and nothing would say so. Every
    // `moveActor` in the scene is checked, including the walk home.
    const unreachable = MERIDIAN_REVEAL.commands
      .filter((command) => command.op === "moveActor")
      .filter((command, index, walks) => {
        const from = index === 0 ? HUB_TARGETS.liaison : walks[index - 1].to;
        const route = findRoute(HUB_NAV_GRID, from, command.to);
        return !route || route.length === 0;
      });

    expect(unreachable.map((command) => command.to)).toEqual([]);
  });

  it("puts her back on the anchor every other system reads (edge case)", () => {
    // `HUB_TARGETS.liaison` is a fixed coordinate for the marker, the proximity check and the
    // dialogue. A scene that walks her and forgets to walk her home leaves her interactable from
    // a cell she is not standing on — which is why both scenes end with the same `moveActor`.
    const walksHome = MERIDIAN_REVEAL.commands
      .filter((command) => command.op === "moveActor" && command.actor === "liaison")
      .pop();

    expect(walksHome.to).toEqual({ x: HUB_TARGETS.liaison.x, y: HUB_TARGETS.liaison.y });
  });
});
