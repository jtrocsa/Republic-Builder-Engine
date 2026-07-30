# Character cast spec

**Status: executed (Phase 60).** Fifteen characters were generated and are now live — see
[`docs/decision-log/0043-one-cast-one-canvas-four-directions.md`](../decision-log/0043-one-cast-one-canvas-four-directions.md)
for what was decided during the import, and
[`CHARACTER-SPRITESHEET-STANDARD.md`](./CHARACTER-SPRITESHEET-STANDARD.md) for the renderer.

This document is kept as the parameter sheet and the record of what was ordered. **The roster below
is not what the account contains.** It was written for a 22-character cast covering Riverbend as a
1620s Puritan settlement and Philadelphia in the 1770s; what was actually generated is a
15-character cast covering the Caribbean in 1492, Jamestown and Tsenacommacah in 1607-1620, the
Institute, and the two Chroniclers. Philadelphia was never generated, and Unit 3 is frozen on its
placeholder art as a result. The live mapping from character to sprite key lives in
[`scripts/assets/character-manifest.js`](../../scripts/assets/character-manifest.js), which is the
file to trust.

**Account state at import:** subscription quota exhausted (46 generations used of 40), $1.81 credit
remaining. Nothing in the import spent any of it.

## The problem being fixed

The cast is currently **four art styles at five native resolutions**:

| Group                             | Files | Native size   | Style                              |
| --------------------------------- | ----- | ------------- | ---------------------------------- |
| Player walk (Chronicler A/B)      | 12    | 64×96         | flat blocky shapes, no outline     |
| Player preview portraits          | 2     | 96×128        | flat                               |
| Field NPCs (6 sets)               | 24    | 96×144        | thick dark outline, vector-looking |
| Institute NPCs — Amani, Julian    | 6     | 33×57 / 33×56 | flat shapes                        |
| Institute NPC — **Director Hale** | 3     | 28×44         | genuine shaded pixel art           |

Only the Director is real pixel art, and he is the smallest and most detailed asset in the game.
He is also the target: "make the characters more like the Director."

A second, worse problem: **18 field NPCs share 6 sprite sets across three periods.** Unit 2 and
Unit 3 both reuse Unit 1's Taíno and Spanish art wholesale, which is why Philadelphia's town
crier is drawn as Christopher Columbus and a colonial farmwife as a Taíno gardener. This is not
a polish issue; it is a content-accuracy issue in a history game.

## Already landed before the import (no generations spent)

- **NPCs no longer render blurred.** `.field-npc .npc-frame` and `.hub-npc img` were both forced
  to `image-rendering: auto !important`, so every NPC rendered bilinear-smoothed while the player
  beside them rendered nearest-neighbour. Both are now `pixelated`.
- **`npm run assets:normalize-sprites`** (`scripts/assets/normalize-sprite-frames.js`) is
  committed. The equivalent script from the last Director swap was explicitly _not_ committed,
  and per-frame autocropping is what left his three frames at 30×46 / 21×46 / 21×45 — a 1px
  height difference that made his feet drift on every step of the walk flipbook. The new script
  measures a whole pose group together and bottom-aligns every frame on a shared canvas. It has
  been run over all three Institute NPCs.
- **Sprite CSS rescaled** for the 48px field tile (player 46×69 → 55×83, NPCs 46×66 → 55×79).
- `docs/art/CHARACTER-SPRITESHEET-STANDARD.md`'s false "every existing sprite is 48×48" claim is
  corrected.

## Generation parameters

