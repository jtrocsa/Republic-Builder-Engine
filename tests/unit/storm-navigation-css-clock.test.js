import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * **Nothing inside Storm Navigation's stage may use a CSS clock.**
 *
 * `runMiniGameLoop` in main.js redraws this mini-game by replacing its container's entire
 * `innerHTML` on every animation frame — **121 container rebuilds in 2 seconds, measured in the
 * browser**. So every node in the returned markup is destroyed and recreated about every 16ms,
 * which breaks both CSS timing mechanisms outright:
 *
 * - an `animation` never advances, because a fresh node restarts its own timeline from frame
 *   zero every time (`currentTime` read **0ms at t=0, 0ms at t=1.5s and 0ms at t=3.0s**);
 * - a `transition` never fires, because a node that has just been created has no previous value
 *   to ease from.
 *
 * Both failure modes are silent. A frozen animation looks exactly like a static decoration, and
 * a transition that does not fire looks like a value that was meant to snap. `.storm-clouds`
 * carried `animation: stormCloudsDrift 14s linear infinite` from the day the mini-game shipped,
 * and the sky never drifted once; `.storm-ship-art` carried a `transition` that had never run.
 * The module's own file header states the rule — every continuous value is computed from
 * `state.elapsedMs` and emitted inline — and these two were simply never brought under it.
 *
 * **This guard is keyed to Storm Navigation alone, deliberately.** Cargo Sorting sits in the same
 * container and is rendered by the same loop, but it redraws only when its displayed second
 * changes — **1 rebuild in 2 seconds, measured the same way** — so its nodes live about a
 * thousand times longer and its `.cargo-hold { transition: filter 0.15s ease }` has room to
 * complete. Asking one question of both would answer Cargo's question with Storm's answer.
 */

const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

const renderer = read("../../apps/web/src/mini-games/storm-navigation.js");
const css = read("../../apps/web/src/styles/global.css").replace(/\/\*[\s\S]*?\*\//g, (m) =>
  m.replace(/[^\n]/g, " ")
);

/** Every class literal a renderer emits, from its entry point to the end of the module. */
function emittedClasses(source, entry) {
  const start = source.indexOf(entry);
  if (start < 0) throw new Error(`no "${entry}" in that module`);
  const body = source.slice(start);
  const found = new Set();
  for (const m of body.matchAll(/class="([^"${}]*)"/g)) {
    for (const cls of m[1].split(/\s+/)) if (cls) found.add(cls);
  }
  return found;
}

/** Flat list of style rules, descending through at-rules, ignoring @keyframes bodies. */
function styleRules(text, offset = 0, out = []) {
  let i = 0;
  let selStart = 0;
  let buf = "";
  while (i < text.length) {
    if (text[i] === "{") {
      let depth = 1;
      let j = i + 1;
      while (j < text.length && depth > 0) {
        if (text[j] === "{") depth++;
        else if (text[j] === "}") depth--;
        j++;
      }
      const selector = buf.trim();
      const inner = text.slice(i + 1, j - 1);
      if (selector.startsWith("@keyframes")) {
        // A keyframe definition is inert; only a rule that *uses* one can freeze.
      } else if (selector.startsWith("@")) {
        styleRules(inner, offset + i + 1, out);
      } else if (selector) {
        out.push({ selector, body: inner, at: offset + selStart });
      }
      buf = "";
      i = j;
      selStart = i;
      continue;
    }
    buf += text[i];
    i++;
  }
  return out;
}

/** The last compound in a selector — the element the rule actually styles. */
const subjectOf = (part) =>
  part
    .trim()
    .split(/\s*[>+~]\s*|\s+/)
    .filter(Boolean)
    .pop() || "";

const lineOf = (index) => css.slice(0, index).split("\n").length;

const STORM_CLASSES = emittedClasses(renderer, "export function renderStormNavigationGame");
const RULES = styleRules(css);

