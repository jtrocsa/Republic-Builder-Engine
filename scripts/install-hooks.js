// Installs the repo's git hooks. Run automatically by npm's `prepare` lifecycle after `npm install`.
//
// Why a script instead of husky: the repo has no runtime need for another dependency, and every
// other piece of tooling here is a plain Node script under scripts/. This writes one file.
//
// What it guards: pushing to main auto-deploys to Vercel, and until this existed nothing at all ran
// between a commit and production. Seven of the 120 commits before it were pure "Prettier gets the
// last word" / "Lint:" cleanup after the fact — work done twice because the check ran too late.
//
// The hook is deliberately narrow. It formats and lints STAGED FILES ONLY, so it stays fast enough
// that nobody is tempted to reach for --no-verify. The slow checks (test, validate:content, spell)
// belong in `npm run check` and in CI, not here.
//
// It never runs the map generators. See scripts/build-maps.js for why that would be actively bad.

import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync, existsSync, chmodSync } from "node:fs";
import { join } from "node:path";

const HOOK = `#!/bin/sh
# Managed by scripts/install-hooks.js — edit that, not this.
exec node "$(git rev-parse --show-toplevel)/scripts/hooks/pre-commit.js"
`;

let gitDir;
try {
  gitDir = execFileSync("git", ["rev-parse", "--git-dir"], { encoding: "utf8" }).trim();
} catch {
  // Not a git checkout (a tarball, a Docker build, Vercel's shallow install). Nothing to install,
  // and failing here would break `npm install` for everyone in that situation.
  console.log("install-hooks: not a git repository, skipping.");
  process.exit(0);
}

const hooksDir = join(gitDir, "hooks");
if (!existsSync(hooksDir)) mkdirSync(hooksDir, { recursive: true });

const target = join(hooksDir, "pre-commit");
writeFileSync(target, HOOK, { mode: 0o755 });
try {
  chmodSync(target, 0o755);
} catch {
  // Windows filesystems without POSIX permissions; git for Windows runs the hook regardless.
}

console.log(`install-hooks: wrote ${target}`);
