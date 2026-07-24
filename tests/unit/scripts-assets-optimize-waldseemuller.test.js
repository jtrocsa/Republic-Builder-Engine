import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Buffer } from "node:buffer";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

import { sha256File } from "../../scripts/assets/lib/file-stats.js";
import {
  CANDIDATES,
  RECOMMENDED_CANDIDATE_ID,
  buildCandidateBuffer,
  computeReduction,
  renderPilotReportMarkdown,
  runPilotOptimization,
} from "../../scripts/assets/optimize-waldseemuller.js";

// A high-entropy synthetic "source" JPEG (random pixels, quality 100) stands in for the real
// ~3.7 MB Waldseemüller scan in every test below. Real photographic/scan content and random noise
// both defeat JPEG's flat-region run-length coding, so quality-82/75 mozjpeg re-encodes still
// measurably shrink it — a flat-color fixture would compress to near-zero regardless of quality
// and wouldn't actually exercise the size-reduction behavior under test.
async function createSyntheticSourceJpeg(width = 640, height = 480) {
  const channels = 3;
  const pixels = Buffer.alloc(width * height * channels);
  for (let i = 0; i < pixels.length; i += 1) {
    pixels[i] = Math.floor(Math.random() * 256);
  }
  return sharp(pixels, { raw: { width, height, channels } }).jpeg({ quality: 100 }).toBuffer();
}

describe("CANDIDATES / RECOMMENDED_CANDIDATE_ID", () => {
  it("names a recommended candidate that actually exists in the candidate list (normal case)", () => {
    expect(CANDIDATES.some((c) => c.id === RECOMMENDED_CANDIDATE_ID)).toBe(true);
  });

  it("caps candidates at three, per the pilot's scope restriction (regression case)", () => {
    expect(CANDIDATES.length).toBeLessThanOrEqual(3);
  });
});

describe("computeReduction", () => {
  it("computes bytes saved and percent reduction (normal case)", () => {
    const { bytesSaved, percentReduction } = computeReduction(1000, 600);
    expect(bytesSaved).toBe(400);
    expect(percentReduction).toBeCloseTo(40, 5);
  });

  it("returns 0% reduction for a zero-byte source without dividing by zero (boundary case)", () => {
    const { percentReduction, bytesSaved } = computeReduction(0, 0);
    expect(percentReduction).toBe(0);
    expect(bytesSaved).toBe(0);
  });
});

describe("buildCandidateBuffer", () => {
  let sourceBuffer;

  beforeAll(async () => {
    sourceBuffer = await createSyntheticSourceJpeg(200, 150);
  });

  it("produces a readable JPEG at native resolution when resizeWidth is null (normal case)", async () => {
    const candidate = CANDIDATES.find((c) => c.id === "candidate-a-mozjpeg-q82-native-res");
    const outBuffer = await buildCandidateBuffer(sourceBuffer, candidate);
    const meta = await sharp(outBuffer).metadata();
    expect(meta.format).toBe("jpeg");
    expect(meta.width).toBe(200);
    expect(meta.height).toBe(150);
  });

  it("resizes to the documented width using Lanczos3, preserving aspect ratio (normal case)", async () => {
    const wideSource = await createSyntheticSourceJpeg(4000, 2200);
    const outBuffer = await buildCandidateBuffer(wideSource, {
      resizeWidth: 400,
      jpeg: { quality: 85, mozjpeg: true },
    });
    const meta = await sharp(outBuffer).metadata();
    expect(meta.width).toBe(400);
    expect(meta.height).toBe(220);
  });

  it("does not upscale when the resize target is larger than the source (boundary case)", async () => {
    const outBuffer = await buildCandidateBuffer(sourceBuffer, {
      resizeWidth: 4000,
      jpeg: { quality: 82, mozjpeg: true },
    });
    const meta = await sharp(outBuffer).metadata();
    expect(meta.width).toBe(200);
    expect(meta.height).toBe(150);
  });

  it("lower quality settings produce a smaller buffer than higher quality settings (normal case)", async () => {
    const highQuality = await buildCandidateBuffer(sourceBuffer, {
      resizeWidth: null,
      jpeg: { quality: 95, mozjpeg: true },
    });
    const lowQuality = await buildCandidateBuffer(sourceBuffer, {
      resizeWidth: null,
      jpeg: { quality: 60, mozjpeg: true },
    });
    expect(lowQuality.length).toBeLessThan(highQuality.length);
  });
});

