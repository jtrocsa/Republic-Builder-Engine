import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, walkToHubNpc } from "./helpers/progress-seed.js";

// **A name belongs to the person it names, and it is drawn above every body.** Two claims, two
// tests, and the second one is measured in pixels because nothing cheaper is honest about it.
//
// Reading `getComputedStyle(plate).zIndex` back would pass on a stylesheet that says 85 and a page
// that draws 28 — a stacking context in a parent, a later `!important`, an `isolation: isolate` on
// some ancestor — and it would restate the rule rather than observe it, which is the line `0093`
// drew for the dev probes. Hit-testing is no better: `elementFromPoint` respects `pointer-events`,
// and the two things most likely to be drawn over a name are the player, which is
// `pointer-events: none` on purpose, and the plate itself, which is `none` for the same reason. It
// would answer about clicks and be read as an answer about paint.
//
// So the layer test renders the patch of screen where a body and a name overlap **four times** —
// both layers, the name alone, the body alone, and the bare room with neither — keeps the pixels
// where the name and the body would each paint over that bare room, and asks which of the two
// single-layer renders the composite is nearer on each of them. That is the question in the units it
// has an answer in, and the fourth render is what makes it independent of how much of a sprite
// happens to be transparent where a pill lands.
//
// See `docs/decision-log/0122-a-name-is-not-part-of-the-body.md`.

// Percentage of the contested pixels a name must win. Measured on the escort's arrival: **88.8 with
// the name drawn above the bodies and 17.6 with it drawn below them**, so this sits about a third of
// the way up a five-fold gap.
//
// It is not 100 and it should not be read as one. A pixel the name wins is 96% pill and 4% of
// whatever body is behind it, because the pill's background is `rgba(4, 31, 43, 0.96)` — and the
// Institute's dark teal is close enough to the player's dark navy coat that on the pill's
// antialiased border the composite can land nearer the body than the name. Those edges are the whole
// of the missing 11.
//
// The file's first draft asked a cheaper question — how much of the patch changed when the bodies
// were hidden — and got 11.8 against 29.3, two and a half apart, because a sprite is mostly
// transparent and a body drawn over a name only repaints the narrow part of it that is actually a
// body. A threshold in that gap would have been a guess.
const MUST_WIN = 60;

// Every body on either surface, and nothing that names one. Written as ids and data attributes on
// purpose: `.hub-npc` would take the nameplates with it, because a plate wears its body's class list.
const BODIES = "[data-hub-npc], #institutePlayer, [data-npc], #caseFieldPlayer";
const NAMES = "[data-cast-label]";

/**
 * The patch of screen where somebody else's body most covers a name, or null.
 *
 * Geometry only — this says where to look, never what the answer is. An overlap is the *opportunity*
 * for the defect; the pixels are the defect. The clip is the intersection rather than the whole pill
 * because that is the only region where the question has an answer: outside it nothing is contested.
 */
function coveredName(page) {
  return page.evaluate(() => {
    const rect = (el) => el.getBoundingClientRect();
    const bodies = [...document.querySelectorAll("[data-hub-npc], [data-npc]")]
      .map((el) => ({
        id: el.dataset.hubNpc || el.dataset.npc,
        box: rect(el.querySelector(".character-sprite")),
      }))
      .filter((body) => body.box.width > 0);
    for (const id of ["institutePlayer", "caseFieldPlayer"]) {
      const sprite = document.getElementById(id)?.querySelector(".character-sprite");
      if (sprite) bodies.push({ id: "player", box: rect(sprite) });
    }
    let worst = null;
    for (const plate of document.querySelectorAll("[data-cast-label]")) {
      const pill = plate.querySelector("span");
      if (!pill) continue;
      const box = rect(pill);
      for (const body of bodies) {
        if (body.id === plate.dataset.castLabel) continue;
        const width = Math.min(box.right, body.box.right) - Math.max(box.left, body.box.left);
        const height = Math.min(box.bottom, body.box.bottom) - Math.max(box.top, body.box.top);
        if (width <= 0 || height <= 0) continue;
        const area = width * height;
        if (area > (worst?.area ?? 0)) {
          worst = {
            name: plate.dataset.castLabel,
            by: body.id,
            area: Math.round(area),
            clip: {
              x: Math.max(box.left, body.box.left),
              y: Math.max(box.top, body.box.top),
              width,
              height,
            },
          };
        }
      }
    }
    return worst;
  });
}

