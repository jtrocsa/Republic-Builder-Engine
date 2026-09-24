# 0152 — The box the balance could not buy

**Phase 153 · 2026-09-24 · Accepted**

Unit 9's two registered art gaps — `prop.archive.recordCarton` and `prop.archive.microfilmReader` —
closed into `derived/campus-archive.png`, five objects. Nothing was bought. They were **modelled in
Blender and rendered to pixel art** by a pipeline this phase adds, and it is the first commission in
the library that no generator touched. No engine changed, no content changed, no map is built, and
`main.js` is untouched.

## 1. Why these two, and why now

`0100` §6 registered both objects and bought neither: the PixelLab balance was $16.76 with the
subscription's generations used up, and a two-object commission at Phase 96's hit rate — three rounds
for six accepted objects — was a material fraction of what was left. That was the right call, and it
left both rooms of the unit's last map without the object each room exists for. The processing
room without a record case is an office with a photocopier; the reading room without a reader has no
object for the middle step of the TRACE's paper → film → scan chain.

The repository's owner installed Blender. This phase is the smallest honest test of whether that
changes anything: two registered gaps with written geometry, a spend problem rather than a design
problem, and a pipeline downstream that already accepts a loose commission strip and does not care
where it came from.

## 2. Blender is a build step, not a dependency

Blender is **scripted from the repository and run headless** — `npm run assets:blender -- <job>` runs
`blender --background --factory-startup` on a Python job under `scripts/blender/jobs/`, then
`scripts/assets/pixelize-renders.js` reduces the renders with `sharp`, which was already installed.
So:

- **The models are source.** `campus-archive.py` builds every object from boxes and discs at
  real-world size in metres, from `0100` §3's geometry. It can be read, reviewed and re-run, and the
  `.blend` it saves beside the renders is for looking at, not the record.
- **Nothing enters `package.json`.** The runner finds Blender at `BLENDER_PATH` or the newest install
  under Program Files and fails with a message saying so.
- **What is committed is the strip**, in `tilesets/Chronicle Commissions/`, exactly where a PixelLab
  commission goes. CI, `npm run build` and `assets:pack-objects -- --check` never need Blender.
- **`--factory-startup`** so the owner's own preferences cannot change a render.

A re-render reproduced the strip **byte for byte** on Blender 5.2.2. It is committed anyway, because a
different GPU or Blender version is not promised to, and because that is how every other commission
here works.

## 3. The view the packs draw, and the claim in the plan that was wrong

The office packs draw **oblique**: a front face square-on and undistorted, the top stacked straight
above it, no side faces, no horizontal skew. The plan for this phase said a tilted camera cannot
produce that and the scene would have to be sheared. **That was wrong.** An orthographic camera
pitched down by φ puts a front at `cos φ` and a top at `sin φ` — both straight lines on screen, no
convergence — so the only thing it cannot do by itself is choose the two scales independently.
Stretching depth and height together against width by `FRONT_RATIO · √(1 + r²)`, with
`φ = atan(r)`, makes a front come out at exactly `FRONT_RATIO` of width and a top at exactly `r` of
a front. Nothing is sheared, and lighting stays correct because the normals are real.

The ratio `r` is not one number. **The packs show a low object a deep top and a tall object a shallow
one** — which is what a viewer standing above and in front would see — so each object takes the `r`
of its nearest relative in the pack (§4).

## 4. What was measured

Every constant in `lib/pixel_render.py` and `pixelize-renders.js` came off `office/1`, which is the
sheet both rooms are furnished from. None was chosen by eye first.

| Quantity                | Measured                                                                                                | Used                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Width, px per metre     | fridge 61, counter cabinet 53, desk 64, copier ≈80                                                      | 52 (shelving bay, one tile), 64 (reader)          |
| Front ÷ width           | fridge 0.70, counter cabinet 0.79, desk 0.63, copier 0.63                                               | `FRONT_RATIO` 0.72                                |
| Top ÷ front, per metre  | fridge 0.56, tall cabinet 0.42 · counter cabinet 1.28, desk 0.93                                        | 0.5 tall bay · 0.9–1.0 low objects                |
| Front value ÷ top value | fridge 0.85, counter cabinet 0.70, tall cabinet 0.68, desk 0.65 (luminance)                             | `FRONT_VALUE` 0.70                                |
| Outline                 | edge pixels median luminance 74 (p10 40) against fills of 140–220; brown on wood, blue-grey on metal    | own colour × 0.42, never black                    |
| Alpha                   | **zero** semi-transparent pixels on the whole sheet                                                     | a pixel is ink if half its block is               |
| Panel treatment         | at 12×, a drawer is a dark seam, then a light row just inside it, then a face darkening toward its foot | seam × 0.55, bevel × 1.12, falloff 1.00/0.96/0.92 |

