// The slate table in `docs/design/THE-MAP-PROGRAM.md` §2 is governance, and until Phase 89E nothing
// enforced it.
//
// That table fixes which three activity engines each of the nine units runs, and states one
// invariant about itself: **adjacency holds throughout — no unit repeats its neighbour's three.**
// `validate:content` cross-checks a source's `activityRoute` against its activity's `kind` and has
// no opinion whatsoever about which three engines a unit should be running, so a unit built on the
// wrong slate validates cleanly, ships, and breaks a rule nobody is looking at.
//
// Which is exactly what happened. `unit-07-campaign.js` shipped in Phase 89 with a header saying
// "slate A — `interview` · `assembly` · `trace`". Slate A is `interview · assembly · discrepancy`;
// that line is **slate C's**, and slate C is Cottonwood Junction's, one unit earlier. Two further
// documents copied the sentence, Phase 89E authored a TRACE against it, and the whole third mission
// had to be rebuilt as a DISCREPANCY. Nothing failed at any point — the error was in prose, and
// prose is not executable.
//
// So this file makes the table executable. It reads the markdown rather than restating it, because
// a restatement is a second copy of the thing that went wrong. A reformat of those tables will
// break this test loudly, which is the correct outcome for a governance document: somebody should
// look.
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { UNIT_01_ACTIVITIES } from "../../apps/web/src/content/activities/unit-01-activities.js";
import { UNIT_02_ACTIVITIES } from "../../apps/web/src/content/activities/unit-02-activities.js";
import { UNIT_03_ACTIVITIES } from "../../apps/web/src/content/activities/unit-03-activities.js";
import { UNIT_04_ACTIVITIES } from "../../apps/web/src/content/activities/unit-04-activities.js";
import { UNIT_05_ACTIVITIES } from "../../apps/web/src/content/activities/unit-05-activities.js";
import { UNIT_06_ACTIVITIES } from "../../apps/web/src/content/activities/unit-06-activities.js";
import { UNIT_07_ACTIVITIES } from "../../apps/web/src/content/activities/unit-07-activities.js";
import { UNIT_08_ACTIVITIES } from "../../apps/web/src/content/activities/unit-08-activities.js";

/**
 * Every unit that has authored activities, by its number in the map program's table.
 *
 * **Hand-written, and therefore guarded below.** It stopped at 7 for the whole of Phase 99, so
 * Unit 8's three missions were never checked against the slate they were built on — the same
 * stale-per-unit-table shape that let `checkActivityRoutes()` skip that unit entirely. The slate
 * happened to be right; nothing here would have said so if it had not been. The last case in this
 * file reads the activities directory and fails when a module exists with no line here.
 */
const SHIPPED = {
  1: UNIT_01_ACTIVITIES,
  2: UNIT_02_ACTIVITIES,
  3: UNIT_03_ACTIVITIES,
  4: UNIT_04_ACTIVITIES,
  5: UNIT_05_ACTIVITIES,
  6: UNIT_06_ACTIVITIES,
  7: UNIT_07_ACTIVITIES,
  8: UNIT_08_ACTIVITIES,
};

// Resolved off the repo root rather than import.meta.url, for the reason activity-content.test.js
// records: Vitest rewrites that to a non-file URL.
const PROGRAM = readFileSync(join(process.cwd(), "docs/design/THE-MAP-PROGRAM.md"), "utf8");

/** The engines a slate letter names, read off §2's first table. */
function slateDefinitions() {
  const slates = {};
  for (const line of PROGRAM.split("\n")) {
    const row = line.match(/^\|\s*\*\*([A-D])\*\*\s*\|([^|]+)\|/);
    if (!row) continue;
    slates[row[1]] = row[2]
      .split("·")
      .map((engine) => engine.trim())
      .filter(Boolean);
  }
  return slates;
}

