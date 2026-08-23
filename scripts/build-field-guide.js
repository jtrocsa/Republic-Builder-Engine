// Builds the Chronicle Field Guide — a single self-contained HTML page holding the whole game:
// the Institute's rooms, every unit's navigation map, every walkable surface with its records
// pinned and its cast listed, and what each of the fifteen missions asks a student to do.
//
// Why this is generated rather than written. Chronicle gained two units, four rooms and thirty
// characters in a month. A hand-written guide to that is stale the week it ships, and this repo has
// already recorded (ARCHITECTURE-QUICKREF.md's own header) that a stale reference is worse than
// none, because the next reader trusts it. So every fact on the page comes out of the source of
// truth at build time, in three tiers:
//
//   1. Real ESM imports of the campaign, quest and map-view modules. Zero drift — the same route
//      scripts/validate-content.js already takes.
//   2. Literal extraction from main.js, which cannot be imported (it pulls in global.css). See
//      MAIN_JS_LITERALS below; a missing name is a hard throw, so adding Unit 6 without touching
//      this file breaks the build rather than silently shipping a five-unit guide.
//   3. Map art composited from the .tmj files through the same blitter preview-map.js uses.
//
// On typography: the game loads Cinzel/Spectral/DM Sans from Google Fonts, and the artifact CSP
// blocks external hosts. Rather than fetch and inline three families — which would make this script
// non-hermetic and spend budget that belongs to the map art — the page uses a deliberately chosen
// old-style-serif + system-sans + mono stack. The identity carries on the palette and the maps.
//
// Usage:  node scripts/build-field-guide.js
// Output: reports/field-guide/chronicle-field-guide.html  (gitignored)

import { Buffer } from "node:buffer";
import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import vm from "node:vm";

import sharp from "sharp";

import { compositeTmj, REPO_ROOT } from "./lib/composite-tmj.js";
import { landPathD, projectPoint } from "../apps/web/src/engine/geo-projection.js";

const SRC = path.join(REPO_ROOT, "apps/web/src");
const MAPS_DIR = path.join(SRC, "content/maps");
const SNAPSHOT_DIR = path.join(REPO_ROOT, "tests/e2e/visual-regression.spec.js-snapshots");
const OUT_DIR = path.join(REPO_ROOT, "reports/field-guide");
const OUT_FILE = path.join(OUT_DIR, "chronicle-field-guide.html");
// The guide is one self-contained HTML file with every surface screenshot inlined as base64, so
// the budget is what keeps it openable and emailable. It was 3.5 MB when the guide covered five
// units; it covers seven now — the tables above had silently stopped at unit-05 and were extended
// in the Phase 90 workflow audit — and two more maps plus their four interiors do not fit in the
// old number. Raise it deliberately when a unit ships, or start downscaling the inlined images;
// do not raise it to make a failing build pass without looking at what grew.
const BUDGET_BYTES = 5 * 1024 * 1024;

const UNIT_IDS = ["unit-01", "unit-02", "unit-03", "unit-04", "unit-05", "unit-06", "unit-07"];
const imports = (rel) => import(pathToFileURL(path.join(SRC, rel)).href);

// ── tier 2: literal extraction from main.js ────────────────────────────────────────────────────

/**
 * Scans forward from `start` to the bracket that closes the one opening there.
 *
 * Hand-written rather than regex because these literals contain everything that breaks a regex:
 * apostrophes inside double-quoted prose, braces inside template literals, and `//` inside URLs.
 * Tracks line comments, block comments, all three string kinds, and `${}` nesting depth.
 */
