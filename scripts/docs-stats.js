// Prints the repo counts that documentation keeps quoting, measured from the repo itself.
//
// Run with: node scripts/docs-stats.js   (or `npm run docs:stats`)
//
// This exists because CLAUDE.md hard-coded these figures in prose and four of them had drifted at
// once — e2e specs 35 (actually 48), e2e tests 174 (254), visual baselines 51 (55), asset files 718
// (792). A number written into a sentence has no way to notice the repo moved underneath it, and a
// stale figure in the file every session reads is worse than no figure. Quote the command instead.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { basename, dirname, join, resolve } from "node:path";

import { UNIT_IDS } from "../apps/web/src/content/unit-registry.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const walk = (dir) => {
  let out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(full));
    else out.push(full);
  }
  return out;
};

// `wc -l` counts newline characters, so a file that ends in one has no line after it. Splitting on
// "\n" invents that empty last line, and this reported main.js one line longer than the count
// CLAUDE.md tells the reader to take with `wc -l`. A stats tool that disagrees by one with the
// command it stands in for is the same defect as a stale figure, in miniature.
const lines = (p) => {
  const text = readFileSync(join(ROOT, p), "utf8");
  return text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
};
const countIn = (dir, test) => {
  try {
    return walk(join(ROOT, dir)).filter(test).length;
  } catch {
    return 0;
  }
};

const rows = [];
rows.push(["main.js", `${lines("apps/web/src/main.js").toLocaleString()} lines`]);
rows.push(["global.css", `${lines("apps/web/src/styles/global.css").toLocaleString()} lines`]);
rows.push(["CLAUDE.md", `${statSync(join(ROOT, "CLAUDE.md")).size.toLocaleString()} bytes`]);

const unitFiles = countIn("tests/unit", (f) => f.endsWith(".test.js"));
rows.push(["unit test files", String(unitFiles)]);

const e2eFiles = countIn(
  "tests/e2e",
  (f) => f.endsWith(".spec.js") && !basename(f).startsWith("_")
);
rows.push(["e2e spec files", String(e2eFiles)]);

const baselines = countIn("tests/e2e", (f) => f.endsWith("-chromium-win32.png"));
rows.push(["visual baselines (win32)", String(baselines)]);

const assets = countIn("apps/web/src/assets", () => true);
rows.push(["asset files", String(assets)]);

const tilesets = countIn("apps/web/src/assets/tilesets", () => true);
rows.push(["  of which tilesets", String(tilesets)]);

// --- the surfaces, and the units and cases that add to them -----------------------------------
// These are the figures the always-loaded documents got wrong most often. Phase 118 checked twelve
// counted claims across CLAUDE.md, ARCHITECTURE-QUICKREF.md and INVARIANTS.md and all twelve were
// wrong, and eleven of them were a count of something a new unit adds to: maps, interiors, cases,
// missions, interviews. They do not rot at random. They rot along one axis, and that axis has moved
// nine times. (The twelfth was main.js's line count, which already had a row here and a warning
// beside it in CLAUDE.md, and was still 235 lines out. A warning is not a reader.)
//
// So they are derived from main.js's own tables rather than listed here. A unit arriving moves
// these numbers on the next run; a sentence in a document cannot notice it arrived at all. If the
// shape of those tables changes this prints "(could not measure)" rather than a wrong number,
// which is the only honest failure for a tool whose whole job is being right about counts.
const mapFiles = walk(join(ROOT, "apps/web/src/content/maps"))
  .filter((f) => f.endsWith(".tmj"))
  .map((f) => basename(f, ".tmj"));

