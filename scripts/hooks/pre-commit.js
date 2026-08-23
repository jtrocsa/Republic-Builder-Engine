// The pre-commit hook body. Installed by scripts/install-hooks.js; not invoked directly.
//
// Formats and lints staged files only, then re-stages whatever Prettier rewrote. Deliberately does
// NOT run tests, validate:content, cspell or the map generators — a hook slow enough to be annoying
// is a hook people bypass, and those checks have `npm run check` and CI. See the header of
// scripts/install-hooks.js for the reasoning.
//
// Bypass with `git commit --no-verify` when you genuinely need to (a WIP commit on a branch). If you
// find yourself doing that routinely, the hook is too slow and should lose a step, not be ignored.

import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const run = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", stdio: "pipe" });

// ACMR: added, copied, modified, renamed. Excludes deletions, which have nothing to format.
let staged;
try {
  staged = run("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"])
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);
} catch (error) {
  console.error("pre-commit: could not list staged files.\n", error.message);
  process.exit(1);
}

const PRETTIER_EXT = /\.(js|jsx|mjs|cjs|json|css|md|html|yml|yaml)$/;
const ESLINT_EXT = /\.(js|jsx|mjs|cjs)$/;

const toFormat = staged.filter((f) => PRETTIER_EXT.test(f));
const toLint = staged.filter((f) => ESLINT_EXT.test(f));

if (toFormat.length === 0 && toLint.length === 0) process.exit(0);

// Resolve the real JS entry points and run them with node. Spawning `npx`/`npx.cmd` fails with
// EINVAL on Windows under execFileSync, and going through a shell would mean quoting every path.
const bin = (pkg, rel) =>
  join(dirname(fileURLToPath(import.meta.resolve(pkg + "/package.json"))), rel);
const PRETTIER = bin("prettier", "bin/prettier.cjs");
const ESLINT = bin("eslint", "bin/eslint.js");

if (toFormat.length > 0) {
  try {
    // --ignore-unknown so a staged .png or .tmj passed through here is skipped, not an error.
    run(process.execPath, [PRETTIER, "--write", "--ignore-unknown", ...toFormat]);
    // Re-stage: Prettier edited the working tree, and without this the commit records the
    // unformatted version and the next `format:check` fails on already-committed code.
    run("git", ["add", "--", ...toFormat]);
  } catch (error) {
    console.error("pre-commit: prettier failed.\n", error.stdout || error.message);
    process.exit(1);
  }
}

if (toLint.length > 0) {
  try {
    run(process.execPath, [ESLINT, "--no-warn-ignored", ...toLint]);
  } catch (error) {
    console.error("\npre-commit: eslint found problems in staged files.\n");
    console.error(error.stdout || error.message);
    console.error("Fix them, or commit with --no-verify if this is a deliberate WIP commit.\n");
    process.exit(1);
  }
}

process.exit(0);
