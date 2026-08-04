# 0063 — Emery Voss debuts

**Phase 80 · 2026-08-03 · Accepted**

The first content shipped from Phase 78's canon program (`0061`). Builds the Field Liaison
specified in `docs/design/THE-FIELD-LIAISON.md` and nothing else in that document — no reveal, no
Meridian, no plot.

---

## The problem

Phases 72–79 shipped a lot, and the last three of them shipped documents. The Chronicle/Meridian
canon, the Field Liaison, the map narrative structure, the cutscene conventions and Meridian's
visual identity are five design documents with no code behind any of them. Before Phase 80 the
strings `liaison`, `voss` and `meridian` appeared nowhere in `apps/web/src/` except two tile-palette
gap registrations.

`0061`'s audit is what made this the cheap move: **Voss needs no new engine system.**
`activity.briefing.speaker` has resolved a mission-giver by id since Phase 71, every character has a
built portrait, `HUB_NPC_BEHAVIOURS` stations people in the Institute, and `FIELD_NPCS` puts them on
maps. The whole engine surface is one new object on the save.

## 1. Voss displaces nobody

The obvious way to debut a mission-giver is to point an existing `briefing.speaker` at them. Every
one of the six shipped briefings is a period character with a line worth keeping — Columbus refusing
to concede the copy that goes to Castile, the wharf clerk on his two entries, the Taíno child on the
question nobody asks her. Replacing any of those trades a strong in-period voice for a frame
character, which is the trade `MAP-NARRATIVE-STRUCTURE.md` §5 spends its whole section warning
against.

So Voss is a pure addition: one Institute station and one field post per authored map. Nothing that
existed before this phase changed its behaviour.

## 2. `progress.story`, and the one place it moves

```js
story: { liaisonTrust: 0, flags: {} },
```

`liaisonTrust` counts missions the player has **debriefed**, clamped at `MAX_LIAISON_TRUST = 6` —
every mission the two authored units have. Three coarse bands (0, 1–2, 3+) select which of three
Institute lines plays. That is the whole model, and it is deliberately the whole model:
`THE-FIELD-LIAISON.md` §5 asks for one integer and a flag set, and says trust selects tone rather
than which scenes exist.

Written at exactly one site, the `mission-debriefed` branch, guarded on the record's own
pre-existing `debriefed` flag so re-reading a debrief cannot farm it. It touches no unlock, no
badge, no `skillMastery` entry and no Codex record.

`flags` ships **empty**. The temptation was to pre-seed `sawMeridianMark`, which §5's own rule
forbids: a flag goes in when something reads it. An unread flag is a claim about a feature that does
not exist, and it would have shipped in every save.

## 3. Placement cost more than the wiring

Two of the three code changes were found by a guard rather than by review, which is the argument for
the guards.

**The Institute.** The first post, `(14.5, 4.6)` in the north cross-aisle, put the last 0.04 of a
0.5-tall foot box across the reading stool stamped at `(14,5)`. `field-map-coordinates.test.js`
named the stool. Moved to `(14.5, 4.5)`.

**Riverbend.** The first post, `(28.5, 20.0)` by the village spine junction, passed every clearance
check and broke two other people: a station is injected into the nav grid as `occupied`, so blocking
that cell re-planned the goodwife's route straight through the burgess's ground and to within 1.12
tiles of the minister. The rule this makes concrete, and the one worth carrying: **a stationed body
is furniture, so posting one in a corridor moves whoever walks it.** Moved to `(24.0, 17.0)`, in the
open strip north of the dockside stores and off the spine entirely.

**The Caribbean** took three corrections and not one of them was a collision. `(26.0, 21.5)` is two
tiles due west of the spawn, so it walled off one of the four directions a player presses first, and
`character-directions.spec.js` failed on a walk cycle that never started. `(25.5, 19.5)` cleared
every static check and sat in the corridor every walk north to the village uses — it took two
unrelated specs down, and both came back the instant Voss moved. `(31.5, 23.5)` was south-east down
the shore, the one quadrant of that map nothing needs, and passed every check this repository has.

