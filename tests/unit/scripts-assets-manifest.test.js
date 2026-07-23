import { describe, expect, it } from "vitest";
import { toCsv } from "../../scripts/assets/manifest.js";

describe("toCsv (csv-stringify/sync, replacing hand-rolled CSV escaping)", () => {
  it("joins a plain header and rows with commas, one row per line (normal case)", () => {
    const csv = toCsv(
      ["path", "sizeBytes"],
      [
        ["a/b.png", 123],
        ["c/d.png", 456],
      ]
    );
    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe("path,sizeBytes");
    expect(lines[1]).toBe("a/b.png,123");
    expect(lines[2]).toBe("c/d.png,456");
  });

  it("quotes a field containing a comma (boundary case)", () => {
    const csv = toCsv(["path", "note"], [["a.png", "has, a comma"]]);
    expect(csv).toContain('"has, a comma"');
  });

  it("quotes and doubles internal quote characters (boundary case)", () => {
    const csv = toCsv(["path", "note"], [["a.png", 'say "hi"']]);
    expect(csv).toContain('"say ""hi"""');
  });

  it("quotes a field containing an embedded line break, keeping it as one logical CSV record (boundary case)", () => {
    const csv = toCsv(["path", "note"], [["a.png", "line one\nline two"]]);
    expect(csv).toContain('"line one\nline two"');
    // The embedded \n must not be misread as a second data row when the file is re-parsed.
    const dataLineCount = csv.trim().split("\n").length;
    expect(dataLineCount).toBe(3); // header + the one embedded-newline field + nothing extra
  });

  it("leaves a plain field with no special characters unquoted (normal case)", () => {
    const csv = toCsv(["path"], [["plain/path.png"]]);
    expect(csv.trim().split("\n")[1]).toBe("plain/path.png");
  });

  it("renders an empty row array as just the header (boundary case)", () => {
    const csv = toCsv(["path", "sizeBytes"], []);
    expect(csv.trim()).toBe("path,sizeBytes");
  });

  it('renders booleans as the literal strings "true"/"false", not csv-stringify\'s default "1"/"" (regression case)', () => {
    // csv-stringify's own default cast turns `true` into "1" and `false` into "" (empty) — a
    // silent reformat of every boolean report column (referencedDirect, confirmedInDist, etc.)
    // relative to the prior hand-rolled csvCell()'s String(value) behavior. toCsv() overrides
    // this via an explicit `cast.boolean` option; this test guards that override.
    const csv = toCsv(["flag"], [[true], [false]]);
    const lines = csv.trim().split("\n");
    expect(lines[1]).toBe("true");
    expect(lines[2]).toBe("false");
  });

  it("renders null/undefined as an empty cell, matching the prior csvCell() behavior (boundary case)", () => {
    // Deliberately not .trim()'d: both data rows are empty strings, and trimming would eat them,
    // hiding the exact thing this test needs to observe.
    const csv = toCsv(["value"], [[null], [undefined]]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("value");
    expect(lines[1]).toBe("");
    expect(lines[2]).toBe("");
  });
});