/** One screenshot of `clip`, optionally with a selector hidden for the duration. */
async function shot(page, clip, hidden) {
  const style = hidden
    ? await page.addStyleTag({ content: hidden + " { visibility: hidden !important; }" })
    : null;
  const png = (await page.screenshot({ clip })).toString("base64");
  if (style) await style.evaluate((el) => el.remove());
  return png;
}

/**
 * Of the pixels where the name and the body disagree, the share the name wins — which is the
 * question, asked in the only units it has an answer in.
 *
 * Four renders of the same patch: both layers, the name alone, the body alone, and the bare room
 * with neither. A pixel is *contested* only where the name and the body would each paint over the
 * bare room — which is what makes the reading independent of how much of a sprite happens to be
 * transparent where a pill lands, and the reason the empty render is worth a fourth screenshot. On
 * those pixels the name wins if the composite is nearer the name-alone render than the body-alone one.
 */
async function nameWinsContest(page, clip) {
  const both = await shot(page, clip, null);
  const nameOnly = await shot(page, clip, BODIES);
  const bodyOnly = await shot(page, clip, NAMES);
  const neither = await shot(page, clip, BODIES + ", " + NAMES);
  return page.evaluate(
    async ([a, b, c, d]) => {
      const load = (data) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = "data:image/png;base64," + data;
        });
      const images = await Promise.all([a, b, c, d].map(load));
      const canvas = document.createElement("canvas");
      canvas.width = images[0].width;
      canvas.height = images[0].height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const pixels = images.map((image) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      });
      const apart = (x, y, i) =>
        Math.abs(x[i] - y[i]) + Math.abs(x[i + 1] - y[i + 1]) + Math.abs(x[i + 2] - y[i + 2]);
      let contested = 0;
      let won = 0;
      for (let i = 0; i < pixels[0].length; i += 4) {
        // Contested only where both layers actually paint something here. Without the bare-room
        // render this counted every pixel of the pill that happened to fall on the transparent part of
        // a sprite — pixels no body was ever contesting — and a total occlusion still read as 75% won.
        if (apart(pixels[1], pixels[3], i) <= 24) continue;
        if (apart(pixels[2], pixels[3], i) <= 24) continue;
        contested += 1;
        // **Nearest of the two, not "equal to one of them".** The pill's background is 96% opaque, so
        // a pixel the name wins is 96% pill and 4% of whatever body is behind it — near the name-only
        // render but not identical to it, and a fixed tolerance for that is a number to be argued over
        // rather than a fact. Asking which of the two renders the composite is closer to needs no such
        // number: on a pixel the name wins the answer is 4% of one difference against 96% of another.
        if (apart(pixels[0], pixels[1], i) < apart(pixels[0], pixels[2], i)) won += 1;
      }
      return { contested, won: contested ? +((100 * won) / contested).toFixed(1) : null };
    },
    [both, nameOnly, bodyOnly, neither]
  );
}

/** How far below its body's anchor each name on this surface hangs, in CSS pixels. */
function labelDrops(page) {
  return page.evaluate(() => {
    const drops = {};
    for (const plate of document.querySelectorAll("[data-cast-label]")) {
      const pill = plate.querySelector("span");
      if (!pill) continue;
      // The plate's box is centred on the body's anchor by its own transform, so half its height
      // *is* the anchor. Measured off the rendered boxes rather than off the declaration, which is
      // the point: the defect this replaced was a declaration that read correctly and resolved wrong.
      const box = plate.getBoundingClientRect();
      drops[plate.dataset.castLabel] =
        Math.round((pill.getBoundingClientRect().top - (box.top + box.height / 2)) * 10) / 10;
    }
    return drops;
  });
}

