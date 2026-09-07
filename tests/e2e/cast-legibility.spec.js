import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave } from "./helpers/progress-seed.js";

// **The one thing about the cast a machine can answer, and the one a pair of eyes provably cannot.**
//
// Every screenshot in `visual-regression.spec.js` hides `[data-npc]` before it fires, because NPCs
// animate on a rAF loop and are never pixel-stable — so no baseline in this repository has ever
// shown a name pill, a character over a prop, or a body standing on furniture. Phase 113 accepted
// that and looked at ten interiors by eye, and `INVARIANTS.md` says in as many words that there
// should not be a clever test here.
//
// Phase 114 swept the eight outdoor maps the same way and found the limit of the method. Riverbend
// posted a watchman at (38.0,7.5). A maple's trunk sits at (36-38,9), and its art is drawn from
// tiles taller than the 48px grid — `tilesForFrame()` anchors an oversized tile by its *bottom*
// edge, so the canopy reaches several rows up from the cell that carries it, and it swallowed him
// whole: 76% of his body and 98% of his name pill. **Looking at the map could not find him,
// because there was nothing on the map to look at.** Three passes over that image missed a man who
// is simply not drawn.
//
// The overlay canvas knows. `.field-world-overlay` holds exactly the art that draws *above* the
// cast, so sampling its alpha under a pill's own box asks the question directly, in the units the
// question is about, with no tile arithmetic and no guess at how far a tileset's art extends.
//
// **Stations only, and that is the honest scope rather than a convenience.** A route or wander NPC
// crosses overlay rows by definition — that is what walking under a tree is — so a sample of one
// at an arbitrary frame reports where it happened to be, not where it was posted. Movers are
// measured and reported here; only stationed bodies are asserted on. The one thing a mover is held
// to is the ground its job covers rather than the frame it was caught on: a wanderer's whole disc,
// checked against the square the game puts the player on.
//
// Thresholds are set from the measurement, not from taste. See decision log `0113`.

const SURFACES = [
  ["Caribbean", "case-001", null],
  ["Riverbend", "case-004", null],
  ["Common Cause", "case-007", null],
  ["Canal Crossroads", "case-010", null],
  ["Richmond", "case-013", null],
  ["Railhead", "case-016", null],
  ["Immigrant Port", "case-019", null],
  ["Fairmeadow", "case-022", null],
  ["Canal print shop", "case-010", "canal-print-shop"],
  ["Canal boarding house", "case-010", "canal-boarding-house"],
  ["Richmond counting room", "case-013", "richmond-counting-room"],
  ["Richmond hospital ward", "case-013", "richmond-hospital-ward"],
  ["Railhead land office", "case-016", "railhead-land-office"],
  ["Railhead telegraph office", "case-016", "railhead-telegraph-office"],
  ["Port inspection hall", "case-019", "immigrant-port-inspection-hall"],
  ["Port inquiry room", "case-019", "immigrant-port-inquiry-room"],
  ["Fairmeadow model house", "case-022", "fairmeadow-model-house"],
  ["Fairmeadow building & loan", "case-022", "fairmeadow-building-and-loan"],
];

// **The Institute's own rooms, added in Phase 120.** This shipped measuring eighteen surfaces, and
// the game has twenty-one — the three it skipped being the ones every session starts in and returns
// to after every mission. They are not a different kind of problem: all three draw their art onto
// the same `.field-world-overlay` canvas this file samples, and the Main Hall paints three tiles on
// it. What was missing was only that `__chronicleCast()` had no hub branch, so there was nothing to
// ask. Five bodies, and no automated check had ever looked at any of them — the hub baselines in
// `visual-regression.spec.js` hide `.hub-npc` before they fire, for the same reason the field ones
// hide `[data-npc]`.
//
// **The Archive Room is deliberately not the twenty-first.** Nobody lives in it — `main.js` returns
// `HUB_NPC_RUNTIME_NONE` for that room and always has — so there is no cast to measure and a row
// here would report "clean" about an empty list. Twenty of twenty-one, and the twenty-first has
// nothing to say.
const HUB_SURFACES = [
  ["Institute main hall", "main"],
  ["Institute entrance hall", "hallway"],
];

// Percentage of the pill's *text* box — the pill inset by its own 4px/6px CSS padding — carrying
// overlay art. Measured across all eighteen surfaces before this number was chosen: the two defects
// Phase 114 fixed read 24.2 and 97.6, and the worst reading that survives review is 2.2, a lamppost
// finial touching the underside of Emery Voss's pill in Richmond, invisible in practice. 8 sits
// three times above the one and three times below the other.
const MAX_TEXT_INK = 8;
// The same, for the 48x56 sprite box. The watchman read 76.1; the highest accepted reading is 31.5,
// the revival preacher standing beside a maple on Canal Crossroads, whose head, body and pill are
// all perfectly clear. This is the "is this person drawn at all" bar, not a tidiness one.
const MAX_BODY_INK = 55;

