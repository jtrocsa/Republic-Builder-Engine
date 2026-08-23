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

const lines = (p) => readFileSync(join(ROOT, p), "utf8").split("\n").length;
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

const maps = countIn("apps/web/src/content/maps", (f) => f.endsWith(".tmj"));
rows.push([".tmj maps", String(maps)]);

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
