// Runs every .tmj generator in scripts/, in sorted order, then formats what they wrote.
//
// Run with: node scripts/build-maps.js   (or `npm run maps:build`)
//
// This replaced an eighteen-command `&&` chain in package.json's `maps:build`. The chain was one
// more hand-maintained per-map list, and the audit that removed it found three others that had
// silently stopped at unit-05 — a generator omitted from the chain would simply never run, and the
// .tmj it owns would drift from its generator with nothing failing. A glob cannot forget.
//
// Each generator runs in its OWN child process, exactly as the chain did — same isolation, same
// eighteen invocations.
//
// ── The Prettier step, and the false alarm that put it here ────────────────────────────────────
//
// map-builder.js writes a road network eight cells to a line, deliberately: it is the largest of
// the three exports by an order of magnitude and one cell per line makes a layout diff unreadable.
// Prettier disagrees and expands it back to one per line. So before this step existed, a plain
// regeneration left seven modified files whose diffs read as ~75 deletions against ~10 insertions
// apiece — and the Phase 90 workflow audit read those deleted lines as deleted road cells,
// concluded that regeneration dropped roughly 2,000 of them, and put a DO-NOT-RUN warning here.
//
// That was wrong, and the way it was wrong is worth keeping: **a line count is not a data count.**
// Regenerating all eighteen maps and then running Prettier produces a byte-identical working tree
// — every road cell, every collision rect and every door of all seven outdoor maps compared as
// sets, not as text. No .tmj changes at all. The generators and the committed maps agree and
// always did.
//
// Formatting here is what makes that checkable at a glance: `npm run maps:build` now leaves a
// clean tree, so `git status` afterwards is a real answer to "did anything actually change?"
// rather than noise somebody has to re-litigate.

import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);

const generators = readdirSync(here)
  .filter((name) => name.startsWith("generate-") && name.endsWith("-tmj.js"))
  .sort();

if (generators.length === 0) {
  console.error("No scripts/generate-*-tmj.js found — nothing to build.");
  process.exit(1);
}

console.log(`Building ${generators.length} maps.\n`);

for (const name of generators) {
  console.log(`--- ${name}`);
  execFileSync(process.execPath, [join(here, name)], { stdio: "inherit" });
}

// Resolved the same way scripts/hooks/pre-commit.js resolves it: `npx prettier` shells out to
// npx.cmd on Windows, which execFileSync refuses with EINVAL.
const prettierBin = join(
  dirname(fileURLToPath(import.meta.resolve("prettier/package.json"))),
  "bin/prettier.cjs"
);
console.log("\n--- prettier (the generators write roads 8 to a line; Prettier wants 1)");
execFileSync(process.execPath, [prettierBin, "--write", "apps/web/src/content/maps/*.blocks.js"], {
  cwd: repoRoot,
  stdio: "inherit",
});

console.log(
  `\nDone. ${generators.length} maps built. A clean git status here means nothing moved.`
);