// The two kinds of surface differ in four selectors and nothing else. Named here rather than
// branched inside `measure()`, so the measurement itself stays one piece of code asking one
// question — the hub is not a special case of it, it is the same case with different ids.
const FIELD_DOM = {
  frame: ".field-viewport",
  player: "#caseFieldPlayer .character-sprite",
  npc: (id) => `.field-npc[data-npc="${id}"]`,
};
const HUB_DOM = {
  frame: "#instituteMap",
  player: "#institutePlayer .character-sprite",
  npc: (id) => `.hub-npc[data-hub-npc="${id}"]`,
};

async function openSurface(page, caseId, room) {
  await seedProgress(page, {
    currentScreen: "field",
    activeCaseId: caseId,
    selectedCaseId: caseId,
    tutorial: { step: "complete", completed: true, skipped: false },
    ...(room ? { currentFieldRoom: room, fieldReturn: { x: 10, y: 10, facing: "down" } } : {}),
  });
  await settle(page, FIELD_DOM);
}

// The tutorial has to read as finished or the Main Hall opens on the Director's escort, which locks
// input and holds the cast where the scene wants them rather than where the table posts them.
async function openHubRoom(page, hubRoom) {
  await seedProgress(page, {
    currentScreen: "institute",
    currentHubRoom: hubRoom,
    tutorial: { step: "complete", completed: true, skipped: false },
  });
  await settle(page, HUB_DOM);
}

async function settle(page, dom) {
  await loadSeededSave(page);
  await expect(page.locator(dom.frame)).toBeVisible();
  // The overlay canvas is sized and painted after an async image load.
  await page.waitForFunction(() => {
    const canvas = document.querySelector(".field-world-overlay");
    return !!canvas && canvas.width > 0;
  });
  await page.waitForTimeout(600);
}

// Reads the surface's cast, then measures each pill and body against the overlay canvas. Positions
// come from the game's own behaviour table (`window.__chronicleCast`, dev-only, gated exactly as
// `__chronicleNav` is), so a stationed body is measured where it was *posted* rather than wherever
// this frame happened to catch it.
async function measure(page, dom = FIELD_DOM) {
  return page.evaluate(
    ({ playerSel, npcSel }) => {
      const TILE = 48;
      const overlay = document.querySelector(".field-world-overlay");
      const ctx = overlay.getContext("2d", { willReadFrequently: true });
      const ob = overlay.getBoundingClientRect();
      // Clamped to the canvas rather than refused at its edge. `getImageData` throws on a box that
      // runs off the surface, and returning null there would silently exempt anybody standing near
      // the frame — a filter over an empty list passes, which is the vacuity this repo keeps paying
      // for. A pill half off the world is measured on the half that is on it.
      const ink = (x, y, w, h) => {
        const left = Math.max(0, Math.round(x));
        const top = Math.max(0, Math.round(y));
        const right = Math.min(overlay.width, Math.round(x + w));
        const bottom = Math.min(overlay.height, Math.round(y + h));
        const width = right - left;
        const height = bottom - top;
        if (width <= 0 || height <= 0) return null;
        const data = ctx.getImageData(left, top, width, height).data;
        let hit = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 8) hit += 1;
        return +((100 * hit) / (width * height)).toFixed(1);
      };
      const playerRect = document.querySelector(playerSel).getBoundingClientRect();
      const player = [
        playerRect.left - ob.left,
        playerRect.top - ob.top,
        playerRect.width,
        playerRect.height,
      ];

      return window.__chronicleCast().map((job) => {
        const el = document.querySelector(npcSel.replace("__ID__", job.id));
        // The pill is a sibling of the body since Phase 123, not a child of it — a name is drawn
        // above every body now, and it could not be while it lived inside one. The plate carries the
        // body's own anchor, so `rel()` below is measuring exactly what it measured before. A body
        // without one is reported here rather than thrown on: this file's whole subject is a
        // measurement that could quietly stop measuring anything.
        const plate = document.querySelector(`[data-cast-label="${job.id}"]`);
        const span = plate?.querySelector("span:not(.character-sprite):not(.cast-shadow)");
        if (!el || !span) return { ...job, missing: true };
        const sprite = el.querySelector(".character-sprite");
        // The element's own inline left/top IS its anchor in canvas pixels, so the pill and sprite
        // boxes can be expressed relative to it and then re-anchored wherever the job's own
        // coordinates say the body belongs.
        const ax = parseFloat(el.style.left);
        const ay = parseFloat(el.style.top);
        const rel = (r) => [r.left - ob.left - ax, r.top - ob.top - ay, r.width, r.height];
        const pill = rel(span.getBoundingClientRect());
        const body = rel(sprite.getBoundingClientRect());
        const px = job.at.x * TILE;
        const py = job.at.y * TILE;
        const overPlayer = (ox, oy) => {
          const left = ox + pill[0];
          const top = oy + pill[1];
          return (
            left < player[0] + player[2] &&
            left + pill[2] > player[0] &&
            top < player[1] + player[3] &&
            top + pill[3] > player[1]
          );
        };
        // A wanderer is held to its whole disc; anything else, to the one point it holds.
        let pillOnSpawn = overPlayer(px, py);
        if (job.kind === "wander" && job.radius) {
          for (let angle = 0; angle < 360 && !pillOnSpawn; angle += 10) {
            const rad = (angle * Math.PI) / 180;
            for (let r = 0.1; r <= job.radius + 1e-9; r += 0.1) {
              if (overPlayer(px + r * Math.cos(rad) * TILE, py + r * Math.sin(rad) * TILE)) {
                pillOnSpawn = true;
                break;
              }
            }
          }
        }
        return {
          ...job,
          text: ink(px + pill[0] + 6, py + pill[1] + 4, pill[2] - 12, pill[3] - 8),
          body: ink(px + body[0], py + body[1], body[2], body[3]),
          pillOnSpawn,
        };
      });
    },
    { playerSel: dom.player, npcSel: dom.npc("__ID__") }
  );
}

