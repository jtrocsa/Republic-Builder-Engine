// The Navigation Table's per-unit map views — Spine Review Part 11 (decision log 0087).
//
// The Navigation Table is the only screen that launches a case, and the only way to select one is
// to click its marker: `unlockNext()` unlocks the next case without selecting it, and `select-unit`
// only ever selects a unit's *first* case. `.atlas-table` is `overflow: hidden`. So a marker whose
// coordinates fall outside its unit's view is not a cosmetic problem — it is a case that cannot be
// started.
//
// Nothing said so. `UNIT_MAP_VIEW` stopped at unit-05 and `archiveScreen()` falls back to
// `DEFAULT_MAP_VIEW`, which is a sane default for a missing framing and a silent one for a missing
// entry — the same shape as `FIELD_COPY`'s fallback, which CLAUDE.md already warns about. Units 6
// and 7 shipped with four of their six markers projecting outside the Atlantic box: San Francisco
// at left -24.9%, Manila at 196.3%.
//
// This is that check. It reads the shipped units through the content repository rather than a
// hand-written list, so a Unit 8 that forgets its entry fails here on the day its cases land.

import { describe, expect, it } from "vitest";

import {
  DEFAULT_MAP_VIEW,
  MAP_VIEWS,
  UNIT_MAP_VIEW,
} from "../../apps/web/src/content/maps/navigation-table-views.js";
import { projectPoint } from "../../apps/web/src/engine/geo-projection.js";
import { loadChronicleContent } from "../../apps/web/src/repositories/local-content-repository.js";

// NAV_TABLE_VIEWPORT in main.js. Not exported — it is a layout constant inside a browser entry
// point — and the numbers only matter here as the space a percentage is taken against.
const VIEWPORT = { width: 1000, height: 620 };

// How far inside the box a marker has to sit. A marker is a medallion with a label pill hanging off
// it, so a case pinned exactly on the edge is still half-clipped; 3% of each axis is roughly the
// medallion's own footprint.
const MARGIN_X = VIEWPORT.width * 0.03;
const MARGIN_Y = VIEWPORT.height * 0.03;

const units = Object.values(loadChronicleContent()).map((entry) => entry.unit);
const viewFor = (unitId) => MAP_VIEWS[UNIT_MAP_VIEW[unitId]] || MAP_VIEWS[DEFAULT_MAP_VIEW];

describe("Navigation Table map views", () => {
  it("gives every shipped unit a view of its own", () => {
    const missing = units.map((unit) => unit.id).filter((id) => !UNIT_MAP_VIEW[id]);
    expect(
      missing,
      `units falling back to ${DEFAULT_MAP_VIEW}: ${missing.join(", ")} — check their cases fit ` +
        `that box before adding them here, or give them one`
    ).toEqual([]);
  });

  it("names no unit that does not exist, and no view that does not exist", () => {
    const real = new Set(units.map((unit) => unit.id));
    const orphanUnits = Object.keys(UNIT_MAP_VIEW).filter((id) => !real.has(id));
    expect(orphanUnits, `UNIT_MAP_VIEW keyed to a unit that is not shipped`).toEqual([]);

    const orphanViews = Object.values(UNIT_MAP_VIEW).filter((view) => !MAP_VIEWS[view]);
    expect(orphanViews, `UNIT_MAP_VIEW pointing at a view that is not defined`).toEqual([]);
    expect(MAP_VIEWS[DEFAULT_MAP_VIEW], "DEFAULT_MAP_VIEW is not a real view").toBeTruthy();
  });

  it("puts every case's marker inside its own unit's box", () => {
    const outside = [];
    for (const unit of units) {
      const view = viewFor(unit.id);
      for (const kase of unit.cases) {
        const { x, y } = projectPoint(
          [kase.mapPosition.lon, kase.mapPosition.lat],
          view.bounds,
          VIEWPORT
        );
        if (
          x < MARGIN_X ||
          x > VIEWPORT.width - MARGIN_X ||
          y < MARGIN_Y ||
          y > VIEWPORT.height - MARGIN_Y
        ) {
          outside.push(
            `${kase.id} (${unit.id}) at ${((x / VIEWPORT.width) * 100).toFixed(1)}%, ` +
              `${((y / VIEWPORT.height) * 100).toFixed(1)}%`
          );
        }
      }
    }
    expect(
      outside,
      `markers clipped out of .atlas-table, so these cases cannot be selected: ${outside.join("; ")}`
    ).toEqual([]);
  });

  it("keeps every view's own labels on the map too", () => {
    const outside = [];
    for (const [name, view] of Object.entries(MAP_VIEWS)) {
      for (const label of view.labels) {
        const { x, y } = projectPoint([label.lon, label.lat], view.bounds, VIEWPORT);
        // Wider than a marker's margin on x: a place label is set centred, and "ATLANTIC OCEAN" is
        // the longest string this table has.
        if (x < 90 || x > VIEWPORT.width - 90 || y < MARGIN_Y || y > VIEWPORT.height - MARGIN_Y) {
          outside.push(`${name}: "${label.text}" at ${x.toFixed(0)}, ${y.toFixed(0)}`);
        }
      }
    }
    expect(outside, `atlas labels off the edge: ${outside.join("; ")}`).toEqual([]);
  });
});