Match the existing Director (`character_id: ddc5c73c-ba31-4f17-8622-5d1f376872dd`, "Director
Hale"), which is the style reference for the whole cast:

```
mode:        "standard"        # 1 generation each; "pro" costs 20-40 and "v3" 2-9
size:        88               # the Director's own size
view:        "low top-down"   # classic 3/4 RPG angle, matches every existing sprite
n_directions: 8
outline:     "single color black outline"
shading:     "detailed shading"
detail:      "high detail"
proportions: {"type": "preset", "name": "heroic"}
```

**Why 8 directions when the game only uses three.** `create_character` returns all 8 rotations
for one generation, and south / north / east map exactly onto the game's `down` / `up` / `side`.
`scaleX(-1)` already mirrors `side` for left-facing, so no west frame is needed. Eight directions
is not waste — it is three poses for the price of one, with five spare.

**Cost.** ~1 generation per character. Template walk animations cost **1 generation per
direction**, so a walk cycle in three directions triples a character's cost. In the event, walk
cycles were generated in **four** directions for fourteen of the fifteen characters — the Powhatan
woman is missing her west cycle, and her west strip is built from mirrored east frames rather than
spending another generation against an exhausted quota. Budget accordingly:

| Scope                                  | Generations |
| -------------------------------------- | ----------: |
| 22 characters, idle poses only         |         ~22 |
| …plus walk cycles in 3 directions each |         ~88 |

If the budget lands between those, skip generated walk cycles: the CSS `hubNpcWalk` keyframe
already animates a translate-bob with **no second art frame**, so a static pose still reads as
walking. Add real cycles later, character by character.

## The roster

22 characters. Filenames and registry keys stay exactly as they are, so `main.js` needs no
changes — both previous Director swaps landed as "same filenames, no code changes".

### Player — 2 characters

`assets/chronicle-sprites/field/chronicler-{a,b}-{down,up,side}-{idle,step}.png`

Deliberately minimal identity: display name plus one of two appearances. No pronouns, wardrobe,
profession or cosmetics — those systems are removed from the design and must not come back.

| id             | description                                                                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chronicler-a` | Young field researcher in a modern canvas field jacket over a plain shirt, satchel across the body, short dark hair, practical boots. Neutral, capable, unremarkable — the player is the observer, not the spectacle. |
| `chronicler-b` | Same role and silhouette weight, different reading: longer light hair tied back, olive utility vest over a henley, same satchel.                                                                                      |

### Institute — 3 characters (`assets/institute/`)

| id         | file stem               | description                                                                                                                                           |
| ---------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `director` | `director-rowan-hale`   | **Already correct — do not regenerate.** Field-adventurer look: fedora, leather jacket, revolver at the hip. This is the style anchor.                |
| `amani`    | `researcher-amani-soto` | Archive researcher, 30s, dark coiled hair tied up, wire-rim glasses, cardigan over a collared shirt, holding a slim document folder. Scholarly, warm. |
| `julian`   | `professor-julian-park` | Route historian, 50s, greying hair, tweed jacket with elbow patches, waistcoat, rolled chart under one arm.                                           |

### Unit 1 · Caribbean, 1492 — 6 characters

Existing sprite keys (`assets/chronicle-sprites/field/npc-*.png`). These are the only field NPCs
whose art already matches their role.

| sprite key       | description                                                                                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `taino-elder`    | Taíno community elder, older, dignified bearing, cotton _nagua_ wrap, shell and gold _guanín_ pendant, hair in a traditional cut. Depict with the same care and specificity as the European figures — no generic "tribal" shorthand. |
| `taino-gardener` | Taíno cultivator working a conuco, wrapped cotton skirt, digging stick, woven carrying basket on one hip.                                                                                                                            |
| `taino-fisher`   | Taíno canoe worker, coiled fishing line and net over the shoulder, paddle in hand.                                                                                                                                                   |
| `spanish-sailor` | Castilian common seaman, 1492: loose linen shirt, wide slops, knitted cap, bare feet, rope coil.                                                                                                                                     |
| `columbus`       | Christopher Columbus as a ship's captain: dark doublet, short cape, flat velvet cap, holding a rolled chart. Authority, not heroism.                                                                                                 |
| `spanish-scribe` | Ship's scribe/notary, dark scholar's robe, portable writing desk slung at the waist, quill.                                                                                                                                          |

### Unit 2 · Riverbend Settlement, 1620s — 6 characters _(new art)_

These currently reuse Unit 1 sprites. New keys: `npc-<id>.png` etc.

| npc id                | description                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| `settlement-minister` | Puritan minister, black doublet and white falling band collar, tall crowned hat, Bible under one arm.         |
| `indentured-servant`  | Indentured field servant, coarse undyed linen shirt and breeches, worn and patched, bare-headed, hoe in hand. |
| `settlement-burgess`  | Elected burgess, better-cut dark wool doublet, modest lace at the cuffs, rolled petition.                     |
| `settlement-goodwife` | Settlement goodwife, plain long gown, white coif and apron, wooden pail.                                      |
| `river-fisher`        | River fisher, oiled canvas smock, netting needle, creel basket.                                               |
| `wharf-clerk`         | Wharf clerk, ink-stained fingers, dark jerkin, ledger book open in the crook of one arm.                      |

### Unit 3 · Philadelphia, 1770s — 6 characters _(new art)_

| npc id               | description                                                                                                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `printer-apprentice` | Printer's apprentice, ink-blackened leather apron over shirtsleeves, rolled broadside, hair tied back.                                                                                                                                                                                           |
| `town-crier`         | Town crier, tricorn hat, blue coat with brass buttons, hand bell raised.                                                                                                                                                                                                                         |
| `militia-recruiter`  | Colonial militia recruiter, hunting frock over civilian breeches, cartridge box, no regular uniform.                                                                                                                                                                                             |
| `free-tradesman`     | Free Black tradesman in Philadelphia, well-kept brown coat and waistcoat, tradesman's tools at the belt, reading a broadside. Depict as a self-possessed citizen of the city — this character's whole narrative function is that he is reading the same revolutionary rhetoric as everyone else. |
| `loyalist-merchant`  | Loyalist merchant, fine claret coat, powdered wig, silver-topped cane, ledger.                                                                                                                                                                                                                   |
| `farmwife`           | Farmwife in from the country, practical short gown and petticoat, straw hat, market basket.                                                                                                                                                                                                      |

### Map object — 1 generation

| id           | tool                | description                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------ | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `statehouse` | `create_map_object` | Georgian/Federal columned civic building, top-down, red brick with white portico, pediment and cupola. This is the registered `architecture.plantation.greatHouse` gap — **no pack in the library contains American columned civic architecture**, and the Philadelphia map currently composites a stand-in from Medieval Fantasy Town's steps-and-archway. Save as a whole number of 48px tiles into `assets/tilesets/Common Cause Philadelphia/`. |

## Procedure per character

Superseded by the build script. Add the character to
[`scripts/assets/character-manifest.js`](../../scripts/assets/character-manifest.js) — id, frame
count, the four walk-animation ids, target file stem — then:

1. `npm run assets:build-characters -- --fetch` — downloads rotations and frames into
   `reports/pixellab-cache/` (gitignored, and skipped for anything already cached).
2. `npm run assets:build-characters -- --measure` — reports each character's crop window, body
   height and scale before anything is written.
3. `npm run assets:build-characters` — crops, normalizes and composites the four strips plus a
   portrait onto the shared 48×56 canvas.
4. `npm run assets:contact-sheet` — writes `reports/assets/character-contact-sheet.png`, the whole
   cast on one ground line with the Director first. Look at it.
5. `npx vitest run tests/unit/character-sheet-geometry.test.js` then `npm run test:e2e`, re-banking
   visual baselines if the cast changed.

`npm run assets:normalize-sprites` is **not** part of this path. It crops each frame to its own
alpha box before bottom-aligning, which is the right fix for a two-pose group and destructive for a
walk cycle: it snaps every frame to a shared bottom and centre, removing the motion. The build
script uses one shared crop window per character instead.

## Constraints

- **Do not regenerate the Director.** He is the reference — the canonical 45px body height is
  measured off him.
- Registry keys live in one place now: `CHARACTER_SHEETS` in `main.js`, keyed by the same strings
  as `character-manifest.js`. Filenames follow `<stem>-{down,up,left,right,portrait}.png`; the
  old `<stem>.png` / `-side` / `-step` convention is gone except in the Unit 3 placeholder
  sources, which the build still composites from.
- `scripts/assets/audit.js` enforces a 50 KB per-file budget for `chronicle-sprites`. Current
  files are 240 B – 2.5 KB, so there is ample headroom, but higher-fidelity art should still be
  checked against it.
- Field NPCs have no `up` pose today and hub NPCs have no `up` or down-`step`; `main.js`'s
  resolvers fall back around both gaps. Since 8 rotations arrive per generation anyway, fill them.