It was still wrong, for a reason nothing looks at: it stood Voss **directly above the palm at
overlay tile `(31, 24)`**. The overlay layer draws over the cast deliberately — that is the depth
illusion — and a name pill hangs _below_ the feet, into exactly that row. So the pill was half
behind fronds. This map has 14 overlay tiles in 2016, and the post found one. Settled at
`(33.5, 23.5)`, two tiles east.

It only surfaced because the pill changed from a role to a name (§6): "Field Liaison" half-covered
reads as scenery, and a half-covered proper noun reads as broken. **A cosmetic fault in a generic
label is a functional one in an identifier.**

Three rules fall out, the first two being the same rule at two scales: **a stationed body is
furniture to the NPCs and a wall to the player** — post one off the spawn's cardinals and out of any
corridor that leads somewhere. And: **clear the overlay layer under the pill, not just the collision
layer under the feet.** Nothing tests the third, because the check is "does this read", and the
`.tmj` overlay array is the place to look.

## 4. The art, and the three creates it took

Voss shipped on a placeholder for exactly one working session — Canal Crossroads' abolitionist
lecturer, chosen because he stands on a map the player does not reach for four units — and Phase 80b
replaced it with `institute/field-liaison-emery-voss` (`d7ba9b23`). Six generations, ≈$0.12.

**Three creates, and the two failures were the costume rather than the pipeline.** Both are recorded
in `character-manifest.js` so neither is adopted by mistake later:

1. `28a13d53` — **dropped the coat entirely.** The prompt asked for a shirt, a leather over-jerkin
   _and_ a coat, and got a waistcoat. **Three garment layers is more than 45 pixels of body can
   hold**; the generator collapses them. The rule for the next character is two.
2. `e9ecca13` — got the coat, and it came out ankle-length and read as **Dr. Soto's silhouette**
   from across the Main Hall.
3. `d7ba9b23` — a short jacket over a pale shirt, satchel strap, teal at the throat, hair in a bun.

**The real constraint was never the one the documents named.** `MERIDIAN-VISUAL-IDENTITY.md` §6
asked for a head and silhouette "clearly distinct from the Director and from both player
appearances" — it never mentioned Amani Soto, who is the one character Voss actually shares a room
with, and who already wears a tall dark full-length coat. Attempt 2 satisfied every written rule and
was unusable for a reason none of them covered. **Check a new character against whoever stands
nearest to them, not against the cast list.**

Going short instead of long separated her from Amani on both axes at once — length and value — and
short jackets walk better, so §6's mid-length rule and the Amani problem have the same answer.

**One tension in the art documents is worth recording because it is not executable as written.** §6
says "design the revealed state first, then cover it up," and `MERIDIAN-ASSET-BRIEF.md` §6 sequences
the insignia first. Neither survives contact with a text-to-sprite generator, which cannot cover
anything up. The way to get the rule's actual benefit — one character rather than two who share a
haircut — is to **write both prompts before ordering either**, and generate only `liaison`. The
Chronicle-facing state carries no insignia, so it does not depend on that deliverable.

**Three pipeline facts learned, all new since the overnight run.** Template animations can be
**queued while the create is still running** (only v3/pro must wait). The bulk download endpoint
answers **423 while any job is in flight**, so a zip that fails to parse means "not ready", not
"broken". And a template animation can **silently drop a direction** — the breathing idle came back
with three of four and needed west re-queued into the existing `animation_group_id`, which is the
same missing-west failure the overnight run saw on `powhatan-woman`.

### Generating the art and shipping it are two steps, and only the first crossed machines

The session that generated Voss left 52 source frames in `reports/pixellab-cache/liaison` — which is
gitignored — and a `character-manifest.js` entry naming `institute/field-liaison-emery-voss`. The
nine sheet PNGs that stem refers to were never built, so the manifest named art the repository did
not contain, and nothing failed: the cache is the build's input, not its output, and no test reads
the manifest. It surfaced only because the sheets are what `CHARACTER_SHEETS` actually loads.

