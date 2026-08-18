// A sequencing quest must not ship already solved.
//
// `renderSequencingQuest()` lays items out in the authored array's order and never shuffles, so a
// quest whose `items` are written `position: 0, 1, 2, 3, 4` opens in the answer and grades the
// student correct for touching nothing. That is not a subtle failure — it is a mission that cannot
// be got wrong — and it is completely invisible to every other check: the schema is satisfied, the
// ids are unique, `validate:content` passes, and the quest renders beautifully.
//
// It has now happened five times across three units. Unit 2's was fixed in Phase 70 and three more
// survived in Units 3 and 4 until Phase 81F, sitting in `ARCHITECTURE-QUICKREF.md` as a known
// defect for eleven phases because fixing it was always somebody else's open file. A rule that only
// lives in prose is how that happens, so this is the rule as a failing test.
//
// Read through `loadChronicleContent()` rather than off a hand-written list of imports: that is the
// same shape `scripts/validate-content.js` consumes, so a sixth unit is covered the moment its
// arrays are registered rather than whenever somebody remembers this file exists.
import { describe, it, expect } from "vitest";

import { loadChronicleContent } from "../../apps/web/src/repositories/local-content-repository.js";

// Every key in a unit's content bundle that holds sequencing quests. A quest is a quest whatever
// screen hosts it — a Practice Check, an Archive Challenge and an Investigation Challenge all run
// the same renderer and all fail the same way.
const SEQUENCING_KEYS = [
  "sequencingQuests",
  "archiveSequencingQuests",
  "investigationSequencingQuests",
];

const shippedQuests = () =>
  Object.entries(loadChronicleContent()).flatMap(([unitKey, unit]) =>
    SEQUENCING_KEYS.flatMap((key) => (unit[key] || []).map((quest) => ({ unitKey, key, quest })))
  );

describe("sequencing quests: authored out of order", () => {
  it("finds sequencing quests to check at all (guards the sweep itself)", () => {
    // Without this, a rename of any key above turns the whole file into a test that passes by
    // finding nothing — which is the failure mode of every content sweep written this way.
    expect(shippedQuests().length).toBeGreaterThanOrEqual(9);
  });

  it("ships none of them already solved", () => {
    const solved = shippedQuests()
      .filter(({ quest }) => quest.items.every((item, index) => item.position === index))
      .map(({ unitKey, key, quest }) => `${unitKey}.${key}: ${quest.id}`);
    expect(
      solved,
      "a sequencing quest whose items are in position order opens in the answer and grades a student correct for doing nothing — reorder the array and leave each item's `position` alone"
    ).toEqual([]);
  });

  it("keeps every quest's positions a complete run, whatever order they are written in", () => {
    // The other half of the same edit. Reordering an array by hand is exactly the moment a
    // `position` gets dragged along with its item or edited to match its new index, and a run with
    // a duplicate or a hole grades nobody correctly ever.
    const broken = shippedQuests()
      .filter(({ quest }) => {
        const sorted = quest.items.map((item) => item.position).sort((a, b) => a - b);
        return !sorted.every((position, index) => position === index);
      })
      .map(({ quest }) => quest.id);
    expect(broken, "a quest's positions are not 0..n-1 exactly once each").toEqual([]);
  });
});
