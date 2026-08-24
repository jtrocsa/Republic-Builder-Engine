import { describe, expect, it } from "vitest";
import { createGlobMatcher } from "../../scripts/assets/audit.js";
import { toPosixPath } from "../../scripts/assets/lib/file-stats.js";

// Real, current `import.meta.glob("...")` literals from apps/web/src/main.js (verified via
// grep as of this test's authoring — every call site in this repo passes an exact literal path,
// no `*`/`**`/`?` wildcard characters). picomatch (replacing this file's former hand-rolled
// globToRegExp()) must match these exactly, since Chronicle's audit relies on that to correctly
// classify every referenced tileset image as "referenced", not "unreferenced".
const REAL_CHRONICLE_GLOB_LITERALS = [
  "./assets/tilesets/Medieval Fishing Village/tile-B-04.png",
  "./assets/tilesets/Medieval Fantasy Town/1.png",
  "./assets/tilesets/farm/3.png",
  "./assets/tilesets/Island survival/tile-B-01.png",
  "./assets/tilesets/Island survival/tile-B-02.png",
  "./assets/tilesets/Medieval Tavern/tile-B-01.png",
  "./assets/tilesets/Medieval Tavern/tile-B-03.png",
  "./assets/tilesets/Medieval Tavern/tile-B-05.png",
  "./assets/tilesets/Medieval Fantasy Town/2.png",
  "./assets/tilesets/Medieval Fantasy Town/5.png",
  "./assets/tilesets/Common Cause Philadelphia/liberty-pole.png",
];

const ROOT = "/repo/apps/web/src";

describe("createGlobMatcher against real Chronicle import.meta.glob literals", () => {
  it.each(REAL_CHRONICLE_GLOB_LITERALS)(
    "matches the exact asset path a literal pattern resolves to: %s (normal case)",
    (relativePattern) => {
      // Mirrors audit.js's own resolution: path.resolve(sourceDir, pattern), then toPosixPath.
      const resolvedPattern = toPosixPath(`${ROOT}/${relativePattern.replace(/^\.\//, "")}`);
      const isMatch = createGlobMatcher(resolvedPattern);
      expect(isMatch(resolvedPattern)).toBe(true);
    }
  );

  it("does not match a different file in the same folder, since every current pattern is a literal path (normal case)", () => {
    const pattern = toPosixPath(`${ROOT}/assets/tilesets/Medieval Fantasy Town/1.png`);
    const isMatch = createGlobMatcher(pattern);
    expect(isMatch(toPosixPath(`${ROOT}/assets/tilesets/Medieval Fantasy Town/2.png`))).toBe(false);
  });

  it("handles folder names containing spaces without treating the space as a separator (boundary case)", () => {
    const pattern = toPosixPath(
      `${ROOT}/assets/tilesets/Common Cause Philadelphia/liberty-pole.png`
    );
    const isMatch = createGlobMatcher(pattern);
    expect(isMatch(pattern)).toBe(true);
    expect(
      isMatch(toPosixPath(`${ROOT}/assets/tilesets/Common/Cause Philadelphia/liberty-pole.png`))
    ).toBe(false);
  });
});

// Wildcard support: no current call site uses these, but audit.js's own comments have long
// documented `*`/`**`/`?` support "in case that changes" — verify picomatch preserves the same
// semantics the former hand-rolled globToRegExp() implemented.
describe("createGlobMatcher wildcard semantics (not exercised by current literal-only call sites, kept for parity)", () => {
  it("matches a single path segment with `*`, but not across a `/` (normal + boundary case)", () => {
    const isMatch = createGlobMatcher(`${ROOT}/assets/tilesets/*/tile-B-01.png`);
    expect(isMatch(`${ROOT}/assets/tilesets/Island survival/tile-B-01.png`)).toBe(true);
    expect(isMatch(`${ROOT}/assets/tilesets/Medieval Tavern/tile-B-01.png`)).toBe(true);
    // `*` must not cross into a nested subdirectory.
    expect(isMatch(`${ROOT}/assets/tilesets/Island survival/sub/tile-B-01.png`)).toBe(false);
  });

  it("matches across multiple path segments with `**` (normal case)", () => {
    const isMatch = createGlobMatcher(`${ROOT}/assets/tilesets/**/tile-B-01.png`);
    expect(isMatch(`${ROOT}/assets/tilesets/Island survival/tile-B-01.png`)).toBe(true);
    expect(isMatch(`${ROOT}/assets/tilesets/Island survival/sub/tile-B-01.png`)).toBe(true);
  });

  it("matches exactly one character with `?` (normal + boundary case)", () => {
    const isMatch = createGlobMatcher(`${ROOT}/assets/tilesets/farm/tile-B-0?.png`);
    expect(isMatch(`${ROOT}/assets/tilesets/farm/tile-B-04.png`)).toBe(true);
    // Two digits shouldn't satisfy a single `?`.
    expect(isMatch(`${ROOT}/assets/tilesets/farm/tile-B-104.png`)).toBe(false);
  });
});

// Windows only, and deliberately so. `toPosixPath()` splits on `path.sep`, which is a backslash
// only on Windows — on POSIX a backslash is a legal character in a filename, so converting one to
// a separator there would be a bug, not a feature. The scenario this covers (path.resolve handing
// back a backslash-joined absolute path) cannot arise on Linux, so running it there tests nothing
// and only fails. Found by CI, which is the first thing in this repo ever to run the suite on
// Linux; this was the only one of 1,857 tests that did not survive the platform change.
describe.runIf(process.platform === "win32")(
  "toPosixPath + createGlobMatcher together, simulating a Windows-joined absolute path",
  () => {
    it("matches once both the pattern and the candidate are normalized to POSIX form (integration case)", () => {
      const windowsStyleCandidate = `${ROOT.replace(/\//g, "\\")}\\assets\\tilesets\\farm\\3.png`;
      const pattern = toPosixPath(`${ROOT}/assets/tilesets/farm/3.png`);
      const isMatch = createGlobMatcher(pattern);
      expect(isMatch(toPosixPath(windowsStyleCandidate))).toBe(true);
    });
  }
);
