import { describe, it, expect } from "vitest";
import {
  sourceSelectorOptionLabel,
  fieldHasCustomizedExcerpt,
  resolvePoolSourceFields,
} from "../../apps/web/src/main.js";
import {
  getPrimarySourceById,
  getVisualSourceById,
} from "../../apps/web/src/content/primary-source-library/index.js";

// sourceSelectorOptionLabel() builds the enriched "Source for this activity"
// <option> text (title + author/date + type) that replaced the old
// title-only dropdown — see sourceSelectorOptionsMarkup()'s doc comment.
// Uses real primary-source-library entries, matching this repo's convention
// of testing against real cited content rather than fabricated fixtures.
describe("sourceSelectorOptionLabel", () => {
  it("formats a text source as title — creator, date (text source)", () => {
    const item = getPrimarySourceById("u01-columbus-first-voyage-letter");
    expect(sourceSelectorOptionLabel("text", item)).toBe(
      "Letter announcing the first voyage — Christopher Columbus, 1492-1493 (text source)"
    );
  });

  it("formats a visual source as title (image source), with no author/date — visual sources have neither", () => {
    const item = getVisualSourceById("u01-visual-tenochtitlan-maps");
    expect(sourceSelectorOptionLabel("visual", item)).toBe(
      "Aztec or Tenochtitlan maps (image source)"
    );
  });
});

// fieldHasCustomizedExcerpt() is the confirmed-bug fix's core guard: it's
// what decides whether picking a different source should silently overwrite
// the current excerpt (as it always used to) or warn first because there's
// a teacher-customized excerpt to lose — see its own doc comment and the
// data-copy-*-source branches in handleAppChange().
describe("fieldHasCustomizedExcerpt", () => {
  it("is false when there's no pool value yet — nothing to compare against", () => {
    expect(fieldHasCustomizedExcerpt("", "some text")).toBe(false);
    expect(fieldHasCustomizedExcerpt(null, "some text")).toBe(false);
  });

  it("is true when a source is picked but the text has been cleared out — genuinely differs from stock", () => {
    // A known heuristic limitation (see the function's own doc comment): it
    // can't tell "manually cleared" apart from "deliberately customized to
    // empty," but both are real differences from the source's stock text,
    // so flagging this as customized (not silently overwritable) is correct.
    expect(fieldHasCustomizedExcerpt("text:u01-columbus-first-voyage-letter", "")).toBe(true);
  });

  it("is false when the current text still matches the picked source's stock excerpt", () => {
    const resolved = resolvePoolSourceFields("text:u01-columbus-first-voyage-letter");
    expect(
      fieldHasCustomizedExcerpt("text:u01-columbus-first-voyage-letter", resolved.fullText)
    ).toBe(false);
  });

  it("is true when the current text differs from the picked source's stock excerpt/fullText", () => {
    expect(
      fieldHasCustomizedExcerpt(
        "text:u01-columbus-first-voyage-letter",
        "My own teacher-written summary of this letter."
      )
    ).toBe(true);
  });

  it("is false for a pool value that doesn't resolve to a real catalog entry", () => {
    expect(fieldHasCustomizedExcerpt("text:not-a-real-source-id", "anything")).toBe(false);
  });
});