Re-running `build-character-sheets.js` on the other machine was **byte-deterministic** — it rewrote
all 329 files and only the 9 new ones differed. Worth knowing before anyone hesitates to run a
whole-cast build for one character: it is not a re-art of the cast.

### The first field-map sheet with an idle, and the test that caught it

`CHARACTER_SHEETS.liaison` declares `idleColumns: 5`, and Voss is the first character **on a field
map** to do so — the other three idles belong to Institute staff, and `field-map-coordinates` never
looks at a sprite URL. A stationed character draws from `<stem>-idle-<direction>.png`, and
`character-directions.spec.js`'s greedy stem pattern captured the `-idle` along with the name.

So the spec **passed on the placeholder and failed on the real art**, for a reason that had nothing
to do with the art: the borrowed sheet had no idle cycle. The gate fired correctly and pointed at
the wrong thing, which is worth more than it sounds — a pin written against "the placeholder is
still here" tells you the art changed, not whether it is right.

The matcher now strips the suffix rather than excluding it in the pattern. Which cycle is playing at
the sampled frame is a timing question; the claim under test is whose art it is.

## 5. Voss stops being provisional

`CHRONICLE-CANON.md` §9 listed the Field Liaison and the name "Emery Voss" as provisional — "usable
in planning, not yet in shipped content." Shipping them makes that false, so the ledger moves them
to canonical.

What does **not** move: the Meridian connection, the reveal's placement in Units 5–6, and everything
in §9's deferred list — the Original Drift incident, Voss's biography, gender and final allegiance,
the ending. Those are what §9 exists to protect, and none of them is decided by a character standing
in a hall.

The registry key stays `liaison` and not `voss`, per `THE-FIELD-LIAISON.md` §1, so renaming the
character later is a content edit in three strings rather than a save migration.

## 6. The player calls her Emery Voss, and nothing calls her Field Liaison

Voss shipped captioned with her job on all three surfaces: `label: "Field Liaison"` under the
sprite on both maps, and `role: "Field Liaison"` as the hub dialogue's kicker. Both are gone. The
player-facing string is the name, everywhere.

The field pill is the clearer of the two. Every other label on those maps is a role — "Community
elder", "Scribe", "Burgess", "Goodwife" — because they are anonymous period characters the player
meets once and has no name for, and the role is the only useful thing a pill can say. **Voss is the
one person out there the player already knows**, so the same convention applied to her produces the
opposite result: it hides the name and re-labels a companion by function every time she appears.

The hub kicker is a judgement rather than a fix. Rowan Hale, Amani Soto and Julian Park all keep
theirs, and should: they are staff being introduced, and "Director of Field Studies" against "Route
Historian" is exactly the distinction a first meeting needs. Voss is not being introduced after the
first time. `HUB_TARGETS.liaison` is now the only target with no `role`, and the renderer omits the
element instead of printing an empty one — an empty `<p class="kicker">` is a blank line above the
name that reads as a layout bug. `field-liaison.spec.js` asserts the count is zero for that reason.

The comparison that settled it: **a rival in Pokémon is not captioned "Rival" on each appearance.**
Recurring characters are established once and then simply present, and a caption that survives past
its introduction is the game admitting it does not trust the player to remember.

"Field Liaison" remains the internal name — this ADR, `THE-FIELD-LIAISON.md`, `CLAUDE.md`, and the
`liaison` registry key. Nothing about the role changed; only what a screen prints.

This is also what exposed the palm in §3. A generic label half-covered by fronds reads as scenery;
a half-covered proper noun reads as broken. **The naming change did not cause that fault, it made it
legible as one.**

## What this deliberately does not do

- **No reveal art.** `liaison-meridian` is a second sheet key and a later phase.
- **No cutscene, no dialogue tree.** Three Institute lines and one field line per map, selected by
  an integer. `CUTSCENE-AND-DIALOGUE-CONVENTIONS.md` is untouched.
- **No new flag.** See §2.
- **No change to onboarding.** `hallwayScene`, the tutorial tour and `isHubInputLocked()` are all
  untouched — Voss debuts strictly after the Entrance Hall escort, per §4 of the ladder, because
  meeting her before the Director would flatten the contrast she exists to create.
