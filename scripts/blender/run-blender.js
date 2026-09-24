// Runs a Blender job headless: `npm run assets:blender -- <job>`.
//
// Blender is a build-time art tool here, never a runtime or CI dependency (decision log 0152). A
// job is a Python script under scripts/blender/jobs/ that models objects procedurally and renders
// them; its raw renders and a .blend the owner can open land in reports/blender/<job>/, which is
// gitignored. What gets committed is the pixelized commission strip that
// scripts/assets/pixelize-renders.js makes from those renders — the same place a PixelLab
// commission goes — so nothing downstream of that strip ever needs Blender installed.
//
// Usage:
//   npm run assets:blender -- campus-archive            render, then pixelize
//   npm run assets:blender -- campus-archive --render   render only
//
// Blender is found at BLENDER_PATH, else the newest install under Program Files.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "../..");
const FOUNDATION_DIR = "C:\\Program Files\\Blender Foundation";

function findBlender() {
  if (process.env.BLENDER_PATH) {
    if (existsSync(process.env.BLENDER_PATH)) return process.env.BLENDER_PATH;
    throw new Error(`BLENDER_PATH is set but nothing is there: ${process.env.BLENDER_PATH}`);
  }
  if (existsSync(FOUNDATION_DIR)) {
    // "Blender 5.2", "Blender 4.5" … newest first, compared as versions rather than as strings.
    const installs = readdirSync(FOUNDATION_DIR)
      .map((name) => ({ name, version: (name.match(/(\d+)\.(\d+)/) || []).slice(1).map(Number) }))
      .filter((entry) => entry.version.length === 2)
      .sort((a, b) => b.version[0] - a.version[0] || b.version[1] - a.version[1]);
    for (const install of installs) {
      const exe = path.join(FOUNDATION_DIR, install.name, "blender.exe");
      if (existsSync(exe)) return exe;
    }
  }
  throw new Error(
    "Blender not found. Install it under C:\\Program Files\\Blender Foundation\\, or set " +
      "BLENDER_PATH to blender.exe."
  );
}

const [job, ...flags] = process.argv.slice(2);
if (!job) {
  const jobs = readdirSync(path.join(SCRIPT_DIR, "jobs")).filter((f) => f.endsWith(".py"));
  console.error(`usage: npm run assets:blender -- <job> [--render]\njobs: ${jobs.join(", ")}`);
  process.exit(1);
}

const jobScript = path.join(SCRIPT_DIR, "jobs", `${job}.py`);
if (!existsSync(jobScript)) {
  console.error(`No job at ${path.relative(REPO_ROOT, jobScript)}`);
  process.exit(1);
}

const outDir = path.join(REPO_ROOT, "reports", "blender", job);
mkdirSync(outDir, { recursive: true });

const blender = findBlender();
console.log(
  `blender: ${blender}\njob:     ${path.relative(REPO_ROOT, jobScript)}\nout:     ${path.relative(REPO_ROOT, outDir)}`
);

// --factory-startup: the owner's own preferences (theme, add-ons, default engine) must not be
// able to change what a job renders.
const result = spawnSync(
  blender,
  [
    "--background",
    "--factory-startup",
    "--python-exit-code",
    "1",
    "--python",
    jobScript,
    "--",
    outDir,
  ],
  { stdio: "inherit" }
);
if (result.error) throw result.error;
if (result.status !== 0) {
  console.error(`Blender exited with ${result.status}`);
  process.exit(result.status || 1);
}

if (!flags.includes("--render")) {
  const pixelize = spawnSync(
    process.execPath,
    [path.join(REPO_ROOT, "scripts", "assets", "pixelize-renders.js"), job],
    { stdio: "inherit" }
  );
  process.exit(pixelize.status ?? 1);
}