function clockRulesFor(classNames) {
  const hits = [];
  for (const rule of RULES) {
    const declarations = [
      ...rule.body.matchAll(/(?:^|[;\s])(animation|transition)(-[a-z]+)?\s*:\s*([^;]+)/g),
    ];
    if (!declarations.length) continue;
    for (const part of rule.selector.split(",")) {
      const subject = subjectOf(part);
      for (const cls of classNames) {
        // Class names here carry no regex metacharacters (a hyphen is literal outside a character
        // class), so only the leading dot needs escaping — and it does need it, or the pattern
        // matches any character in that position and `.storm-clouds` would also hit
        // `.mega-storm-clouds`. The trailing lookahead is what stops the other end.
        if (!new RegExp(`\\.${cls}(?![a-zA-Z0-9_-])`).test(subject)) continue;
        for (const decl of declarations) {
          const value = decl[3].trim().replace(/\s+/g, " ");
          // `none` / `0s` declare that there is no clock, which is the thing we want.
          if (/^none\b|^0s\b/.test(value)) continue;
          hits.push(
            `global.css:${lineOf(rule.at)}  ${part.trim()} { ${decl[1]}${decl[2] || ""}: ${value} }`
          );
        }
      }
    }
  }
  return [...new Set(hits)];
}

describe("Storm Navigation's stage is rebuilt every frame, so nothing in it may use a CSS clock", () => {
  it("finds the classes it is supposed to be checking", () => {
    // Anti-vacuity: if the renderer's markup is ever restructured so no class literal is found,
    // every assertion below would pass by checking nothing at all.
    expect(STORM_CLASSES.size).toBeGreaterThan(8);
    expect(STORM_CLASSES).toContain("storm-clouds");
    expect(STORM_CLASSES).toContain("storm-ship-art");
    expect(STORM_CLASSES).toContain("storm-track");
    expect(RULES.length).toBeGreaterThan(1000);
  });

  it("declares no animation or transition on any element in the storm stage", () => {
    const hits = clockRulesFor(STORM_CLASSES);
    expect(
      hits,
      "These rules cannot do anything. Storm Navigation replaces its container's whole innerHTML " +
        "every animation frame (121 rebuilds in 2s, measured), so each of these elements is a new " +
        "node about every 16ms: an `animation` restarts from frame zero and never advances, and a " +
        "`transition` has no previous value to ease from and never fires. Both fail silently — a " +
        "frozen animation is indistinguishable from a static decoration. `.storm-clouds` carried a " +
        "14s infinite drift this way and the sky never moved. Compute the value from " +
        "state.elapsedMs in storm-navigation.js and emit it inline, as the water, rain, lightning, " +
        "cloud drift and hazard/ship bob all do.\n\nFound:\n" +
        hits.join("\n")
    ).toEqual([]);
  });

  it("drives the cloud drift from elapsedMs instead, and the stylesheet reads it", () => {
    // The positive half: the effect the retired keyframe was for still exists.
    expect(renderer).toMatch(/function cloudDriftPercent\(elapsedMs\)/);
    expect(renderer).toMatch(/--drift-pct:\$\{cloudDrift\.toFixed\(2\)\}%/);
    expect(css).toMatch(/--drift-pct/);
    expect(css).not.toMatch(/stormCloudsDrift/);
  });

  it("does not hold Cargo Sorting to the same rule, because it does not redraw the same way", () => {
    // Cargo redraws only when its displayed second changes — 1 rebuild in 2s against Storm's 121
    // — so a 0.15s transition on `.cargo-hold` completes comfortably. This assertion exists so
    // that a later reader widening the sweep to "all mini-games" sees why it was not already.
    const cargo = read("../../apps/web/src/mini-games/cargo-sorting.js");
    const cargoClasses = emittedClasses(cargo, "export function renderCargoSortingGame");
    expect(clockRulesFor(cargoClasses).length).toBeGreaterThan(0);
  });
});