The outline is worth a sentence of its own. PixelLab's commissions outline in near-black — the median
edge luminance of `suburban-tract.png` is 28 — and the office packs do not. These objects stand in
office rooms, so they follow the office packs.

## 5. Two scales, because the packs use two

**Every 1×1 prop in the library fills its tile, whatever the object is** — `INVARIANTS.md`'s _a prop's
size is the pack's opinion_. So the shut, open and stacked cases are not scaled against anything; they
are rendered to 44px wide, the size a one-tile prop is. The shelving bay and the reader are furniture,
and furniture in the office packs is drawn at a scale (53–64 px per metre of width), so they take it:
the bay at 52 comes out one tile wide by two tall, the same footprint as `office/1`'s bookcase, and
the reader's table at 64 is office/1's desk rate.

## 6. The objects

**The record carton is a flip-top document case**, which is what `0100` §3 describes — a grey board box
that stands on a shelf like a book, lid hinged at the back with a flap folding down in front, folders
upright inside. Four states, because `0100` names three and the fourth is the one a room is
built from:

- **shut**, long side to the room, labelled — the record the player reads cites BOX 3;
- **open**, lid thrown back, five folders standing in it with their tabs cut left, centre and right
  in turn and alternate folders a shade darker, so five read as five;
- **stacked**, three lying flat. The first version centred a label on each and **read as a three-drawer
  filing cabinet, handles and all** — the exact object `0100` says is the wrong one. What says "three
  boxes" is each box's own lid edge and a visible stagger, so the labels moved to one end;
- **shelved**, a steel bay of five shelves holding twenty-seven cases ends-out — label and thumb hole
  to the aisle — with shelves not all full, because a processing room is mid-job.

**The microfilm reader** is a beige console on its own table: base, a glass carriage with the lens
above it, the screen housing raked back thirty degrees with a page of text on the screen, and the two
spool arms. The arms are the entire difference from the AV lectern that was its stand-in, so the
reels are drawn slightly larger than life, and **each carries a pale hub, because without one a 9px
dark disc is a loudspeaker** — which is what the first render showed.

## 7. What was not done

- **No map, no room, no palette entry.** Unit 9's two interiors are not built, so there is nowhere to
  put these, and a palette entry with no map is a claim with no reader. The `import.meta.glob` is
  deliberately not registered, as Phase 96's was not: that belongs to the room build. **These objects
  have been seen on a real floor beside real furniture and a real character, and not yet in a room.**
- **No character.** Unit 9's cast is the same balance's other casualty and the obvious next job for
  this pipeline, but a character is the hard case: a 45px body, four directions by nine frames, feet
  on row 49 in every frame, sitting beside 140 hand-drawn-looking sheets. It is gated on passing
  `character-sheet-geometry.test.js` **and** a side-by-side with Director Hale the owner approves. If it
  reads as a different game, that is the answer, and the spend returns to the owner.
- **No runtime 3D.** Blender exports `.glb` headless through the same runner, and showing a model live
  on a screen would need a new runtime library. That is a dependency decision with its own audit entry,
  not something this phase's Blender line in `THIRD-PARTY-TOOLING-AUDIT.md` approves.

## 8. Found on the way, and not fixed here

`pack-objects.js` reads a manifest box as **exclusive** at x2/y2 (`artW = box.x2 - box.x1`).
`reports/_recon/compose-commission.mjs`, which printed Phase 96's boxes, prints them **inclusive**
(`x + w - 1`, `H - 1`). The three commissions before it used an earlier script and are correct —
`canal-crossroads.png` is 102 tall and its boxes end at 102. `suburban-tract.png` is 147 tall and its
six boxes end at 146, so **every Unit 8 house and car was packed one row short at the bottom and one
column short at the right**: the ground-line outline row of each is gone. It is a one-character fix per
box, but it changes `derived/suburban-tract.png` and so Fairmeadow's field art and whatever baselines
photograph it — a separate change, reported rather than slipped in. This phase's script prints
exclusive boxes and says so in its header.

## 9. Verification

- `npm run assets:blender -- campus-archive` renders all five in under ten seconds and pixelizes them;
  a second run reproduced the strip byte for byte.
- `npm run assets:pack-objects` wrote `derived/campus-archive.png` and the `CampusArchive` coordinates
  (three 1×1, a 1×2 bay, a 2×2 reader); every other derived sheet came out unchanged, and `--check` is
  clean.
- `tile-palettes`, `tile-footprints` and `map-tile-integrity`: 234 of 234, including the rule that a
  planned map may only name a registered gap — both Unit 9 entries dropped theirs and name the sheet.
- The scale preview — `reports/blender/campus-archive/campus-archive-scene.png`, regenerated on every
  run — puts the five on `19th Century European City/tile-B-04`'s board floor, which the Building and
  Loan uses, between `office/1`'s counter cabinet, copier and workstation and Director Hale. That
  picture is the acceptance test, and it is the owner's call rather than this phase's.
