# Character cast spec

**Status:** ready to execute, blocked on PixelLab credit. Everything in this document that does
not cost a generation has already been done (see "Already landed" below).

This is the shopping list and the parameter sheet for regenerating Chronicle's character art as
one coherent pixel-art cast. It exists so that, the moment the PixelLab subscription is topped
up, generation is mechanical rather than a fresh round of design decisions.

## The problem being fixed

The cast is currently **four art styles at five native resolutions**:

| Group | Files | Native size | Style |
|---|---|---|---|
| Player walk (Chronicler A/B) | 12 | 64×96 | flat blocky shapes, no outline |
| Player preview portraits | 2 | 96×128 | flat |
| Field NPCs (6 sets) | 24 | 96×144 | thick dark outline, vector-looking |
| Institute NPCs — Amani, Julian | 6 | 33×57 / 33×56 | flat shapes |
| Institute NPC — **Director Hale** | 3 | 28×44 | genuine shaded pixel art |

Only the Director is real pixel art, and he is the smallest and most detailed asset in the game.
He is also the target: "make the characters more like the Director."

A second, worse problem: **18 field NPCs share 6 sprite sets across three periods.** Unit 2 and
Unit 3 both reuse Unit 1's Taíno and Spanish art wholesale, which is why Philadelphia's town
crier is drawn as Christopher Columbus and a colonial farmwife as a Taíno gardener. This is not
a polish issue; it is a content-accuracy issue in a history game.

## Already landed (no generations spent)

- **NPCs no longer render blurred.** `.field-npc .npc-frame` and `.hub-npc img` were both forced
  to `image-rendering: auto !important`, so every NPC rendered bilinear-smoothed while the player
  beside them rendered nearest-neighbour. Both are now `pixelated`.
- **`npm run assets:normalize-sprites`** (`scripts/assets/normalize-sprite-frames.js`) is
  committed. The equivalent script from the last Director swap was explicitly *not* committed,
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
direction**, so a walk cycle in three directions triples a character's cost. Budget accordingly:

| Scope | Generations |
|---|---:|
| 22 characters, idle poses only | ~22 |
| …plus walk cycles in 3 directions each | ~88 |

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

| id | description |
|---|---|
| `chronicler-a` | Young field researcher in a modern canvas field jacket over a plain shirt, satchel across the body, short dark hair, practical boots. Neutral, capable, unremarkable — the player is the observer, not the spectacle. |
| `chronicler-b` | Same role and silhouette weight, different reading: longer light hair tied back, olive utility vest over a henley, same satchel. |

### Institute — 3 characters (`assets/institute/`)

| id | file stem | description |
|---|---|---|
| `director` | `director-rowan-hale` | **Already correct — do not regenerate.** Field-adventurer look: fedora, leather jacket, revolver at the hip. This is the style anchor. |
| `amani` | `researcher-amani-soto` | Archive researcher, 30s, dark coiled hair tied up, wire-rim glasses, cardigan over a collared shirt, holding a slim document folder. Scholarly, warm. |
| `julian` | `professor-julian-park` | Route historian, 50s, greying hair, tweed jacket with elbow patches, waistcoat, rolled chart under one arm. |

### Unit 1 · Caribbean, 1492 — 6 characters

Existing sprite keys (`assets/chronicle-sprites/field/npc-*.png`). These are the only field NPCs
whose art already matches their role.

| sprite key | description |
|---|---|
| `taino-elder` | Taíno community elder, older, dignified bearing, cotton *nagua* wrap, shell and gold *guanín* pendant, hair in a traditional cut. Depict with the same care and specificity as the European figures — no generic "tribal" shorthand. |
| `taino-gardener` | Taíno cultivator working a conuco, wrapped cotton skirt, digging stick, woven carrying basket on one hip. |
| `taino-fisher` | Taíno canoe worker, coiled fishing line and net over the shoulder, paddle in hand. |
| `spanish-sailor` | Castilian common seaman, 1492: loose linen shirt, wide slops, knitted cap, bare feet, rope coil. |
| `columbus` | Christopher Columbus as a ship's captain: dark doublet, short cape, flat velvet cap, holding a rolled chart. Authority, not heroism. |
| `spanish-scribe` | Ship's scribe/notary, dark scholar's robe, portable writing desk slung at the waist, quill. |