const surfaces = (() => {
  try {
    const src = readFileSync(join(ROOT, "apps/web/src/main.js"), "utf8");
    const from = src.indexOf("export const FIELD_MAPS = {");
    const to = src.indexOf("\n};", from);
    if (from < 0 || to < 0) return null;
    const live = (src.slice(from, to).match(/^ {2}"unit-\d\d": \{$/gm) || []).length;
    const interiorIds = [];
    for (const block of src.matchAll(/FIELD_MAPS\["unit-\d\d"\]\.interiors = \{([\s\S]*?)\n\};/g)) {
      for (const key of block[1].matchAll(/^ {2}"([\w-]+)": \{$/gm)) interiorIds.push(key[1]);
    }
    if (!live || !interiorIds.length) return null;
    // Hub rooms by subtraction rather than by naming the three, so a fourth shows up here instead
    // of being silently absorbed into whatever number was written down last.
    const hub = mapFiles.filter((f) => !f.endsWith("-field") && !interiorIds.includes(f)).length;
    const outdoorFiles = mapFiles.filter((f) => f.endsWith("-field")).length;
    return { live, interiors: interiorIds.length, hub, outdoorFiles };
  } catch {
    return null;
  }
})();

if (surfaces) {
  rows.push(["walkable surfaces", String(surfaces.live + surfaces.interiors + surfaces.hub)]);
  rows.push(["  outdoor field maps", String(surfaces.live)]);
  rows.push(["  field interiors", String(surfaces.interiors)]);
  rows.push(["  Institute hub rooms", String(surfaces.hub)]);
  const ahead = surfaces.outdoorFiles - surfaces.live;
  rows.push([
    ".tmj files committed",
    ahead ? `${mapFiles.length} (${ahead} ahead of its unit)` : String(mapFiles.length),
  ]);
} else {
  rows.push(["walkable surfaces", "(could not measure)"]);
  rows.push([".tmj files committed", String(mapFiles.length)]);
}

const campaigns = UNIT_IDS.map((id) => {
  try {
    return readFileSync(join(ROOT, `apps/web/src/content/${id}-campaign.js`), "utf8");
  } catch {
    return "";
  }
});
const caseCount = campaigns.reduce((n, s) => n + (s.match(/id: "case-\d{3}"/g) || []).length, 0);
const fieldCases = campaigns.reduce((n, s) => n + (s.match(/route: "field"/g) || []).length, 0);
const playableUnits = (() => {
  try {
    const src = readFileSync(join(ROOT, "apps/web/src/main.js"), "utf8");
    const match = src.match(/export const UNITS = \[([^\]]*)\]/);
    return match ? match[1].split(",").filter((entry) => entry.trim()).length : 0;
  } catch {
    return 0;
  }
})();
rows.push([
  "units registered",
  playableUnits ? `${UNIT_IDS.length} (${playableUnits} playable)` : String(UNIT_IDS.length),
]);
if (caseCount) {
  rows.push(["cases registered", String(caseCount)]);
  rows.push(["  walk a map", String(fieldCases)]);
  rows.push(["  non-map", String(caseCount - fieldCases)]);
}

const decisions = countIn("docs/decision-log", (f) => f.endsWith(".md"));
rows.push(["decision-log entries", String(decisions)]);

const docs = countIn("docs", (f) => f.endsWith(".md"));
rows.push(["docs (.md)", String(docs)]);

// Counts that need a tool to answer honestly rather than a filesystem walk.
const tryRun = (label, cmd, args, extract) => {
  try {
    const out = execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8", stdio: "pipe" });
    const value = extract(out);
    if (value) rows.push([label, value]);
  } catch {
    rows.push([label, "(could not measure)"]);
  }
};

tryRun(
  "e2e tests",
  process.execPath,
  [join(ROOT, "node_modules/@playwright/test/cli.js"), "test", "--list"],
  (out) => {
    const m = out.match(/Total: (\d+) tests? in (\d+) files?/);
    return m ? `${m[1]}` : null;
  }
);

tryRun(
  "validate:content groups",
  process.execPath,
  [join(ROOT, "scripts/validate-content.js")],
  (out) => {
    const ok = (out.match(/^\s*ok\s/gm) || []).length;
    return ok ? String(ok) : null;
  }
);

const width = Math.max(...rows.map(([k]) => k.length));
console.log("\nChronicle repo stats\n");
for (const [k, v] of rows) console.log(`  ${k.padEnd(width)}  ${v}`);
console.log("");