describe("runPilotOptimization", () => {
  let tmpRoot;
  let sourceFile;
  let outputDir;

  // Wider than every candidate's resizeWidth (3600 max), so a resize-configured recommended
  // candidate actually engages its resize branch rather than being a no-op via withoutEnlargement.
  // Kept short/thin (not a realistic aspect ratio) purely to keep pixel count — and therefore
  // mozjpeg encode time across this describe block's many runPilotOptimization() calls — low;
  // buildCandidateBuffer's own tests above already cover a realistic wide/tall resize.
  const SOURCE_WIDTH = 3700;
  const SOURCE_HEIGHT = 40;

  beforeAll(async () => {
    tmpRoot = mkdtempSync(path.join(tmpdir(), "chronicle-waldseemuller-pilot-test-"));
    sourceFile = path.join(tmpRoot, "source-fixture.jpg");
    writeFileSync(sourceFile, await createSyntheticSourceJpeg(SOURCE_WIDTH, SOURCE_HEIGHT));
    outputDir = path.join(tmpRoot, "generated", "optimized", "documents");
  });

  afterAll(() => {
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  it("never modifies the original source file (normal case)", async () => {
    const hashBefore = sha256File(sourceFile);
    const result = await runPilotOptimization({ sourceFile, outputDir });
    expect(sha256File(sourceFile)).toBe(hashBefore);
    expect(result.sourceUnmodified).toBe(true);
  });

  it("writes the recommended candidate to the expected production-shaped path (normal case)", async () => {
    const result = await runPilotOptimization({ sourceFile, outputDir });
    expect(result.productionOutputFile).toBe(
      path.join(outputDir, "source-waldseemuller-1507.jpg")
    );
    expect(existsSync(result.productionOutputFile)).toBe(true);
  });

  it("produces a valid, readable JPEG at the recommended output path (normal case)", async () => {
    const result = await runPilotOptimization({ sourceFile, outputDir });
    const meta = await sharp(result.productionOutputFile).metadata();
    expect(meta.format).toBe("jpeg");
    expect(meta.width).toBeGreaterThan(0);
    expect(meta.height).toBeGreaterThan(0);
  });

  it("applies the recommended candidate's own resize/native-resolution setting (normal case)", async () => {
    const result = await runPilotOptimization({ sourceFile, outputDir });
    const recommendedSpec = CANDIDATES.find((c) => c.id === RECOMMENDED_CANDIDATE_ID);
    if (recommendedSpec.resizeWidth) {
      expect(result.recommended.width).toBe(recommendedSpec.resizeWidth);
    } else {
      expect(result.recommended.width).toBe(SOURCE_WIDTH);
      expect(result.recommended.height).toBe(SOURCE_HEIGHT);
    }
  });

  it("produces a recommended output smaller than the source (normal case)", async () => {
    const result = await runPilotOptimization({ sourceFile, outputDir });
    expect(result.recommended.sizeBytes).toBeLessThan(result.sourceStats.sizeBytes);
  });

  it("keeps every candidate file on disk for review, deleting none (normal case)", async () => {
    const result = await runPilotOptimization({ sourceFile, outputDir });
    expect(result.candidates).toHaveLength(CANDIDATES.length);
    for (const candidate of result.candidates) {
      expect(existsSync(candidate.writtenTo)).toBe(true);
    }
  });

  it("is deterministic enough across repeated runs on the same input (regression case)", async () => {
    const first = await runPilotOptimization({ sourceFile, outputDir });
    const second = await runPilotOptimization({ sourceFile, outputDir });
    expect(second.recommended.sha256).toBe(first.recommended.sha256);
    expect(second.recommended.sizeBytes).toBe(first.recommended.sizeBytes);
  });

  it("throws a clear, specific error and writes nothing when the source is missing (boundary case)", async () => {
    const missingSource = path.join(tmpRoot, "does-not-exist.jpg");
    const missingOutputDir = path.join(tmpRoot, "generated-missing-source-test");
    await expect(
      runPilotOptimization({ sourceFile: missingSource, outputDir: missingOutputDir })
    ).rejects.toThrow(/source file not found/);
    expect(existsSync(missingOutputDir)).toBe(false);
  });
});

describe("renderPilotReportMarkdown", () => {
  let tmpRoot;

  afterAll(() => {
    if (tmpRoot) rmSync(tmpRoot, { recursive: true, force: true });
  });

  it("includes original/output dimensions, sizes, percent reduction, and rollback guidance (normal case)", async () => {
    tmpRoot = mkdtempSync(path.join(tmpdir(), "chronicle-waldseemuller-report-test-"));
    const sourceFile = path.join(tmpRoot, "source-fixture.jpg");
    writeFileSync(sourceFile, await createSyntheticSourceJpeg(300, 200));
    const outputDir = path.join(tmpRoot, "generated", "optimized", "documents");

    const result = await runPilotOptimization({ sourceFile, outputDir });
    const markdown = renderPilotReportMarkdown(result);

    expect(markdown).toContain("Waldseem");
    expect(markdown).toContain(`${result.sourceStats.width} x ${result.sourceStats.height}`);
    expect(markdown).toContain(result.sourceStats.sha256);
    expect(markdown).toContain(`${result.recommended.percentReduction.toFixed(1)}%`);
    expect(markdown).toContain("Rollback steps");
    expect(markdown).toContain("main.js");
  });
});
