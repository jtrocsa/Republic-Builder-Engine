import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * Every `walkToNpc()` in the e2e suite names a body that cannot walk away.
 *
 * The question this asks. `walkTo` promises the target was in reach at **one instant** — the frame
 * the game's own `.is-near` appeared — and every caller then does something that re-asks: `E` goes
 * through `nearestFieldInteraction()`, a click through `isNearFieldNpc()`. For a stationed body the
 * promise still holds a round trip later. For a body with a job that moves it, it need not, and the
 * press is refused.
 *
 * `0127` §5 found this on the Taíno child and fixed it with `openFieldNpc()`, which makes the walk
 * and the press one operation and retries. But it scoped the fix in prose to the game's fifteen
 * `kind: "wander"` bodies, and that reads as though the world divides into the child and stationed
 * people. It does not. **`kind: "route"` walks too, and further** — the settlement carpenter covers
 * a 7.52-tile leg between his barn yard and his bench, against the child's 1.2-tile disc — and four
 * route walkers were being walked to and pressed. The carpenter's was this suite's last intermittent
 * failure: measured at 4 refusals in 12 pressing after the walk, 0 in 12 with the two as one
 * operation, both arms in one file and one window.
 *
 * So the criterion is `kind !== "station"`, and it is a static one: a spec that walks to a body that
 * moves should be using `openFieldNpc()` instead. This reads `main.js` as source text, the same way
 * `field-map-coordinates.test.js` does and for the same reason — the behaviour tables are object
 * literals in a browser entry point, not exports.
 *
 * See decision log `0145`.
 */

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");
const mainSource = readFileSync(join(repoRoot, "apps", "web", "src", "main.js"), "utf8");
const e2eDir = join(repoRoot, "tests", "e2e");

/**
 * The eighteen `*_BEHAVIOURS` tables, as source text, one entry per table.
 *
 * Scoped to the tables rather than searched for across the whole file, because a bare `liaison: {`
 * at two spaces of indent is also how `HUB_TARGETS` opens Emery Voss's hub marker — which carries
 * no `kind` and is not a field posting at all. A file-wide search reported her as not stationed on a
 * surface she is stationed on all nine of. `walkToNpc` is a field helper; these are its tables.
 */
const behaviourTables = [...mainSource.matchAll(/^const [A-Z0-9_]*BEHAVIOURS = \{$/gm)].map(
  (match) => {
    const start = match.index;
    // Each table is a top-level literal, so its close is the first `};` at column 0 after it.
    const end = mainSource.indexOf("\n};", start);
    return mainSource.slice(start, end === -1 ? mainSource.length : end);
  }
);

/**
 * Every `kind` this id is posted with, across every behaviour table.
 *
 * An id can be posted differently on different maps — Emery Voss has nine entries — so this
 * collects all of them rather than the first. A behaviour key is `"id": {` or, for ids that are
 * valid identifiers, a bare `id: {`; the `*_FIELD_NPCS` rosters write `id: "the-id",` instead, so
 * matching on the key shape keeps the two apart.
 */
function behaviourKinds(id) {
  const kinds = [];
  for (const table of behaviourTables) {
    const key = new RegExp(`^\\s{2}(?:"${id}"|${id}):\\s*\\{`, "gm");
    let match;
    while ((match = key.exec(table)) !== null) {
      // The kind is on the key's own line for a one-liner and on the next line for a routed body.
      const kind = /kind:\s*"([a-z]+)"/.exec(table.slice(match.index, match.index + 240));
      kinds.push(kind ? kind[1] : "(no kind)");
    }
  }
  return kinds;
}

const specs = readdirSync(e2eDir).filter((name) => name.endsWith(".spec.js"));

describe("a spec walks to a body that will still be there", () => {
  it("finds the e2e suite to read", () => {
    expect(specs.length).toBeGreaterThan(40);
  });

  for (const spec of specs) {
    const source = readFileSync(join(e2eDir, spec), "utf8");
    // `walkToNpc(page, "id")`. A call built from a variable cannot be checked here, and is caught
    // by the separate assertion below rather than passing silently.
    const calls = [...source.matchAll(/walkToNpc\(\s*\w+\s*,\s*([^),]+)/g)].map((m) => m[1].trim());
    if (!calls.length) continue;

    it(`${spec} walks only to stationed bodies`, () => {
      for (const arg of calls) {
        const literal = /^"([^"]+)"$/.exec(arg);
        expect(
          literal,
          `${spec} calls walkToNpc with ${arg}, which this guard cannot resolve to a body. ` +
            `Pass a string literal, or use openFieldNpc() so the game rather than this test says ` +
            `whether the press landed.`
        ).not.toBeNull();

        const id = literal[1];
        const kinds = behaviourKinds(id);
        expect(
          kinds.length,
          `${spec} walks to "${id}", which has no behaviour entry in main.js`
        ).toBeGreaterThan(0);

        const moving = kinds.filter((kind) => kind !== "station");
        expect(
          moving,
          `${spec} walks to "${id}", which is posted ${moving.join("/")} and so can walk out of ` +
            `reach between the walk and the press that follows it — the walk would report success ` +
            `and the press would be refused, intermittently and only under load. ` +
            `Use openFieldNpc(page, "${id}") instead, which makes the two one operation.`
        ).toEqual([]);
      }
    });
  }
});