### Unit 2 · Riverbend Settlement, 1620s — 6 characters *(new art)*

These currently reuse Unit 1 sprites. New keys: `npc-<id>.png` etc.

| npc id | description |
|---|---|
| `settlement-minister` | Puritan minister, black doublet and white falling band collar, tall crowned hat, Bible under one arm. |
| `indentured-servant` | Indentured field servant, coarse undyed linen shirt and breeches, worn and patched, bare-headed, hoe in hand. |
| `settlement-burgess` | Elected burgess, better-cut dark wool doublet, modest lace at the cuffs, rolled petition. |
| `settlement-goodwife` | Settlement goodwife, plain long gown, white coif and apron, wooden pail. |
| `river-fisher` | River fisher, oiled canvas smock, netting needle, creel basket. |
| `wharf-clerk` | Wharf clerk, ink-stained fingers, dark jerkin, ledger book open in the crook of one arm. |

### Unit 3 · Philadelphia, 1770s — 6 characters *(new art)*

| npc id | description |
|---|---|
| `printer-apprentice` | Printer's apprentice, ink-blackened leather apron over shirtsleeves, rolled broadside, hair tied back. |
| `town-crier` | Town crier, tricorn hat, blue coat with brass buttons, hand bell raised. |
| `militia-recruiter` | Colonial militia recruiter, hunting frock over civilian breeches, cartridge box, no regular uniform. |
| `free-tradesman` | Free Black tradesman in Philadelphia, well-kept brown coat and waistcoat, tradesman's tools at the belt, reading a broadside. Depict as a self-possessed citizen of the city — this character's whole narrative function is that he is reading the same revolutionary rhetoric as everyone else. |
| `loyalist-merchant` | Loyalist merchant, fine claret coat, powdered wig, silver-topped cane, ledger. |
| `farmwife` | Farmwife in from the country, practical short gown and petticoat, straw hat, market basket. |

### Map object — 1 generation

| id | tool | description |
|---|---|---|
| `statehouse` | `create_map_object` | Georgian/Federal columned civic building, top-down, red brick with white portico, pediment and cupola. This is the registered `architecture.plantation.greatHouse` gap — **no pack in the library contains American columned civic architecture**, and the Philadelphia map currently composites a stand-in from Medieval Fantasy Town's steps-and-archway. Save as a whole number of 48px tiles into `assets/tilesets/Common Cause Philadelphia/`. |

## Procedure per character

1. `create_character` with the parameters above.
2. `get_character` to fetch the `south`, `north` and `east` rotation URLs.
3. Download the three PNGs to the character's target filenames (`-down`, `-up`, `-side`).
4. **Run `npm run assets:normalize-sprites -- --in-place <all frames for that character>`.** This
   is not optional: PixelLab bakes ~40% transparent padding into every export, and without
   normalization the character renders visibly smaller than its neighbours inside the shared
   `object-fit: contain` box — the exact bug the previous Director swap had to hot-fix.
5. If a walk cycle was generated, save the step frames as `-step` and include them in the same
   normalize invocation so idle and step share a canvas.
6. Check `npm run test` and the Playwright visual baselines.

## Constraints

- **Do not regenerate the Director.** He is the reference.
- Keep every filename and registry key. `fieldNpcSprites` / `instituteNpcSprites` /
  `fieldSpriteAssets` in `main.js` are keyed by string and must not need editing.
- `scripts/assets/audit.js` enforces a 50 KB per-file budget for `chronicle-sprites`. Current
  files are 240 B – 2.5 KB, so there is ample headroom, but higher-fidelity art should still be
  checked against it.
- Field NPCs have no `up` pose today and hub NPCs have no `up` or down-`step`; `main.js`'s
  resolvers fall back around both gaps. Since 8 rotations arrive per generation anyway, fill them.