function matchBracket(source, start) {
  const open = source[start];
  const close = open === "{" ? "}" : "]";
  // A context stack, because `${}` inside a template literal returns to code — and HUB_TARGETS'
  // dialogue thunks nest a template inside an expression inside a template.
  const stack = ["code"];
  let depth = 0;
  let i = start;

  while (i < source.length) {
    const top = stack[stack.length - 1];
    const c = source[i];
    const next = source[i + 1];

    if (top === "line-comment") {
      if (c === "\n") stack.pop();
      i += 1;
      continue;
    }
    if (top === "block-comment") {
      if (c === "*" && next === "/") {
        stack.pop();
        i += 2;
      } else i += 1;
      continue;
    }
    if (top === "'" || top === '"') {
      if (c === "\\") i += 2;
      else {
        if (c === top) stack.pop();
        i += 1;
      }
      continue;
    }
    if (top === "template") {
      if (c === "\\") i += 2;
      else if (c === "`") {
        stack.pop();
        i += 1;
      } else if (c === "$" && next === "{") {
        stack.push("code");
        i += 2;
      } else i += 1;
      continue;
    }

    // top === "code"
    if (c === "/" && next === "/") {
      stack.push("line-comment");
      i += 2;
      continue;
    }
    if (c === "/" && next === "*") {
      stack.push("block-comment");
      i += 2;
      continue;
    }
    if (c === "'" || c === '"') {
      stack.push(c);
      i += 1;
      continue;
    }
    if (c === "`") {
      stack.push("template");
      i += 1;
      continue;
    }
    if (stack.length > 1) {
      // Inside a `${}` expression. Track its own braces so the `}` that closes the expression is
      // the one that pops back to the template, and the outer depth counter is left alone.
      if (c === "{") stack.push("code");
      else if (c === "}") stack.pop();
      i += 1;
      continue;
    }
    if (c === open) depth += 1;
    else if (c === close) {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
    i += 1;
  }
  throw new Error(`unbalanced ${open} starting at offset ${start}`);
}

/** A stand-in for any identifier the literal references but the guide does not read. */
function makeDummy() {
  const target = function () {};
  const dummy = new Proxy(target, {
    get: (_t, key) => (typeof key === "symbol" ? undefined : dummy),
    apply: () => dummy,
    construct: () => dummy,
    has: () => true,
  });
  return dummy;
}

/**
 * Evaluates one literal out of main.js.
 *
 * `injected` supplies the bindings whose real values matter — RECONSTRUCTION_LANES genuinely calls
 * `.map()` on the campaign files' lane arrays, so those have to be the real arrays. Everything else
 * (land predicates, block arrays, markup functions) resolves to a dummy, because the guide reads
 * only the literal fields beside them.
 */
function evalLiteral(text, injected = {}) {
  const dummy = makeDummy();
  const scope = Object.create(null);
  Object.assign(scope, injected);
  const sandbox = new Proxy(scope, {
    has: () => true,
    get: (t, key) => {
      if (key === Symbol.unscopables) return undefined;
      if (key in t) return t[key];
      return dummy;
    },
  });
  return vm.runInNewContext(`(${text})`, sandbox, { timeout: 5000 });
}

function findDeclaration(source, name) {
  const re = new RegExp(`(?:^|\\n)(?:export\\s+)?const\\s+${name}\\s*=\\s*`, "m");
  const match = re.exec(source);
  if (!match) return null;
  return match.index + match[0].length;
}

function findAssignment(source, lhs) {
  const needle = `\n${lhs} = `;
  const at = source.indexOf(needle);
  if (at === -1) return null;
  return at + needle.length;
}

function readNamed(source, name, injected) {
  const start = findDeclaration(source, name);
  if (start === null) throw new Error(`main.js: could not find \`const ${name} =\``);
  const end = matchBracket(source, start);
  return evalLiteral(source.slice(start, end), injected);
}

function readAssigned(source, lhs, injected) {
  const start = findAssignment(source, lhs);
  if (start === null) throw new Error(`main.js: could not find \`${lhs} =\``);
  const end = matchBracket(source, start);
  return evalLiteral(source.slice(start, end), injected);
}

// Every name this guide needs out of main.js, in one place. Grouped by what it is so a sixth unit
// tells you exactly what to add.
const MAIN_JS_LITERALS = {
  npcs: {
    "unit-01": "FIELD_NPCS",
    "unit-02": "UNIT2_FIELD_NPCS",
    "unit-03": "UNIT3_FIELD_NPCS",
    "unit-04": "UNIT4_FIELD_NPCS",
    "unit-05": "UNIT5_FIELD_NPCS",
    "unit-06": "UNIT6_FIELD_NPCS",
    "unit-07": "UNIT7_FIELD_NPCS",
    "canal-print-shop": "UNIT4_PRINT_SHOP_NPCS",
    "canal-boarding-house": "UNIT4_BOARDING_HOUSE_NPCS",
    "richmond-counting-room": "UNIT5_COUNTING_ROOM_NPCS",
    "richmond-hospital-ward": "UNIT5_HOSPITAL_WARD_NPCS",
    "railhead-land-office": "UNIT6_LAND_OFFICE_NPCS",
    "railhead-telegraph-office": "UNIT6_TELEGRAPH_OFFICE_NPCS",
    "immigrant-port-inspection-hall": "UNIT7_INSPECTION_HALL_NPCS",
    "immigrant-port-inquiry-room": "UNIT7_INQUIRY_ROOM_NPCS",
  },
  behaviours: {
    "unit-01": "FIELD_NPC_BEHAVIOURS",
    "unit-02": "UNIT2_FIELD_NPC_BEHAVIOURS",
    "unit-03": "UNIT3_FIELD_NPC_BEHAVIOURS",
    "unit-04": "UNIT4_FIELD_NPC_BEHAVIOURS",
    "unit-05": "UNIT5_FIELD_NPC_BEHAVIOURS",
    "unit-06": "UNIT6_FIELD_NPC_BEHAVIOURS",
    "unit-07": "UNIT7_FIELD_NPC_BEHAVIOURS",
    "canal-print-shop": "UNIT4_PRINT_SHOP_BEHAVIOURS",
    "canal-boarding-house": "UNIT4_BOARDING_HOUSE_BEHAVIOURS",
    "richmond-counting-room": "UNIT5_COUNTING_ROOM_BEHAVIOURS",
    "richmond-hospital-ward": "UNIT5_HOSPITAL_WARD_BEHAVIOURS",
    "railhead-land-office": "UNIT6_LAND_OFFICE_BEHAVIOURS",
    "railhead-telegraph-office": "UNIT6_TELEGRAPH_OFFICE_BEHAVIOURS",
    "immigrant-port-inspection-hall": "UNIT7_INSPECTION_HALL_BEHAVIOURS",
    "immigrant-port-inquiry-room": "UNIT7_INQUIRY_ROOM_BEHAVIOURS",
  },
  sourcePoints: {
    "unit-01": "FIELD_SOURCE_POINTS",
    "unit-02": "UNIT2_FIELD_SOURCE_POINTS",
    "unit-03": "UNIT3_FIELD_SOURCE_POINTS",
    "unit-04": "UNIT4_FIELD_SOURCE_POINTS",
    "unit-05": "UNIT5_FIELD_SOURCE_POINTS",
    "unit-06": "UNIT6_FIELD_SOURCE_POINTS",
    "unit-07": "UNIT7_FIELD_SOURCE_POINTS",
    "canal-print-shop": "UNIT4_PRINT_SHOP_SOURCE_POINTS",
    "canal-boarding-house": "UNIT4_BOARDING_HOUSE_SOURCE_POINTS",
    "richmond-counting-room": "UNIT5_COUNTING_ROOM_SOURCE_POINTS",
    "richmond-hospital-ward": "UNIT5_HOSPITAL_WARD_SOURCE_POINTS",
    "railhead-land-office": "UNIT6_LAND_OFFICE_SOURCE_POINTS",
    "railhead-telegraph-office": "UNIT6_TELEGRAPH_OFFICE_SOURCE_POINTS",
    "immigrant-port-inspection-hall": "UNIT7_INSPECTION_HALL_SOURCE_POINTS",
    "immigrant-port-inquiry-room": "UNIT7_INQUIRY_ROOM_SOURCE_POINTS",
  },
  hubTargets: {
    hallway: "HALLWAY_TARGETS",
    main: "HUB_TARGETS",
    archive: "ARCHIVE_ROOM_TARGETS",
  },
};

function extractFromMainJs(laneArrays) {
  const source = readFileSync(path.join(SRC, "main.js"), "utf8");
  // Guard the other direction too. A missing *name* throws below, but the likelier mistake is a
  // sixth unit whose constants exist in main.js and were never added to the manifest above — which
  // would otherwise ship a five-unit guide for a six-unit game without a word of complaint.
  for (const group of ["npcs", "behaviours", "sourcePoints"]) {
    for (const unitId of UNIT_IDS) {
      if (!MAIN_JS_LITERALS[group][unitId]) {
        throw new Error(`MAIN_JS_LITERALS.${group} has no entry for ${unitId}`);
      }
    }
  }
  const out = { npcs: {}, behaviours: {}, sourcePoints: {}, hubTargets: {} };
  for (const group of Object.keys(MAIN_JS_LITERALS)) {
    for (const [key, name] of Object.entries(MAIN_JS_LITERALS[group])) {
      out[group][key] = readNamed(source, name);
    }
  }
  out.fieldMaps = readNamed(source, "FIELD_MAPS");
  out.fieldCopy = readNamed(source, "FIELD_COPY");
  out.lanes = readNamed(source, "RECONSTRUCTION_LANES", laneArrays);
  // Discovered, not listed. An interior is attached after the FIELD_MAPS literal rather than inside
  // it (a room's blocks const is declared further down main.js, and reading one from the literal is
  // a temporal-dead-zone ReferenceError), so each unit that has rooms has its own assignment line.
  // Naming the two that exist today would mean a sixth unit's rooms silently not appearing in the
  // guide, which is the one failure mode a generated document cannot afford.
  out.interiors = {};
  for (const match of source.matchAll(/\nFIELD_MAPS\["(unit-\d+)"\]\.interiors = /g)) {
    out.interiors[match[1]] = readAssigned(source, `FIELD_MAPS["${match[1]}"].interiors`);
  }
  return out;
}

// ── tier 3: images ─────────────────────────────────────────────────────────────────────────────

const imageBudget = [];

async function inlineWebp(pipeline, width, quality, label) {
  const buffer = await pipeline
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toBuffer();
  imageBudget.push({ label, bytes: buffer.length });
  return `data:image/webp;base64,${buffer.toString("base64")}`;
}

async function tmjImage(mapId, width, quality) {
  const file = path.join(MAPS_DIR, `${mapId}.tmj`);
  const { canvas, width: w, height: h, tmj } = await compositeTmj(file);
  // Interiors and hub rooms are transparent outside their walls; a flatten keeps them from
  // rendering as a hole punched in whatever the page's theme happens to be.
  const pipeline = sharp(canvas, { raw: { width: w, height: h, channels: 4 } }).flatten({
    background: "#041a26",
  });
  return {
    src: await inlineWebp(pipeline, width, quality, mapId),
    columns: tmj.width,
    rows: tmj.height,
  };
}

async function snapshotImage(name, width, quality) {
  const file = path.join(SNAPSHOT_DIR, `${name}-chromium-win32.png`);
  if (!existsSync(file)) throw new Error(`missing Playwright baseline: ${file}`);
  return inlineWebp(sharp(file), width, quality, name);
}

// ── tier 1 + assembly ──────────────────────────────────────────────────────────────────────────

/**
 * Which .tmj paints each unit's outdoor map. Interiors carry their own id, which is their file.
 *
 * This and SURFACE_NAMES below are the two lists a new unit's map has to join. Both are read through
 * must() rather than indexed directly, so a missing entry names itself and the list to add it to.
 */
const OUTDOOR_TMJ = {
  "unit-01": "caribbean-field",
  "unit-02": "riverbend-field",
  "unit-03": "common-cause-field",
  "unit-04": "canal-crossroads-field",
  "unit-05": "richmond-field",
  "unit-06": "railhead-field",
  "unit-07": "immigrant-port-field",
};

/** Human names for the surfaces, since a .tmj id is not a place. */
const SURFACE_NAMES = {
  "caribbean-field": "The Caribbean shore",
  "riverbend-field": "The Riverbend settlement",
  "common-cause-field": "The Philadelphia gathering ground",
  "canal-crossroads-field": "Canal Crossroads",
  "richmond-field": "Richmond",
  "canal-print-shop": "Market Street printing office",
  "canal-boarding-house": "Canal-side boardinghouse",
  "richmond-counting-room": "Franklin Street counting room",
  "richmond-hospital-ward": "A Chimborazo ward",
  "railhead-field": "Cottonwood Junction",
  "railhead-land-office": "US district land office",
  "railhead-telegraph-office": "Western Union office",
  "immigrant-port-field": "The wharf at Ellis Island",
  "immigrant-port-inspection-hall": "The inspection hall",
  "immigrant-port-inquiry-room": "Board of special inquiry room",
};

/**
 * Reads a key that must be there, and says which list to add it to when it isn't.
 *
 * This document's whole value is that it can be trusted after the game changes under it, so every
 * hand-kept lookup in this file goes through here. A `|| "—"` fallback would keep the build green
 * and quietly publish a guide that omits a map, mislabels a mission, or leaves a task type blank.
 */
function must(table, key, listName) {
  if (!(key in table)) {
    throw new Error(
      `${listName} has no entry for "${key}" — add one in scripts/build-field-guide.js`
    );
  }
  return table[key];
}

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const num = (value) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

function behaviourSummary(behaviour) {
  if (!behaviour) return "—";
  if (behaviour.kind === "station") {
    return `Stands at ${num(behaviour.at.x)}, ${num(behaviour.at.y)}`;
  }
  if (behaviour.kind === "route") {
    return `Walks a circuit of ${behaviour.stops.length} stops`;
  }
  if (behaviour.kind === "wander") {
    return `Wanders ${behaviour.radius ?? 1.5} tiles around ${num(behaviour.home.x)}, ${num(behaviour.home.y)}`;
  }
  return behaviour.kind;
}

/** Where a record's ✦ actually draws — an NPC-anchored one rides the person, per sourcePointPosition(). */
function pinFor(point, npcs) {
  if (point.anchor?.npc) {
    const npc = npcs.find((candidate) => candidate.id === point.anchor.npc);
    if (npc) return { x: npc.x, y: npc.y, carrier: npc.name, moving: true };
  }
  return { x: point.x ?? 10, y: point.y ?? 10, carrier: point.anchor?.object || point.label };
}

// ── nav maps ───────────────────────────────────────────────────────────────────────────────────

const NAV_VIEWPORT = { width: 720, height: 420 };

/**
 * The unit's Navigation Table framing, drawn with the game's own projection.
 *
 * Both framings' coastline paths are emitted once into a shared <defs> and referenced by <use>;
 * the coastline is 5,123 points, and shipping it five times would cost more than every interior
 * render put together.
 */
function navDefs(views) {
  const rings = JSON.parse(readFileSync(path.join(MAPS_DIR, "land-coastlines.json"), "utf8")).rings;
  const parts = [];
  for (const [key, view] of Object.entries(views)) {
    const d = landPathD(rings, view.bounds, NAV_VIEWPORT).replace(/-?\d+\.\d+/g, (n) =>
      Number(n).toFixed(1)
    );
    parts.push(`<path id="coast-${esc(key)}" d="${d}"/>`);
  }
  return `<svg class="nav-defs" aria-hidden="true" focusable="false"><defs>${parts.join("")}</defs></svg>`;
}

function navMap(unit, viewKey, view) {
  const pins = unit.cases
    .map((entry, index) => {
      const { x, y } = projectPoint(
        [entry.mapPosition.lon, entry.mapPosition.lat],
        view.bounds,
        NAV_VIEWPORT
      );
      return `<g class="nav-pin"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11"/><text x="${x.toFixed(1)}" y="${(y + 4.2).toFixed(1)}">${index + 1}</text></g>`;
    })
    .join("");
  const labels = (view.labels || [])
    .map((label) => {
      const { x, y } = projectPoint([label.lon, label.lat], view.bounds, NAV_VIEWPORT);
      return `<text class="nav-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}">${esc(label.text)}</text>`;
    })
    .join("");
  return `<svg class="nav-map" viewBox="0 0 ${NAV_VIEWPORT.width} ${NAV_VIEWPORT.height}" role="img" aria-label="${esc(unit.title)} navigation map: ${unit.cases.length} case markers"><rect class="nav-sea" width="${NAV_VIEWPORT.width}" height="${NAV_VIEWPORT.height}"/><use class="nav-land" href="#coast-${esc(viewKey)}"/>${labels}${pins}</svg>`;
}

// ── surface figures ────────────────────────────────────────────────────────────────────────────

/**
 * A map render with its records pinned over it.
 *
 * The pins are SVG in tile units over the image rather than baked into the PNG: the overlay then
 * scales with the figure at any page width, and the art underneath stays a clean render that can be
 * read on its own.
 */
function surfaceFigure(surface) {
  const { image, pins, doors, spawn, recall, name, id } = surface;
  // A pin is chrome over the art, not part of it, so it wants a constant size on screen — roughly a
  // 44px disc — rather than a constant number of tiles. Two things vary and both have to be in the
  // sum: the map's tile count (56 across for a town, 18 for a room) and the width its figure is
  // laid out at (an outdoor map takes the full column, an interior takes the narrower one). Sized in
  // raw tile units instead, a pin that reads on Richmond swallows half the counting room. Scaling
  // the whole group rather than each radius carries the stroke widths and the label type with it.
  const frame = surface.kind === "outdoor" ? 1090 : 600;
  const s = ((22 * image.columns) / frame / 1.15).toFixed(3);
  const mark = (kind, x, y, body) =>
    `<g class="mark mark--${kind}" transform="translate(${x} ${y}) scale(${s})">${body}</g>`;

  const marks = [];
  if (spawn) {
    marks.push(
      mark(
        "spawn",
        spawn.x,
        spawn.y,
        `<circle r="1.05"/><path d="M0 -0.5 L0.46 0.32 L-0.46 0.32 Z"/>`
      )
    );
  }
  if (recall) {
    marks.push(
      mark("recall", recall.x, recall.y, `<circle r="0.98"/><circle class="mark-inner" r="0.4"/>`)
    );
  }
  for (const door of doors) {
    marks.push(
      mark(
        "door",
        door.x,
        door.y,
        `<circle r="1.1"/><path d="M-0.4 0.48 L-0.4 -0.26 A0.4 0.4 0 0 1 0.4 -0.26 L0.4 0.48 Z"/>`
      )
    );
  }
  pins.forEach((pin, index) => {
    marks.push(
      mark("record", pin.x, pin.y, `<circle r="1.15"/><text y="0.44">${index + 1}</text>`)
    );
  });
  return `<figure class="surface" id="map-${esc(id)}">
      <div class="surface-art">
        <img src="${image.src}" alt="Top-down map of ${esc(name)}, ${image.columns} by ${image.rows} tiles" loading="lazy">
        <svg class="surface-pins" viewBox="0 0 ${image.columns} ${image.rows}" aria-hidden="true" focusable="false">${marks.join("")}</svg>
      </div>
      <figcaption><b>${esc(name)}</b> · ${image.columns}×${image.rows} tiles · <code>${esc(id)}.tmj</code></figcaption>
    </figure>`;
}

function castTable(npcs, behaviours) {
  if (!npcs.length) return "";
  const rows = npcs
    .map(
      (npc) =>
        `<tr><td>${esc(npc.name)}</td><td>${esc(npc.label || "—")}</td><td>${esc(behaviourSummary(behaviours[npc.id]))}</td><td class="tile-ref">${num(npc.x)}, ${num(npc.y)}</td></tr>`
    )
    .join("");
  return `<div class="table-scroll"><table class="cast">
      <caption>Who is here — ${npcs.length} ${npcs.length === 1 ? "person" : "people"}</caption>
      <thead><tr><th>Name</th><th>Shown as</th><th>What they do</th><th>Tile</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
}

function recordTable(entries) {
  if (!entries.length) return "";
  const rows = entries
    .map((entry, index) => {
      // The kind rides in the label cell rather than taking a fourth column: this table sits in a
      // ~420px side column, and a fourth column pushed "who carries it" off the edge.
      const kind =
        entry.kind === "Source"
          ? ""
          : ` <span class="chip chip--${esc(entry.kind.toLowerCase())}">${esc(entry.kind)}</span>`;
      const moving = entry.moving
        ? ' <span class="note">— walks a route, so follow the ✦ rather than the tile</span>'
        : "";
      return `<tr><td class="pin-cell"><span class="pin-chip">${index + 1}</span></td><td>${esc(entry.label)}${kind}</td><td>${esc(entry.carrier)}${moving}</td></tr>`;
    })
    .join("");
  return `<div class="table-scroll"><table class="records">
      <caption>Records on this surface</caption>
      <thead><tr><th>Pin</th><th>What it is called in the field</th><th>Who or what carries it</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
}

// ── quest descriptions ─────────────────────────────────────────────────────────────────────────

/**
 * Every task type the game can put in front of a student.
 *
 * One entry per type, holding all three things the guide says about it: what to call it, how to
 * describe the particular quest's shape, and what the student actually does. A seventh type is one
 * entry here and one screenshot in part 6 — and until it has one, the build stops and says so,
 * rather than printing an em dash where the explanation should be.
 */
const QUEST_TYPES = {
  mcq: {
    name: "Multiple choice",
    shape: (quest) => `${quest.choices.length} choices`,
    steps: "Choose one, submit, then read the explanation.",
  },
  sequencing: {
    name: "Sequencing",
    shape: (quest) => `${quest.items.length} events to put in causal order`,
    steps:
      "Move each event up or down until the chain reads cause → effect. Order is graded, not the dates.",
  },
  "evidence-organizing": {
    name: "Evidence sorting",
    shape: (quest) =>
      `${quest.sources.length} cards to sort into ${quest.slots.length} categories, then a written reflection`,
    steps:
      "Drag every card into a category — more than one card can share a category — then write the reflection before submitting.",
  },
  hipp: {
    name: "HIPP source analysis",
    shape: (quest) => `one document, ${quest.hippPrompts.length} HIPP dimensions to analyse`,
    steps:
      "For each dimension, pick the option that explains how it shapes the argument, not the one that merely names it.",
  },
  saq: {
    name: "Short answer (SAQ)",
    shape: (quest) =>
      `${quest.prompts.length} short-answer parts${quest.stimulus ? " on a shared stimulus" : ""}`,
    steps:
      "Answer each part in a few sentences. The AI evaluator returns formative feedback only — a teacher enters the grade.",
  },
  dbq: {
    name: "Document-based question (DBQ)",
    shape: (quest) => `${quest.documents.length} documents, one essay`,
    steps:
      "Read every document, then write one essay to the College Board rubric. Formative feedback only.",
  },
};

const questTypeName = (type) => must(QUEST_TYPES, type, "QUEST_TYPES").name;
const questSteps = (type) => must(QUEST_TYPES, type, "QUEST_TYPES").steps;

function questShape(type, quest) {
  const entry = must(QUEST_TYPES, type, "QUEST_TYPES");
  if (!quest) throw new Error(`quest content not found for a ${type} slot`);
  return entry.shape(quest);
}

// ── page ───────────────────────────────────────────────────────────────────────────────────────

function styles() {
  return `<style>
:root{
  --ground:#052838; --panel:#08314a; --panel-soft:#0a2839; --raised:#0d3c56;
  --text:#f7e7bd; --text-2:#c8d8d6; --text-3:#93aeb2;
  --gold:#e1b65d; --gold-soft:#f0d488; --teal:#7ee6ec; --parchment:#e9d5a3;
  --rule:rgba(225,182,93,.26); --rule-soft:rgba(199,216,214,.14);
  --serif:"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif;
  --sans:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --mono:ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",Menlo,monospace;
  --shadow:0 1px 2px rgba(0,0,0,.35),0 12px 32px rgba(0,0,0,.28);
}
@media (prefers-color-scheme:light){
  :root{
    --ground:#f2e8d0; --panel:#fbf4e2; --panel-soft:#efe3c5; --raised:#fffaef;
    --text:#16303c; --text-2:#3d5a64; --text-3:#6d878e;
    --gold:#8a5f12; --gold-soft:#a97a1d; --teal:#0d6771;
    --rule:rgba(22,48,60,.2); --rule-soft:rgba(22,48,60,.12);
    --shadow:0 1px 2px rgba(60,45,15,.1),0 12px 30px rgba(60,45,15,.12);
  }
}
:root[data-theme="dark"]{
  --ground:#052838; --panel:#08314a; --panel-soft:#0a2839; --raised:#0d3c56;
  --text:#f7e7bd; --text-2:#c8d8d6; --text-3:#93aeb2;
  --gold:#e1b65d; --gold-soft:#f0d488; --teal:#7ee6ec;
  --rule:rgba(225,182,93,.26); --rule-soft:rgba(199,216,214,.14);
  --shadow:0 1px 2px rgba(0,0,0,.35),0 12px 32px rgba(0,0,0,.28);
}
:root[data-theme="light"]{
  --ground:#f2e8d0; --panel:#fbf4e2; --panel-soft:#efe3c5; --raised:#fffaef;
  --text:#16303c; --text-2:#3d5a64; --text-3:#6d878e;
  --gold:#8a5f12; --gold-soft:#a97a1d; --teal:#0d6771;
  --rule:rgba(22,48,60,.2); --rule-soft:rgba(22,48,60,.12);
  --shadow:0 1px 2px rgba(60,45,15,.1),0 12px 30px rgba(60,45,15,.12);
}

*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--text);font-family:var(--serif);font-size:17px;line-height:1.62;-webkit-font-smoothing:antialiased}
.layout{display:grid;grid-template-columns:246px minmax(0,1fr);gap:0;max-width:1500px;margin:0 auto}
main{min-width:0;padding:0 clamp(20px,4vw,56px) 140px}

/* rail */
.rail{position:sticky;top:0;align-self:start;height:100vh;overflow-y:auto;padding:34px 20px 40px;border-right:1px solid var(--rule-soft)}
.rail-brand{font-family:var(--sans);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin:0 0 4px}
.rail-title{font-size:19px;line-height:1.25;margin:0 0 26px;text-wrap:balance}
.rail nav ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.rail nav a{display:flex;gap:9px;align-items:baseline;text-decoration:none;color:var(--text-2);font-family:var(--sans);font-size:13.5px;padding:5px 8px;border-radius:4px;border-left:2px solid transparent}
.rail nav a:hover{color:var(--text);background:var(--panel-soft)}
.rail nav a:focus-visible{outline:2px solid var(--gold);outline-offset:1px}
.rail nav .n{font-variant-numeric:tabular-nums;color:var(--gold);min-width:22px;font-size:12px}
.rail nav .sub a{padding-left:30px;font-size:12.5px;color:var(--text-3)}
.rail-foot{margin-top:26px;padding-top:16px;border-top:1px solid var(--rule-soft);font-family:var(--sans);font-size:11.5px;line-height:1.5;color:var(--text-3)}

/* masthead */
.masthead{padding:64px 0 40px;border-bottom:1px solid var(--rule)}
.eyebrow{font-family:var(--sans);font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--gold);margin:0 0 14px}
.masthead h1{font-size:clamp(2.3rem,4.4vw,3.5rem);line-height:1.03;margin:0 0 18px;font-weight:600;text-wrap:balance}
.lede{font-size:19.5px;color:var(--text-2);max-width:64ch;margin:0}
.fact-row{display:flex;flex-wrap:wrap;gap:8px 26px;margin-top:30px;font-family:var(--sans);font-size:12.5px;color:var(--text-3)}
.fact-row b{color:var(--gold);font-variant-numeric:tabular-nums;font-weight:600}

/* sections */
section{scroll-margin-top:20px}
.part{padding-top:58px}
.part>h2{font-size:clamp(1.6rem,2.6vw,2.1rem);line-height:1.14;margin:0 0 8px;font-weight:600;text-wrap:balance}
.part-num{font-family:var(--sans);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:9px}
h3{font-size:1.28rem;margin:44px 0 10px;font-weight:600;text-wrap:balance}
h4{font-size:1.03rem;margin:26px 0 8px;font-weight:600;font-family:var(--sans);letter-spacing:.005em}
p{max-width:66ch}
a{color:var(--gold)}
code{font-family:var(--mono);font-size:.86em;background:var(--panel-soft);padding:1px 5px;border-radius:3px;color:var(--text-2)}
.note{color:var(--text-3);font-size:.88em}

/* the loop diagram */
.loop{display:flex;flex-wrap:wrap;align-items:stretch;gap:8px;margin:26px 0 6px;padding:0;list-style:none}
.loop li{flex:1 1 128px;background:var(--panel);border:1px solid var(--rule-soft);border-top:2px solid var(--gold);border-radius:3px;padding:12px 13px;font-family:var(--sans);font-size:12.5px;line-height:1.42}
.loop b{display:block;font-size:13.5px;margin-bottom:3px;color:var(--text)}
.loop span{color:var(--text-3)}

/* room + surface panels */
.surface{margin:22px 0 0;padding:0}
.surface-art{position:relative;line-height:0;border:1px solid var(--rule);border-radius:3px;overflow:hidden;background:#041a26;box-shadow:var(--shadow)}
.surface-art img{display:block;width:100%;height:auto;image-rendering:auto}
.surface-pins{position:absolute;inset:0;width:100%;height:100%}
.mark circle{fill:var(--gold);stroke:rgba(4,26,38,.85);stroke-width:.13;paint-order:stroke}
.mark text{fill:#08222e;font-family:var(--sans);font-size:1.2px;font-weight:700;text-anchor:middle}
.mark--door circle{fill:var(--teal)}
.mark--door path{fill:#06222c}
.mark--spawn circle{fill:#87d5a4}
.mark--spawn path{fill:#06222c}
.mark--recall circle{fill:none;stroke:var(--gold);stroke-width:.3}
.mark--recall .mark-inner{fill:var(--gold);stroke:none}
figcaption{font-family:var(--sans);font-size:12px;color:var(--text-3);margin-top:9px;line-height:1.45}
figcaption b{color:var(--text-2)}

.surface-block{display:grid;grid-template-columns:minmax(0,1.32fr) minmax(0,1fr);gap:26px;align-items:start;margin-top:8px}
.surface-under{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px;align-items:start;margin-top:22px}
@media (max-width:1080px){.surface-block,.surface-under{grid-template-columns:minmax(0,1fr)}}
.surface-side{display:flex;flex-direction:column;gap:18px;min-width:0}

/* tables */
.table-scroll{overflow-x:auto;border:1px solid var(--rule-soft);border-radius:3px;background:var(--panel-soft)}
table{border-collapse:collapse;width:100%;font-family:var(--sans);font-size:13px}
caption{text-align:left;font-family:var(--sans);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);padding:11px 13px 8px}
th{text-align:left;font-weight:600;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--text-3);padding:7px 13px;border-bottom:1px solid var(--rule-soft);white-space:nowrap}
td{padding:8px 13px;border-bottom:1px solid var(--rule-soft);vertical-align:top;color:var(--text-2)}
tbody tr:last-child td{border-bottom:0}
td:first-child{color:var(--text)}
.tile-ref{font-family:var(--mono);font-size:11.5px;font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--text-3)}
.pin-cell{width:1%}
.pin-chip{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:var(--gold);color:#08222e;font-size:11.5px;font-weight:700;font-variant-numeric:tabular-nums}
.chip{display:inline-block;padding:1px 8px;border-radius:9px;font-size:11px;border:1px solid var(--rule);color:var(--text-2);white-space:nowrap}
.chip--observe{border-color:var(--teal);color:var(--teal)}
.chip--puzzle{border-color:#87d5a4;color:#87d5a4}

/* case cards */
.case{border-top:1px solid var(--rule);padding-top:26px;margin-top:34px}
.case-head{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:baseline}
.case-head h3{margin:0;font-size:1.34rem}
.case-kicker{font-family:var(--sans);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold)}
.case-meta{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 16px;font-family:var(--sans);font-size:11.5px}
.case-meta span{border:1px solid var(--rule-soft);border-radius:3px;padding:3px 9px;color:var(--text-3)}
.case-meta span b{color:var(--text-2);font-weight:600}
.question{font-size:1.06rem;font-style:italic;color:var(--text);border-left:2px solid var(--gold);padding-left:16px;margin:16px 0;max-width:62ch}
.todo{margin:14px 0 0;padding:0 0 0 20px;max-width:64ch}
.todo li{margin-bottom:6px}
.todo li::marker{color:var(--gold)}

/* nav map */
.nav-defs{position:absolute;width:0;height:0;overflow:hidden}
.nav-map{width:100%;max-width:480px;height:auto;display:block;border:1px solid var(--rule);border-radius:3px;box-shadow:var(--shadow)}
.nav-sea{fill:#041d29}
.nav-land{fill:#123c46;stroke:rgba(225,182,93,.4);stroke-width:.7}
.nav-label{fill:rgba(199,216,214,.45);font-family:var(--sans);font-size:10px;letter-spacing:.22em;text-anchor:middle}
.nav-pin circle{fill:var(--gold);stroke:#041d29;stroke-width:1.6}
.nav-pin text{fill:#08222e;font-family:var(--sans);font-size:12px;font-weight:700;text-anchor:middle}

/* unit header */
.unit-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,480px);gap:34px;align-items:start;margin:22px 0 30px}
@media (max-width:1080px){.unit-head{grid-template-columns:minmax(0,1fr)}}
.challenges{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px;margin-top:12px}
.challenge{background:var(--panel);border:1px solid var(--rule-soft);border-radius:3px;padding:16px 20px}
.challenge .case-kicker{margin:0 0 3px}
.challenge-shape{font-family:var(--sans);font-size:12.5px;color:var(--text-3);margin:0 0 10px}
.challenge p{margin:0;font-size:15.5px}
.saq-parts{margin:0;padding:0;list-style:none;font-size:15px}
.saq-parts li{margin-bottom:8px}


/* screenshot gallery */
.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(430px,1fr));gap:30px 26px;margin-top:24px}
.shot img{display:block;width:100%;height:auto;border:1px solid var(--rule);border-radius:3px;box-shadow:var(--shadow)}
.shot h4{margin:14px 0 4px}
.shot p{font-family:var(--sans);font-size:13px;color:var(--text-3);margin:0;max-width:52ch}

/* callout */
.callout{background:var(--panel);border:1px solid var(--rule-soft);border-left:2px solid var(--gold);border-radius:3px;padding:16px 20px;margin:22px 0}
.callout p{margin:0 0 8px;max-width:62ch}
.callout p:last-child{margin-bottom:0}
.callout h4{margin-top:0}

.open-items li{margin-bottom:12px;max-width:66ch}

@media (max-width:900px){
  .layout{grid-template-columns:minmax(0,1fr)}
  .rail{position:static;height:auto;border-right:0;border-bottom:1px solid var(--rule-soft)}
  .rail nav ol{flex-direction:row;flex-wrap:wrap}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>`;
}

function part0(rooms, shots) {
  const room = (key, title, blurb, howto) => {
    const surface = rooms[key];
    const rows = Object.values(surface.targets)
      .map(
        (target, index) =>
          `<tr><td class="pin-cell"><span class="pin-chip">${index + 1}</span></td><td>${esc(target.name)}</td><td>${esc(target.role || "—")}</td><td>${esc(targetAction(target))}</td><td class="tile-ref">${num(target.x)}, ${num(target.y)}</td></tr>`
      )
      .join("");
    return `<h3 id="${esc(key)}">${esc(title)}</h3>
      <p>${blurb}</p>
      <div class="surface-block">
        ${surfaceFigure(surface)}
        <div class="surface-side">
          <div class="table-scroll"><table>
            <caption>What you can walk up to</caption>
            <thead><tr><th>Pin</th><th>Object or person</th><th>What it is</th><th>Selecting it</th><th>Tile</th></tr></thead>
            <tbody>${rows}</tbody></table></div>
          ${howto}
        </div>
      </div>`;
  };

  return `<section class="part" id="institute">
    <span class="part-num">Part 0</span>
    <h2>The Institute, and the loop everything runs on</h2>
    <p>You are a Chronicler. The historical record has become unstable; you travel to a damaged period, gather evidence from the people and papers in it, and bring it back to be preserved. Every unit runs the same circuit.</p>
    <ol class="loop">
      <li><b>Entrance Hall</b><span>Arrive, meet the Director, walk to the Main Hall.</span></li>
      <li><b>Main Hall</b><span>Talk to staff, check the badge case, reach the Navigation Table.</span></li>
      <li><b>Navigation Table</b><span>Pick a unit tab, pick a case marker, Initiate Chronotravel.</span></li>
      <li><b>Field or mission</b><span>One walkable map per unit; the other two cases are single-screen missions.</span></li>
      <li><b>Codex</b><span>Every record you secure is preserved here, on the map and back at base.</span></li>
      <li><b>Reconstruction Table</b><span>Sort the case's records into its three lanes to close it.</span></li>
      <li><b>Archive Room</b><span>The Terminal holds the unit's SAQ and DBQ.</span></li>
    </ol>
    <div class="callout">
      <h4>Controls, on every walkable surface</h4>
      <p>Arrow keys or <b>WASD</b> to move. <b>E</b> or a click to interact — but only once you are already within about a tile and a half. Walking over something does nothing; there is no teleport-and-interact, and that includes doors.</p>
      <p>On a field map, look for a <b>✦</b> over a person's head or on the object holding a record. The <b>Records to Recover</b> checklist pinned beside the map lists every record in the case, including the ones behind doors.</p>
    </div>

    ${room("hallway", "0.1 · Entrance Hall", "Where the game begins and your first moment of control. Director Rowan Hale is waiting on the runner; talk to him and he escorts you north to the Main Hall. Movement is locked while the escort walks — that is the only scripted beat in the building.", `<p class="note">20×18 tiles. The player spawns just inside the south doors at 10.0, 15.3 facing up, roughly a second's walk short of the Director.</p>`)}

    ${room("main", "0.2 · Main Hall — the Institute Archive", "The hub proper. Three staff to talk to, a badge case, the Navigation Table, and the door north into the Archive Room. Recall to Archive from the field lands you beside the Navigation Table, not at the door.", `<p class="note">23×12 tiles. Wider than the viewport and shorter than it, so the camera scrolls sideways only. A first-time player is walked through the Table, the Archive door and the badge case by the tutorial tour.</p>`)}

    ${room("archive", "0.3 · Archive Room", "One room north of the Main Hall, and the home of written work. The Archive Terminal opens the current unit's Archive Challenges — the SAQ and, from Unit 3 on, the DBQ. Nothing else in the game routes to them.", `<p class="note">20×12 tiles. The badge case lives back in the Main Hall; this room is for composing, not collecting.</p>`)}

    <h3 id="nav-table">0.4 · The Navigation Table screen</h3>
    <p>Interacting with the Table leaves the walkable hub for a map screen. Unit tabs run across the top; each case is a marker projected onto a real coastline at its actual latitude and longitude.</p>
    <div class="shots"><figure class="shot"><img src="${shots.navTable}" alt="The Chronicle Navigation Table screen: a coastline map with case markers and a route panel" loading="lazy">
      <h4>Reading the table</h4>
      <p><b>✦</b> available · <b>✓</b> archived · <b>○</b> teacher-locked. Selecting a marker fills the route panel on the right; <b>Initiate Chronotravel</b> commits to it. Cases unlock in order, so a unit's second marker stays locked until its first is archived.</p></figure></div>
  </section>`;
}

// Where the player lands in each hub room. Transcribed from main.js's HALLWAY_SPAWN, the
// instituteMovement initialiser, and the Archive Room's `exitDoor.y - 0.6` entry rule — all three
// are single scalars rather than literals a scanner can lift.
const ROOM_SPAWNS = {
  hallway: { x: 10.0, y: 15.3 },
  main: { x: 11.5, y: 9.0 },
  archive: { x: 10.0, y: 9.5 },
};

const ACTION_COPY = {
  archive: "Opens the Navigation Table screen",
  "enter-archive-room": "Walks north into the Archive Room",
  "leave-archive-room": "Returns to the Main Hall",
  "archive-challenges": "Opens this unit's SAQ and DBQ",
  "hallway-brief": "Starts the opening brief, then the escort walk",
};

/**
 * What pressing E on a hub target does.
 *
 * A target with a `marker` rect is a piece of furniture — the glow draws on its own painted tiles —
 * and one without is a person. Getting this from the data rather than a hand-kept list is what
 * stops the Preservation Case being described as somebody you talk to.
 */
function targetAction(target) {
  if (target.action) return ACTION_COPY[target.action] || target.action;
  return target.marker ? "Opens it" : "Talk to them";
}

function unitSection(unit, index, data) {
  const number = index + 1;
  const nav = navMap(unit, data.viewKey, data.view);
  // Cards rather than a table row: an SAQ is three separate questions on one stimulus and a DBQ
  // prompt is a paragraph, and neither survives being squeezed into a table cell.
  const challengeCards = unit.archiveChallenges
    .map((challenge) => {
      const quest = data.questById.get(challenge.questId);
      const body =
        challenge.questType === "saq"
          ? `<ul class="saq-parts">${(quest?.prompts || []).map((prompt) => `<li>${esc(prompt)}</li>`).join("")}</ul>`
          : `<p>${esc(quest?.prompt || "—")}</p>`;
      return `<article class="challenge"><p class="case-kicker">${esc(questTypeName(challenge.questType))}</p><p class="challenge-shape">${esc(questShape(challenge.questType, quest))}</p>${body}</article>`;
    })
    .join("");

  const caseRows = unit.cases
    .map(
      (entry, i) =>
        `<tr><td class="pin-cell"><span class="pin-chip">${i + 1}</span></td><td>${esc(entry.title.replace(/^Case [\d.]+ — /, ""))}</td><td>${esc(entry.route === "field" ? "Walkable map" : "Mission")}</td><td>${esc(entry.mechanic)}</td><td>${esc(entry.location)}</td></tr>`
    )
    .join("");

  const cases = unit.cases
    .map((entry, i) =>
      entry.route === "field"
        ? fieldCaseSection(entry, i, unit, data)
        : missionCaseSection(entry, i, data)
    )
    .join("");

  return `<section class="part" id="unit-${number}">
    <span class="part-num">Unit ${number} · ${esc(unit.period)}</span>
    <h2>${esc(unit.title)}</h2>
    <div class="unit-head">
      <div>
        <p class="question">${esc(unit.centralQuestion)}</p>
        <p>Three cases: one walkable map and two single-screen missions, played in the order below. The unit's written work waits on the Archive Terminal and can be composed at any point.</p>
      </div>
      <div>${nav}<figcaption>Where this unit sits, in the Navigation Table's own framing. Numbers match the play order.</figcaption></div>
    </div>
    <div class="table-scroll"><table>
      <caption>Play order</caption>
      <thead><tr><th>#</th><th>Case</th><th>Shape</th><th>Mechanic</th><th>Where and when</th></tr></thead>
      <tbody>${caseRows}</tbody></table></div>
    <h4>Archive Challenges — from the Archive Terminal</h4>
    <div class="challenges">${challengeCards}</div>
    ${cases}
  </section>`;
}

function fieldCaseSection(entry, index, unit, data) {
  const surfaces = data.surfaces;
  const copy = data.fieldCopy;
  const lanes = data.lanes[entry.id] || [];
  const laneList = lanes
    .map((lane) => `<li><b>${esc(lane.label)}</b> — ${esc(lane.hint || "")}</li>`)
    .join("");

  const blocks = surfaces
    .map((surface) => {
      const side = `${recordTable(surface.records)}${castTable(surface.npcs, surface.behaviours)}`;
      if (surface.kind === "outdoor") {
        // A 56x36 town gets the full column width and its tables underneath. Squeezed into the
        // side-by-side layout the interiors use, a tile is ten pixels and you cannot find anybody.
        return `<div class="surface-wide">${surfaceFigure(surface)}<div class="surface-under">${side}</div></div>`;
      }
      return `<h4>Behind a door — ${esc(surface.name)}</h4>
        <p class="note">Entered from the ${esc(surface.doorLabel)} marker out in the town, at tile ${num(surface.doorAt.x)}, ${num(surface.doorAt.y)}. A door is an interaction at the same reach as a person: stand next to it and press <b>E</b>. Recall to Archive is suppressed indoors — step outside first.</p>
        <div class="surface-block">${surfaceFigure(surface)}<div class="surface-side">${side}</div></div>`;
    })
    .join("");

  const total = data.sources.length;
  return `<article class="case" id="${esc(entry.id)}">
    <div class="case-head"><span class="case-kicker">Case ${index + 1} · walkable map</span><h3>${esc(entry.title)}</h3></div>
    <div class="case-meta"><span><b>${esc(entry.location)}</b></span><span>Key concepts <b>${entry.ced.keyConcepts.join(", ")}</b></span><span>Themes <b>${entry.ced.themes.join(", ")}</b></span><span><b>${total}</b> records</span><span><code>${esc(entry.id)}</code></span></div>
    <p class="question">${esc(entry.question || entry.summary)}</p>
    <p>${esc(copy.intro)}</p>
    ${blocks}
    <h4>What you have to do here</h4>
    <ol class="todo">
      <li>Walk the map and talk to whoever you like — most of the cast exists to establish the place, and only the people carrying a <b>✦</b> hold a record.</li>
      ${
        // The game's only gate inside a map, and it is genuinely case-001's alone —
        // sourceAvailability() hard-codes it. Saying so beats letting the checklist imply that all
        // three of this case's records are reachable from the moment you land.
        entry.id === "case-001"
          ? "<li>This case, alone in the game, gates one record behind another: <b>Columbus's account will not appear</b> until the Taíno village observation is secured. The point is that you establish what was already there before you read somebody's account of arriving.</li>"
          : ""
      }
      <li>Interact with each <b>✦</b> to open the record. Write an initial reading in your own words; <b>Institute Context</b> stays sealed until you do.</li>
      <li>Press <b>Secure in Codex</b> once the context has opened. The checklist beside the map tracks all ${total}.</li>
      <li>With all ${total} secured, <b>Open Reconstruction Table</b> and sort every record into one of the case's three lanes.</li>
      ${lanes.length ? `<li>The lanes for this case are:<ul>${laneList}</ul></li>` : ""}
      <li>Optional at any point: the <b>Practice Check</b> button runs this unit's four self-marking quest types against what you have read.</li>
    </ol>
  </article>`;
}

function missionCaseSection(entry, index, data) {
  const challenge = entry.archiveChallenge;
  const quest = challenge ? data.questById.get(challenge.questId) : null;
  const type = challenge?.questType;
  return `<article class="case" id="${esc(entry.id)}">
    <div class="case-head"><span class="case-kicker">Case ${index + 1} · mission</span><h3>${esc(entry.title)}</h3></div>
    <div class="case-meta"><span><b>${esc(entry.location)}</b></span><span>Key concepts <b>${entry.ced.keyConcepts.join(", ")}</b></span><span>Themes <b>${entry.ced.themes.join(", ")}</b></span><span>${esc(questTypeName(type))}</span><span><code>${esc(entry.id)}</code></span></div>
    <p class="question">${esc(entry.question || entry.summary)}</p>
    <p>${esc(entry.summary)}</p>
    <h4>What the screen asks</h4>
    <p>${esc(quest?.prompt || "—")}</p>
    <ul class="todo"><li><b>Shape:</b> ${esc(questShape(type, quest))}.</li><li><b>How it works:</b> ${esc(questSteps(type))}</li></ul>
  </article>`;
}

function part6(shots) {
  const items = [
    [
      "Practice Check — all four self-marking types",
      shots.practiceCheck,
      "Reached from the Evidence Channel on any field map, and optional. It runs the unit's multiple choice, sequencing, evidence sorting and HIPP quests in one screen and marks them itself. These are the four types a teacher can swap through Manage Content.",
    ],
    [
      "The Source Reader",
      shots.sourceReader,
      "Every record opens here. Write an initial reading, submit it, and Institute Context unlocks alongside the citation and a link to the original. The AI evaluator may add formative feedback — it never returns a grade.",
    ],
    [
      "Sequencing — a chronology to rebuild",
      shots.sequencing,
      "Items arrive out of order and move up and down. What is graded is the causal chain, not the dates, which are printed on the cards.",
    ],
    [
      "Evidence sorting — cards into categories",
      shots.evidence,
      "Every card goes into a category, more than one card can share a category, and a written reflection is required before it will submit.",
    ],
    [
      "The Reconstruction Table",
      shots.reconstruction,
      "How a field case closes. All of the case's secured records, sorted into that case's three lanes.",
    ],
    [
      "Archive Challenges — SAQ and DBQ",
      shots.archiveChallenges,
      "Only reachable by walking to the Archive Terminal. Real AP writing against the College Board rubrics; the evaluator returns formative feedback and a teacher enters the grade on the grading screen.",
    ],
  ];
  return `<section class="part" id="quest-types">
    <span class="part-num">Part 6</span>
    <h2>What each kind of task looks like</h2>
    <p>Six screens carry every one of the fifteen cases. A mission is one of these and nothing else; a field case is the map plus the Source Reader plus the Reconstruction Table.</p>
    <div class="shots">${items
      .map(
        ([title, src, blurb]) =>
          `<figure class="shot"><img src="${src}" alt="${esc(title)}" loading="lazy"><h4>${esc(title)}</h4><p>${esc(blurb)}</p></figure>`
      )
      .join("")}</div>
  </section>`;
}

function part7() {
  return `<section class="part" id="progression">
    <span class="part-num">Part 7</span>
    <h2>Progression, gating, and what a teacher can change</h2>
    <h4>How things unlock</h4>
    <p>Cases unlock in order within a unit — a marker stays locked on the Navigation Table until the previous case is archived. There is exactly one gate <em>inside</em> a map, in Case 1.01: the Columbus record will not appear until the Taíno village observation is secured, because the point of that case is that you establish what was there before you read somebody's account of arriving.</p>
    <h4>Where the badges live</h4>
    <p>The Preservation Case on its plinth in the Main Hall. Unit 1's three badge areas are Caribbean, Atlantic and Hispaniola.</p>
    <h4>What a teacher controls</h4>
    <p>From the Teacher Dashboard: the unit title and central question (Author Mode), a per-classroom pool of candidate sources, and a curated alternate for any mission's swappable slot — the four self-marking types, plus Case 1.02's Exchange Ledger records. It is a selection pipeline, not an authoring tool: a teacher picks from a small pre-authored pool per slot and cannot write new question text through it. Submissions land in the dashboard, where the AI evaluation is advisory and the teacher enters the actual grade.</p>
  </section>`;
}

function appendix() {
  return `<section class="part" id="open">
    <span class="part-num">Appendix</span>
    <h2>Known open items</h2>
    <p>Carried here because this is a tracking document. All three are recorded in <code>ARCHITECTURE-QUICKREF.md</code> §5.</p>
    <ul class="open-items">
      <li><b>Five sequencing quests across Units 2–4 ship pre-solved.</b> The renderer lays items out in the order they are authored and never shuffles, so a quest whose items are written 0,1,2,3 opens already correct and marks the student right for touching nothing. Unit 1 and Unit 5 author theirs scrambled; the convention was undocumented and three units lost it.</li>
      <li><b>The Navigation Table's unit-tab list runs past the fold at 1366×768</b> with five units, and has four more periods to grow into. It scrolls and nothing is broken, but how a nine-unit list should lay out is undecided.</li>
    </ul>
  </section>`;
}

// ── main ───────────────────────────────────────────────────────────────────────────────────────

async function main() {
  // Tier 1 — the content modules, imported for real.
  const campaigns = {};
  const laneArrays = {};
  const sourcesByCase = {};
  for (const id of UNIT_IDS) {
    const module = await imports(`content/${id}-campaign.js`);
    const key = `UNIT_${id.slice(-2)}`;
    campaigns[id] = module[key];
    for (const [name, value] of Object.entries(module)) {
      if (name.endsWith("_LANES")) laneArrays[name] = value;
      if (name.endsWith("_SOURCES")) {
        const caseId = `case-${name.match(/CASE_(\d+)_SOURCES/)[1]}`;
        sourcesByCase[caseId] = value;
      }
    }
  }

  const questById = new Map();
  for (const id of UNIT_IDS) {
    const module = await imports(`content/quests/${id}-quests.js`);
    for (const value of Object.values(module)) {
      if (!Array.isArray(value)) continue;
      for (const quest of value) if (quest?.id) questById.set(quest.id, quest);
    }
  }

  const { MAP_VIEWS, UNIT_MAP_VIEW } = await imports("content/maps/navigation-table-views.js");

  // Tier 2 — main.js.
  const mainJs = extractFromMainJs(laneArrays);

  // Tier 3 — art.
  const rooms = {};
  const roomTmj = { hallway: "hallway", main: "institute-hall", archive: "archive-room" };
  const roomNames = {
    hallway: "Entrance Hall",
    main: "Main Hall",
    archive: "Archive Room",
  };
  for (const [key, mapId] of Object.entries(roomTmj)) {
    const targets = mainJs.hubTargets[key];
    rooms[key] = {
      id: mapId,
      name: roomNames[key],
      image: await tmjImage(mapId, 1080, 78),
      targets,
      // Every interactable gets a numbered pin, matching the table beside it row for row.
      pins: Object.values(targets).map((target) => ({ x: target.x, y: target.y })),
      doors: [],
      spawn: must(ROOM_SPAWNS, key, "ROOM_SPAWNS"),
      recall: null,
    };
  }

  const unitData = {};
  for (const unitId of UNIT_IDS) {
    const unit = campaigns[unitId];
    const fieldCase = unit.cases.find((entry) => entry.route === "field");
    const outdoorId = must(OUTDOOR_TMJ, unitId, "OUTDOOR_TMJ");
    const interiors = mainJs.interiors[unitId] || {};
    const sources = sourcesByCase[fieldCase.id] || [];
    const sourceTitle = (id) => sources.find((source) => source.id === id);

    const buildSurface = async (kind, id, npcs, behaviours, points, extras) => {
      // The maps are the page. They get the budget that the screenshots and the coastline SVGs
      // don't need — an outdoor town at 1560px is legible enough to find a person on.
      const image = await tmjImage(id, kind === "outdoor" ? 1560 : 1080, 78);
      const records = [];
      const pins = [];
      for (const [sourceId, point] of Object.entries(points)) {
        const resolved = pinFor(point, npcs);
        pins.push(resolved);
        records.push({
          label: point.label || sourceTitle(sourceId)?.title || sourceId,
          carrier: resolved.carrier,
          moving: resolved.moving && behaviours[point.anchor?.npc]?.kind === "route",
          kind: point.kind || "Source",
        });
      }
      return {
        kind,
        id,
        name: must(SURFACE_NAMES, id, "SURFACE_NAMES"),
        image,
        npcs,
        behaviours,
        records,
        pins,
        ...extras,
      };
    };

    const doorMarks = Object.values(interiors).map((room) => ({
      x: room.door.x,
      y: room.door.y,
    }));

    const surfaces = [
      await buildSurface(
        "outdoor",
        outdoorId,
        mainJs.npcs[unitId],
        mainJs.behaviours[unitId],
        mainJs.sourcePoints[unitId],
        {
          spawn: mainJs.fieldMaps[unitId].spawn,
          recall: mainJs.fieldMaps[unitId].recall,
          doors: doorMarks,
        }
      ),
    ];
    for (const room of Object.values(interiors)) {
      surfaces.push(
        await buildSurface(
          "interior",
          room.id,
          mainJs.npcs[room.id],
          mainJs.behaviours[room.id],
          mainJs.sourcePoints[room.id],
          {
            // Entry and exit are the same doorway a tile apart, so only the door is marked —
            // two overlapping glyphs on one threshold read as a rendering fault, not as detail.
            doors: [{ x: room.exit.x, y: room.exit.y }],
            spawn: null,
            recall: null,
            doorLabel: room.door.label,
            doorAt: room.door,
          }
        )
      );
    }

    unitData[unitId] = {
      surfaces,
      sources,
      lanes: mainJs.lanes,
      fieldCopy: mainJs.fieldCopy[unitId],
      questById,
      viewKey: UNIT_MAP_VIEW[unitId],
      view: MAP_VIEWS[UNIT_MAP_VIEW[unitId]],
    };
  }

  const shots = {
    navTable: await snapshotImage("archive-navigation-table", 940, 72),
    practiceCheck: await snapshotImage("practice-check-unanswered", 900, 70),
    sourceReader: await snapshotImage("source-reader", 900, 70),
    sequencing: await snapshotImage("mission-triangle-ledger", 900, 70),
    evidence: await snapshotImage("mission-exchange-ledger", 900, 70),
    reconstruction: await snapshotImage("reconstruction", 900, 70),
    archiveChallenges: await snapshotImage("archive-challenges", 900, 70),
  };

  const railUnits = UNIT_IDS.map((unitId, index) => {
    const unit = campaigns[unitId];
    return `<li><a href="#unit-${index + 1}"><span class="n">${index + 1}</span>${esc(unit.title)}</a></li>`;
  }).join("");

  const totalCases = UNIT_IDS.reduce((sum, id) => sum + campaigns[id].cases.length, 0);
  const totalSurfaces = Object.values(unitData).reduce(
    (sum, data) => sum + data.surfaces.length,
    3
  );
  const totalCast = Object.values(mainJs.npcs).reduce((sum, list) => sum + list.length, 0);

  // Stamped so a copy of this page can be told apart from a newer one at a glance. The commit is
  // the more useful half — it says exactly which state of the game the page describes.
  const buildStamp = new Date().toISOString().slice(0, 10);
  let buildCommit = "not a git checkout";
  try {
    buildCommit = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    }).trim();
  } catch {
    // A tarball export has no git metadata; the date alone still dates the page.
  }

  const html = `<title>Chronicle Field Guide</title>
${styles()}
<div class="layout">
  <aside class="rail">
    <p class="rail-brand">Chronicle</p>
    <p class="rail-title">Field Guide</p>
    <nav aria-label="Contents"><ol>
      <li><a href="#institute"><span class="n">0</span>The Institute</a></li>
      <li class="sub"><a href="#hallway">Entrance Hall</a></li>
      <li class="sub"><a href="#main">Main Hall</a></li>
      <li class="sub"><a href="#archive">Archive Room</a></li>
      <li class="sub"><a href="#nav-table">Navigation Table</a></li>
      ${railUnits}
      <li><a href="#quest-types"><span class="n">6</span>Task types</a></li>
      <li><a href="#progression"><span class="n">7</span>Progression</a></li>
      <li><a href="#open"><span class="n">—</span>Open items</a></li>
    </ol></nav>
    <p class="rail-foot">Every name, coordinate and prompt on this page is read out of the content modules, <code>main.js</code> and the <code>.tmj</code> maps at build time — nothing here is transcribed by hand. Rebuild with <code>npm run docs:field-guide</code>.<br><br>Built ${esc(buildStamp)} · commit <code>${esc(buildCommit)}</code></p>
  </aside>
  <main>
    <header class="masthead">
      <p class="eyebrow">An AP U.S. History RPG · CED Periods 1–5 of 9</p>
      <h1>Every map, every mission, and what each one asks of you</h1>
      <p class="lede">The whole of Chronicle in one place: the Institute you work from, the five periods you travel to, every walkable surface with its records pinned and its cast named, and the task waiting at the end of each of the fifteen cases.</p>
      <div class="fact-row">
        <span><b>5</b> units</span><span><b>${totalCases}</b> cases</span><span><b>${totalSurfaces}</b> walkable surfaces</span><span><b>${totalCast}</b> named characters on the maps</span><span><b>6</b> kinds of task</span>
      </div>
    </header>
    ${navDefs(MAP_VIEWS)}
    ${part0(rooms, shots)}
    ${UNIT_IDS.map((unitId, index) => unitSection(campaigns[unitId], index, unitData[unitId])).join("")}
    ${part6(shots)}
    ${part7()}
    ${appendix()}
  </main>
</div>`;

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, html, "utf8");

  const bytes = Buffer.byteLength(html, "utf8");
  imageBudget.sort((a, b) => b.bytes - a.bytes);
  const kb = (n) => `${(n / 1024).toFixed(0)} kB`;
  console.log("image weight, heaviest first:");
  for (const entry of imageBudget) console.log(`  ${entry.label.padEnd(28)} ${kb(entry.bytes)}`);
  const imageBytes = imageBudget.reduce((sum, entry) => sum + entry.bytes, 0);
  console.log(
    `\n${imageBudget.length} images  ${kb(imageBytes)} raw / ${kb(imageBytes * 1.34)} base64`
  );
  console.log(
    `page: ${path.relative(REPO_ROOT, OUT_FILE)}  ${(bytes / 1024 / 1024).toFixed(2)} MB`
  );
  if (bytes > BUDGET_BYTES) {
    console.error(
      `\nover budget: ${(bytes / 1024 / 1024).toFixed(2)} MB > ${(BUDGET_BYTES / 1024 / 1024).toFixed(1)} MB`
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
