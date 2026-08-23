// Runs every .tmj generator in scripts/, in sorted order.
//
// Run with: node scripts/build-maps.js   (or `npm run maps:build`)
//
// This replaced an eighteen-command `&&` chain in package.json's `maps:build`. The chain was one
// more hand-maintained per-map list, and the audit that removed it found three others that had
// silently stopped at unit-05 — a generator omitted from the chain would simply never run, and the
// .tmj it owns would drift from its generator with nothing failing. A glob cannot forget.
//
// Each generator runs in its OWN child process, exactly as the chain did — same isolation, same
// eighteen invocations — so this is a drop-in replacement and not a behaviour change.
//
//   !! DO NOT RUN THIS TO "REFRESH" THE MAPS, AND DO NOT PUT IT IN A CHECK, A HOOK, OR CI. !!
//
// The committed maps have drifted from their generators, and the drift predates this script. A
// regeneration today rewrites the *_ROADS arrays of all seven outdoor maps, dropping roughly 2,000
// road cells — Caribbean 75 to 0, Richmond 608, Common Cause 519, Canal Crossroads 512, Riverbend
// 99, Immigrant Port 152, Railhead 124. Those cells are read at runtime by engine/npc-routing.js,
// which costs a road cell a quarter of open ground so a routed NPC walks the road rather than
// cutting across the fields. Losing them changes how the cast moves on every outdoor map.
//
// It is pre-existing, and reproduces identically from a single bare invocation of one generator, so
// the batching here is not the cause. The roads were committed by 8e4a754 (2026-08-03), a Phase 81C
// commit about the Entrance Hall cutscene whose message does not mention maps at all; something
// changed afterwards that reduces road output. The committed data is what ships, what the 55 visual
// baselines were captured against, and what the NPC-routing e2e specs pass on — so it is the version
// to trust until somebody works out which input moved.
//
// Order is sorted by filename and does not matter; sorting only keeps the log stable.

import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));

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

console.log(`\nDone. ${generators.length} maps built.`);
