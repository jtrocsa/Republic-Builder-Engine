// Build a self-contained copy of index.html for publishing as a Claude Artifact.
//
// Artifacts run under a strict CSP that blocks every external request, so the
// published page must carry its art inline. This reads index.html, swaps each
// `./art/<file>` reference for a base64 data: URI, and writes one standalone HTML.
//
// Usage:
//   node inline.mjs                       -> writes ./location-transitions.artifact.html
//   node inline.mjs /tmp/out.html         -> writes to the given path
//
// The output is generated, not source — don't commit it. Edit index.html + art/ instead.

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcPath = join(here, "index.html");
const outPath = process.argv[2] || join(here, "location-transitions.artifact.html");

const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

let html = await readFile(srcPath, "utf8");

// every distinct ./art/<file> the page references (works for any map added later)
const files = [...new Set([...html.matchAll(/\.\/art\/([\w.-]+\.(?:jpe?g|png|webp))/gi)].map((m) => m[1]))];
if (files.length === 0) {
  console.error("No ./art/ references found in index.html — nothing to inline.");
  process.exit(1);
}

for (const file of files) {
  const ext = file.slice(file.lastIndexOf(".") + 1).toLowerCase();
  const bytes = await readFile(join(here, "art", file));
  const uri = `data:${MIME[ext]};base64,${bytes.toString("base64")}`;
  html = html.split(`./art/${file}`).join(uri);
}

await writeFile(outPath, html);
console.log(`Inlined ${files.length} image(s) [${files.join(", ")}] -> ${outPath}`);