test.describe("Cast legibility", () => {
  for (const [name, caseId, room] of SURFACES) {
    test(`${name}: nothing is drawn over a posted body or its name`, async ({ page }) => {
      await openSurface(page, caseId, room);
      const cast = await measure(page);
      expect(cast.length, `${name} has a cast`).toBeGreaterThan(0);
      expect(
        cast.filter((c) => c.missing).map((c) => c.id),
        `${name}: every job has a body and a nameplate on screen`
      ).toEqual([]);

      // "An NPC has a job." Without this the filter below is the very failure this phase wrote up:
      // an NPC missing from `behaviours` would come back as kind "none", skip the ink assertion in
      // silence, and be protected by nothing — a rule kept in a table protecting only what the
      // table contains.
      expect(
        cast.filter((c) => c.kind === "none").map((c) => c.id),
        `${name}: every NPC is seeded with a station, route or wander`
      ).toEqual([]);

      const posted = cast.filter((c) => c.kind === "station");
      const buried = posted.filter(
        (c) => (c.text ?? 0) > MAX_TEXT_INK || (c.body ?? 0) > MAX_BODY_INK
      );
      expect(
        buried.map(
          (c) =>
            `${c.id} "${c.label}" at (${c.at.x},${c.at.y}) — name ${c.text}% / body ${c.body}% under overlay art`
        ),
        `${name}: a posted body and its name must not be painted over`
      ).toEqual([]);

      // The square the game stands the player on before they touch a key. A name pill is wider
      // than a body and hangs below it, so somebody cleared at the body scale can still have their
      // label drawn across the player's head on arrival — which is how Common Cause opened.
      const onSpawn = cast.filter((c) => c.kind !== "route" && c.pillOnSpawn);
      expect(
        onSpawn.map((c) => `${c.id} "${c.label}" (${c.kind}) reaches the spawn`),
        `${name}: no name pill may land on the player's arrival square`
      ).toEqual([]);
    });
  }

  // The same assertions, on the two Institute rooms that have a cast. The spawn clause is dropped
  // rather than adapted: a hub room is entered from three different places depending on what the
  // player just did — the foyer, the Archive Room door, and a recall landing beside the Navigation
  // Table — so "the arrival square" is not one square here, and a claim about one of the three would
  // be a claim picking its own example. `field-map-coordinates.test.js` already holds all three
  // against the cast, by body rather than by pill.
  for (const [name, hubRoom] of HUB_SURFACES) {
    test(`${name}: nothing is drawn over a posted body or its name`, async ({ page }) => {
      await openHubRoom(page, hubRoom);
      const cast = await measure(page, HUB_DOM);
      expect(cast.length, `${name} has a cast`).toBeGreaterThan(0);
      expect(
        cast.filter((c) => c.missing).map((c) => c.id),
        `${name}: every job has a body and a nameplate on screen`
      ).toEqual([]);
      expect(
        cast.filter((c) => c.kind === "none").map((c) => c.id),
        `${name}: every staff member is seeded with a station, route or wander`
      ).toEqual([]);

      const buried = cast
        .filter((c) => c.kind === "station")
        .filter((c) => (c.text ?? 0) > MAX_TEXT_INK || (c.body ?? 0) > MAX_BODY_INK);
      expect(
        buried.map(
          (c) =>
            `${c.id} "${c.label}" at (${c.at.x},${c.at.y}) — name ${c.text}% / body ${c.body}% under overlay art`
        ),
        `${name}: a posted body and its name must not be painted over`
      ).toEqual([]);
    });
  }
});
