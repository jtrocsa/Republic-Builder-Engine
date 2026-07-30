// The document a student reads describes itself.
//
// The defect this guards (Phase 58): sourceVisual() branched on `source.visual` and hardcoded a
// caption and a footer per branch. `visual: "context"` is set on **9 of the 13 sources** across the
// three units, so nine records — including Patrick Henry's speech to the Second Virginia Convention,
// Dickinson's Farmer's Letters and Pontiac's council speech — were captioned "Secondary context
// record" and footed "Background evidence, not a Taíno-authored primary source". Exactly one source
// in the game is either of those things.
//
// Nothing could have caught it, because the caption was a string literal chosen by a field that means
// "how should this be laid out", not "what kind of source is this". The assertions below pin the
// property that replaced it: the caption is the source's own `type`, and no branch asserts anything
// about the document that the content did not say.

import { describe, expect, it } from "vitest";

import { sourceVisual } from "../../apps/web/src/main.js";
import { CASE_001_SOURCES } from "../../apps/web/src/content/unit-01-campaign.js";
import { CASE_004_SOURCES } from "../../apps/web/src/content/unit-02-campaign.js";
import { CASE_007_SOURCES } from "../../apps/web/src/content/unit-03-campaign.js";

const ALL_SOURCES = [...CASE_001_SOURCES, ...CASE_004_SOURCES, ...CASE_007_SOURCES];

/** main.js's esc(), so an assertion about content compares against what the markup actually holds. */
const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

describe("sourceVisual", () => {
  it("captions every source with its own declared type (normal case)", () => {
    const wrong = ALL_SOURCES.filter(
      (source) => !sourceVisual(source).includes(`<span>${esc(source.type)}</span>`)
    ).map((source) => source.id);
    expect(wrong).toEqual([]);
  });

  it("prints creator, date and record on the document itself (normal case)", () => {
    // These three used to sit in a <dl> in the reader's right-hand column, beside the paper rather
    // than on it. A record that does not carry its own attribution is the thing HIPP sourcing asks a
    // student to look at first.
    const missing = [];
    for (const source of ALL_SOURCES) {
      const html = sourceVisual(source);
      for (const [label, value] of [
        ["Creator", source.creator],
        ["Date", source.date],
        ["Record", source.record],
      ]) {
        if (!html.includes(`<dt>${label}</dt>`)) missing.push(`${source.id}: no ${label} label`);
        if (!html.includes(esc(value))) missing.push(`${source.id}: ${label} value absent`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("never tells a primary source it is background context (edge case)", () => {
    // The exact shipped defect, stated as an assertion. Both retired strings are named literally: if
    // either comes back for any source, this fails.
    const retired = ["Secondary context record", "not a Taíno-authored primary source"];
    const offenders = [];
    for (const source of ALL_SOURCES) {
      const html = sourceVisual(source);
      for (const phrase of retired) {
        if (html.includes(phrase)) offenders.push(`${source.id}: "${phrase}"`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("lets `visual` choose the presentation and nothing else (edge case)", () => {
    // A transcript is set as a blockquote, a prose excerpt as a paragraph, an image as a figure —
    // and all three carry the same masthead, so the shape of the page never implies a claim about
    // the source's provenance.
    const letter = ALL_SOURCES.find((source) => source.visual === "letter");
    const context = ALL_SOURCES.find((source) => source.visual === "context");
    const map = ALL_SOURCES.find((source) => source.visual === "map");
    expect(sourceVisual(letter)).toContain("<blockquote>");
    expect(sourceVisual(context)).not.toContain("<blockquote>");
    expect(sourceVisual(map)).toContain("<figure");
    for (const source of [letter, context, map]) {
      expect(sourceVisual(source)).toContain('class="document-masthead"');
    }
  });

  it("escapes source text rather than interpolating it raw (edge case)", () => {
    const html = sourceVisual({
      type: "Primary source · letter",
      creator: "A <script>",
      date: "1492",
      record: "R & R",
      excerpt: "5 < 6",
      visual: "letter",
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("R &amp; R");
  });
});
