# 0066 — Philadelphia gets a cast

**Phase 82 · 2026-08-15 · Accepted**

Six Revolutionary-era characters generated and built, closing the last placeholder art in the game.
Ranked first in [`THE-MAP-PROGRAM.md`](../design/THE-MAP-PROGRAM.md) §6 and the one item Phase 81F
left standing. No engine changed; `main.js`'s edit is six registry lines and six `sprite:` fields.

---

## The problem

Phase 60 imported a 1492 Caribbean and a 1607 Jamestown cast. Phase 65 imported 1845 and 1864.
Philadelphia sat between the two imports for twenty-two phases wearing borrowed clothes: John
Dickinson in Christopher Columbus's doublet, the town crier as Columbus himself, the farmwife as a
Taíno gardener.

Phase 60 had made that survivable rather than invisible — the six were rebuilt into the same strip
format under `legacy-*` keys of their own, so that upgrading Unit 1's art could never silently
redraw Philadelphia. But it was a holding action, and 81F had just put authored interview questions
in those six mouths.

It was never blocked on work. The account's subscription allowance has been exhausted since Phase
60; credit fallback works and bills at roughly $0.02 a job. Six creates plus twenty-four walk
directions is thirty jobs against $19.40 of credit.

## 1. Colour does the separating, because the map decides which pairs matter

Phase 80b's rule is that a new character is checked against **whoever stands nearest them**, not
against the cast list — which is how a Meridian coat came back reading as Dr. Soto's silhouette
while satisfying every rule written down.

On this map two pairs stand close enough to be read in one glance, and both were designed against:

- **The crier's route passes the recruiter's muster point.** Crimson coat against navy, and only one
  of them wears a tricorne against a cocked hat.
- **The tradesman wanders four tiles from Voss's post.** Both were heading for light-torso-under-
  dark-layer, which is the exact collision. He is white shirtsleeves under a long red waistcoat with
  a wide tan apron; she is cream sleeves under dark leather. The apron's block at the waist is what
  separates the silhouettes, and he is bare-headed where her hair is up.

Everybody else on this map is far enough apart that colour alone carries it: buff-and-black
Dickinson, plum merchant, blue-and-white farmwife — the only skirted silhouette, which does for her
what colour does for the men.

## 2. Two briefs withheld a prop on purpose

The crier's hand bell and the recruiter's musket are the first props anybody would reach for, and
both are the kind that leave the 48×56 canvas — which `canonicalCanvas()` **clips rather than
resizes**, so an oversized prop is cut off mid-object on all eight strips.

The brief asked for the bell held close at the hip and the generator dropped it, which is the right
outcome rather than a miss. The musket was excluded outright and a white cross belt says "under
arms" for nothing.

This is the same rule that took the folding lens off Voss's costume plate in Phase 80b. It is worth
restating because it reads as a limitation and is closer to a style: at 45 pixels of body, a prop
that survives is a small one at the belt, and a silhouette is worth more than an object.

## 3. The merchant is plum because teal belongs to Meridian

The first draft of that brief said teal-blue frock coat. Teal is Meridian's accent colour
([`MERIDIAN-VISUAL-IDENTITY.md`](../art/MERIDIAN-VISUAL-IDENTITY.md) §3), and Voss stands on this
map. A period character carrying the frame's reserved colour is the kind of quiet collision that is
impossible to unpick once it has shipped — the reveal three units later would be arguing against a
merchant nobody remembers.

Caught in the brief rather than in the art, which is the cheap place to catch it.

## 4. The legacy path is gone, not left behind

`LEGACY_CHARACTERS`, `buildLegacy()` and its whole separate route to a sprite sheet, the thirty
built strips, and the twenty-four pre-PixelLab source frames whose only remaining consumer was that
builder.

Removing the builder is the part worth arguing for. It read four hand-authored poses per character,
mirrored east to make west, reused the down art for up, and produced three-column strips where the
rest of the cast has nine — a second, quieter way to make a character sheet, kept alive by six
files. Leaving it in place would have left a future reader to discover that Chronicle has two sprite
pipelines and that one of them builds nothing.

## 5. What verified it, and what could not

- `tests/unit/character-sheet-geometry.test.js` — 233 assertions over the committed PNGs. All six
  land 45–48px of body on the shared 48×56 canvas; one scaled to 0.938 and five at 1.000.
- `tests/e2e/character-directions.spec.js` — the per-case sprite roster, which is an exact
  `toEqual` and therefore the one place changing a map's cast is not additive.
- **By eye in a browser**, which is the only thing that can check cast art at all. Every visual
  baseline hides `[data-npc]` first, so none of them moved and **none of them could have** — a
  green visual-regression run is not evidence about a sprite.

## What this does not do

- **No new engine surface.** Six `CHARACTER_SHEETS` lines, six `sprite:` fields, six manifest
  entries.
- **No idle cycles.** Field NPCs do not declare `idleColumns`; Voss is the exception and remains so.
- **Nothing about Units 6–9's art.** `architecture.indigenous.northAmerican` is still the highest-
  ranked commission and still blocks the railhead — see `THE-MAP-PROGRAM.md` §6, where it now ranks
  first.