/** The slate letter each unit is assigned, read off §2's second table. */
function unitSlates() {
  const units = {};
  for (const line of PROGRAM.split("\n")) {
    const row = line.match(/^\|\s*(\d)\s*\|[^|]+\|\s*\*\*([A-D])\*\*\s*\|/);
    if (!row) continue;
    units[Number(row[1])] = row[2];
  }
  return units;
}

const SLATES = slateDefinitions();
const ASSIGNED = unitSlates();

describe("the slate table is a table, not a suggestion", () => {
  it("parses four slates and nine units out of THE-MAP-PROGRAM.md §2", () => {
    // If this fails, the tables were reformatted and every assertion below is now vacuous. That is
    // the failure mode a governance test most has to avoid: silently passing because it stopped
    // reading anything.
    expect(Object.keys(SLATES).sort()).toEqual(["A", "B", "C", "D"]);
    for (const engines of Object.values(SLATES)) expect(engines).toHaveLength(3);
    expect(Object.keys(ASSIGNED)).toHaveLength(9);
  });

  it("gives every unit with authored activities exactly the three engines its slate names", () => {
    // Order is deliberately not checked. The table lists engines in a canonical order and a content
    // file lists its missions in play order, and those are different questions — Unit 4 ships
    // trace/discrepancy/assembly against slate D's assembly/discrepancy/trace, which is fine.
    for (const [unitNumber, activities] of Object.entries(SHIPPED)) {
      const letter = ASSIGNED[Number(unitNumber)];
      const expected = [...SLATES[letter]].sort();
      const actual = Object.values(activities)
        .map((activity) => activity.kind)
        .sort();
      expect(
        actual,
        `unit-0${unitNumber} runs [${actual}] but is slate ${letter}, which is [${expected}]`
      ).toEqual(expected);
    }
  });

  it("keeps adjacency: no unit repeats its neighbour's three", () => {
    // The table states this about itself, and it is the invariant a wrong slate breaks first —
    // Unit 7 built on slate C would have been Cottonwood Junction's three engines exactly. Checked
    // across all nine assignments rather than only the shipped ones, so Units 8 and 9 are covered
    // before a line of their content exists.
    for (let unit = 1; unit < 9; unit += 1) {
      const here = ASSIGNED[unit];
      const next = ASSIGNED[unit + 1];
      expect(
        here,
        `units ${unit} and ${unit + 1} are both slate ${here} — adjacency does not hold`
      ).not.toBe(next);
    }
  });

  it("keeps every unit's slate reachable — a slate names three of the four real engines", () => {
    // Cheap, and it catches the other direction of the Phase 89E mistake: a slate line edited to
    // name an engine that does not exist would pass the two tests above by making its unit
    // unbuildable rather than wrong.
    const ENGINES = new Set(["interview", "assembly", "discrepancy", "trace"]);
    for (const [letter, engines] of Object.entries(SLATES)) {
      for (const engine of engines) {
        expect(ENGINES, `slate ${letter} names "${engine}", which is not an engine`).toContain(
          engine
        );
      }
      expect(new Set(engines).size, `slate ${letter} repeats an engine`).toBe(3);
    }
  });

  it("checks every unit that has activities, not every unit somebody remembered to list", () => {
    // The guard on SHIPPED above. A hand-written per-unit list with a sane fallback and no test is
    // how a whole unit ships unchecked, and this file is a governance test — one that quietly
    // stops covering a unit is worse than none, because the run still says green.
    const modules = readdirSync(join(process.cwd(), "apps/web/src/content/activities"))
      .map((file) => file.match(/^unit-0(d)-activities.js$/))
      .filter(Boolean)
      .map((match) => Number(match[1]));
    const unlisted = modules.filter((unit) => !SHIPPED[unit]);
    expect(
      unlisted,
      `activities modules with no line in SHIPPED: ${unlisted.map((n) => `unit-0${n}`).join(", ")}`
    ).toEqual([]);
  });
});