test.describe("Nameplates", () => {
  // **The regression the phase was named for.** `--cast-foot` is a per-surface number — 0.58 of a
  // tile in the field, where the sprite is drawn low in a 55x79 button, and 0.19 in the Institute,
  // where it is drawn in a 48x56 one — and a name is meant to hang 8px under the feet on both. It
  // was written as one `--cast-label-top` at `:root`, and **a custom property substitutes where it
  // is declared, not where it is used**: `var(--cast-foot)` inside it resolved once against
  // `:root`'s 0.58 and every surface inherited that number. `.hub-npc`'s override changed nothing
  // for the whole of Phases 62–123, and the comment above it claimed the opposite in as many words.
  //
  // What that looked like: every name in the Institute hung 26.7px — over half a tile — below the
  // person it named, out on the open floor, close enough to the next row that Dr Soto's landed on
  // the face of whoever walked the aisle under her.
  const DROPS = [
    ["Institute main hall", { currentScreen: "institute", currentHubRoom: "main" }, 17.1],
    ["Institute entrance hall", { currentScreen: "institute", currentHubRoom: "hallway" }, 17.1],
    [
      "Caribbean",
      { currentScreen: "field", activeCaseId: "case-001", selectedCaseId: "case-001" },
      35.8,
    ],
  ];
  for (const [name, seed, expected] of DROPS) {
    test(`${name}: every name hangs 8px under its own surface's feet (regression)`, async ({
      page,
    }) => {
      await seedProgress(page, {
        ...seed,
        tutorial: { step: "complete", completed: true, skipped: false },
      });
      await loadSeededSave(page);
      await page.waitForTimeout(700);
      const drops = await labelDrops(page);
      // Anti-vacuity. An empty object satisfies every assertion below it.
      expect(Object.keys(drops).length, `${name} has a cast wearing names`).toBeGreaterThan(0);
      for (const [id, drop] of Object.entries(drops)) {
        expect(drop, `${name}: ${id}'s name hangs ${drop}px below the anchor`).toBeCloseTo(
          expected,
          0
        );
      }
    });
  }

  test("a body standing on a name does not repaint it (regression)", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "hallway",
      tutorial: { step: "hallway" },
      profile: { name: "Test Player", appearance: "a" },
    });
    await loadSeededSave(page);
    await expect(page.locator("#instituteMap")).toBeVisible();
    await page.waitForTimeout(500);
    expect(await walkToHubNpc(page, "director"), "reached the Director").toBe(true);
    await page.keyboard.press("e");

    // **Driven by the state, not by a count of beats.** The escort parks the player a gap behind the
    // Director, which is squarely on his name — the same arrival the owner was watching when they
    // reported the walk cycle in Phase 122. Waiting for the overlap rather than for beat N means
    // this still finds it if the script gains or loses a line.
    let covered = null;
    for (let beat = 0; beat < 16 && (covered?.area ?? 0) < 400; beat += 1) {
      const indicator = page.locator("#hubSceneIndicator");
      if (await indicator.isVisible().catch(() => false)) {
        await page.locator(".hallway-dialogue").dispatchEvent("click");
      }
      await page.waitForTimeout(320);
      covered = await coveredName(page);
    }

    // Anti-vacuity, and it is the whole point of the file: a run in which nobody ever stood on a
    // name would have measured a name nobody was standing on, and passed.
    expect(
      covered?.area ?? 0,
      "the escort parks the player on the Director's name — without that overlap this measures nothing"
    ).toBeGreaterThanOrEqual(400);
    const contest = await nameWinsContest(page, covered.clip);
    // Second anti-vacuity gate. A patch where the name and the body never disagree — a pill drawn
    // over the transparent half of a sprite, say — has nothing to award, and 0 of 0 must not read
    // as a pass.
    expect(
      contest.contested,
      `"${covered.name}" and ${covered.by} contest too little of that patch to judge it`
    ).toBeGreaterThan(200);
    expect(
      contest.won,
      `"${covered.name}" is drawn under ${covered.by} — its name loses the pixels they contest`
    ).toBeGreaterThanOrEqual(MUST_WIN);
  });
});
