import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Buffer } from "node:buffer";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

import {
  readImageDimensions,
  sha256File,
  toPosixPath,
  walkFiles,
} from "../../scripts/assets/lib/file-stats.js";

describe("toPosixPath", () => {
  it("converts native-separator paths to forward slashes (normal case)", () => {
    const nativePath = ["a", "b", "c.png"].join(path.sep);
    expect(toPosixPath(nativePath)).toBe("a/b/c.png");
  });

  it("leaves an already-POSIX path unchanged (boundary case)", () => {
    expect(toPosixPath("a/b/c.png")).toBe("a/b/c.png");
  });

  it("round-trips a Windows-style absolute path through path.join back to POSIX form (normal case)", () => {
    // path.join uses the current platform's separator, mirroring how walkFiles()/audit.js build
    // absolute paths — toPosixPath() must normalize whatever this platform's path.join produces.
    const joined = path.join("C:", "Users", "dev", "assets", "sprite.png");
    const posix = toPosixPath(joined);
    expect(posix).not.toContain("\\");
    expect(posix.endsWith("sprite.png")).toBe(true);
  });
});

describe("readImageDimensions (Sharp .metadata(), replacing hand-rolled header parsers)", () => {
  let dir;

  beforeAll(async () => {
    dir = mkdtempSync(path.join(tmpdir(), "chronicle-asset-audit-test-"));

    const pngBuffer = await sharp({
      create: { width: 7, height: 5, channels: 3, background: { r: 10, g: 20, b: 30 } },
    })
      .png()
      .toBuffer();
    writeFileSync(path.join(dir, "fixture.png"), pngBuffer);

    const jpegBuffer = await sharp({
      create: { width: 9, height: 4, channels: 3, background: { r: 40, g: 50, b: 60 } },
    })
      .jpeg()
      .toBuffer();
    writeFileSync(path.join(dir, "fixture.jpg"), jpegBuffer);

    const gifBuffer = await sharp({
      create: { width: 6, height: 3, channels: 3, background: { r: 70, g: 80, b: 90 } },
    })
      .gif()
      .toBuffer();
    writeFileSync(path.join(dir, "fixture.gif"), gifBuffer);

    writeFileSync(
      path.join(dir, "fixture-wh.svg"),
      '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="34"></svg>'
    );
    writeFileSync(
      path.join(dir, "fixture-viewbox.svg"),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"></svg>'
    );

    writeFileSync(path.join(dir, "corrupt.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x01]));
    writeFileSync(path.join(dir, "not-an-image.txt"), "just text, not image bytes");
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("reads PNG width/height (normal case)", async () => {
    const dims = await readImageDimensions(path.join(dir, "fixture.png"));
    expect(dims).toEqual({ width: 7, height: 5 });
  });

  it("reads JPEG width/height (normal case)", async () => {
    const dims = await readImageDimensions(path.join(dir, "fixture.jpg"));
    expect(dims).toEqual({ width: 9, height: 4 });
  });

  it("reads GIF width/height (normal case)", async () => {
    const dims = await readImageDimensions(path.join(dir, "fixture.gif"));
    expect(dims).toEqual({ width: 6, height: 3 });
  });

  it("reads SVG width/height from explicit attributes (normal case)", async () => {
    const dims = await readImageDimensions(path.join(dir, "fixture-wh.svg"));
    expect(dims).toEqual({ width: 12, height: 34 });
  });

  it("reads SVG intrinsic size from viewBox when width/height are absent (normal case)", async () => {
    const dims = await readImageDimensions(path.join(dir, "fixture-viewbox.svg"));
    expect(dims).toEqual({ width: 40, height: 20 });
  });

  it("returns null for a missing file rather than throwing (boundary case)", async () => {
    const dims = await readImageDimensions(path.join(dir, "does-not-exist.png"));
    expect(dims).toBeNull();
  });

  it("returns null for a corrupt/truncated image rather than throwing (boundary case)", async () => {
    const dims = await readImageDimensions(path.join(dir, "corrupt.png"));
    expect(dims).toBeNull();
  });

  it("returns null for a non-image file rather than throwing (boundary case)", async () => {
    const dims = await readImageDimensions(path.join(dir, "not-an-image.txt"));
    expect(dims).toBeNull();
  });
});

describe("sha256File duplicate detection", () => {
  let dir;

  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), "chronicle-asset-audit-hash-test-"));
    writeFileSync(path.join(dir, "a.bin"), Buffer.from("identical content"));
    writeFileSync(path.join(dir, "b.bin"), Buffer.from("identical content"));
    writeFileSync(path.join(dir, "c.bin"), Buffer.from("different content"));
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("produces identical hashes for byte-identical files, regardless of filename (normal case)", () => {
    const hashA = sha256File(path.join(dir, "a.bin"));
    const hashB = sha256File(path.join(dir, "b.bin"));
    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64);
  });

  it("produces different hashes for different content (boundary case)", () => {
    const hashA = sha256File(path.join(dir, "a.bin"));
    const hashC = sha256File(path.join(dir, "c.bin"));
    expect(hashA).not.toBe(hashC);
  });
});

describe("walkFiles (fs.readdirSync recursive, replacing hand-rolled recursion)", () => {
  let dir;

  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), "chronicle-asset-audit-walk-test-"));
    writeFileSync(path.join(dir, "root.png"), "x");
    const nested = path.join(dir, "nested", "deeper");
    mkdirSync(nested, { recursive: true });
    writeFileSync(path.join(nested, "leaf.png"), "y");
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("recursively lists files under nested directories, returning absolute paths (normal case)", () => {
    const files = walkFiles(dir).map(toPosixPath).sort();
    expect(files).toHaveLength(2);
    expect(files.some((f) => f.endsWith("root.png"))).toBe(true);
    expect(files.some((f) => f.endsWith("nested/deeper/leaf.png"))).toBe(true);
  });

  it("returns an empty array for a root that doesn't exist, rather than throwing (boundary case)", () => {
    expect(walkFiles(path.join(dir, "does-not-exist"))).toEqual([]);
  });
});
