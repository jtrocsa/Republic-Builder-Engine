# The Field Liaison

The player's recurring helper across the whole game, and the one character whose loyalty is not what
it appears to be.

Written in Phase 78 alongside decision log `0061`. **Phase 80 shipped the character** — the
Institute post, both field posts and `progress.story` are real, and `CHRONICLE-CANON.md` §9 has
moved Voss and the name to canonical. See decision log `0063`. Everything about the **reveal**
remains provisional or deferred: the Meridian connection, its placement, and §7's list.

---

## 1. Who they are

**Role:** Field Liaison. **Name:** Emery Voss. **Pronouns:** they/them.

**Presentation: Voss reads as a woman**, decided in Phase 80b when the sprite had to be ordered and
a generator needed a body to draw. This settles how the character _looks_ and nothing else — the
pronouns above are unchanged, and §7's deferred list keeps biography and family exactly where they
were. The separation that mattered was not from the Director but from **Dr. Amani Soto**, who is
also a woman with her hair up in dark clothing and stands in the same room; the costume's cream
upper body is what tells them apart at 48 pixels. See
[`MERIDIAN-VISUAL-IDENTITY.md`](../art/MERIDIAN-VISUAL-IDENTITY.md) §6 for the settled costume.

The name follows the cast's convention — first name plus surname, no title for non-academic staff,
short enough to read in a name pill under a 48-pixel sprite. It sits clear of Rowan Hale, Amani Soto
and Julian Park phonetically, which matters because the Liaison and the Director share scenes and
their names are spoken aloud in the same conversations.

**The registry key is `liaison`, not the name.** That is deliberate and it is what makes the naming
reversible: the sprite key, the behaviour entry and every `briefing.speaker` string say `liaison`,
so changing "Emery Voss" later is a content edit in one place and not a migration. Gender and
biography are likewise unfixed — the reveal arc constrains neither, and nothing in the art brief
depends on either (see [`MERIDIAN-VISUAL-IDENTITY.md`](../art/MERIDIAN-VISUAL-IDENTITY.md) §6).

## 2. What they are for

The Director is authority: precise, controlled, protective, reluctant to explain uncertainty. That
works, and it leaves a gap — there is nobody in the Institute a player can be _unsure_ in front of.

Voss fills it. They are slightly more experienced than the player, teach practical field procedure
rather than institutional doctrine, are candid about what Chronicle does not know, and are willing
to question policy without sounding disloyal. They demonstrate competence through action, never
through a biography speech.

Concretely, they:

- hand off missions and explain field procedure;
- give contextual advice during a map;
- respond to what the player actually found rather than to a script;
- notice historical suffering out loud, which the Director does not.

## 3. The reveal, and what it must not be

> **Emery Voss has been working with Meridian.**

The failure mode is making this mean the friendship was a lie. It was not, and the writing has to
carry that:

- They genuinely care about the player.
- They genuinely made the player a better investigator.
- They believe Chronicle is concealing evidence — and they are **right** (`CHRONICLE-CANON.md` §5).
- They believe some historical suffering could have been prevented.
- They cooperated with Meridian's humanitarian interventions, and would again.
- They become genuinely disturbed as Meridian starts taking private clients.

The emotional weight comes from the relationship having been real. A Liaison who turns out to have
been performing is a cheaper character and a worse argument — the player should finish the game
unable to say cleanly that Voss was wrong.

**They are also not simply right.** They passed evidence to an organisation that later sold
historical outcomes, and people were affected by interventions they helped make. They should say so.

## 4. Reveal ladder

Pacing across nine units. Each stage is a _floor_ — nothing from a later stage appears earlier.

### Units 1–2 — trusted helper

Teaches systems. Appears at the Institute. Speaks during selected map moments. Encourages careful
investigation. Occasionally expresses sympathy for people in the historical setting. **Never
mentions Meridian**, and carries no visible insignia.

Voss debuts in **Unit 1, strictly after the Entrance Hall escort** — the onboarding sequence,
`hallwayScene`, the tutorial tour and `isHubInputLocked()` are all untouched. Introducing them
before the player has met the Director would flatten the contrast the character exists to create.

### Units 3–4 — inconsistencies

Small, deniable, and visible only on a second pass:

- knows more about a temporal signature than they should;
- arrives before being assigned;
- recognises a piece of Meridian equipment a beat too quickly;
- steers the player away from exactly one clue;
- quietly preserves evidence Chronicle would have sealed;
- shares one visual detail with an unidentified operative the player has seen.

Each should have an innocent reading available at the time. A clue the player can only interpret one
way is not a clue, it is the reveal arriving early.

### Units 5–6 — the reveal

The player finds Voss using Meridian equipment or wearing the insignia. They explain Meridian as a
response to Chronicle's secrecy and refusal to act. They do not ask the player to approve of
everything Meridian has done. The player learns selected evidence has been going to Meridian for
some time. The relationship is damaged and not ended.

### Units 7–8 — reluctant alliance

Meridian's client-funded manipulation becomes undeniable. Voss opposes the faction treating history
as a paid service. Chronicle still will not release its own concealed evidence. Voss and the player
work against a Meridian operation while disagreeing about what should follow.

### Unit 9 — alignment

Voss's ending responds to tracked player behaviour (§5). Candidate outcomes: helps expose both
institutions; returns to Meridian's humanitarian faction; submits to Chronicle custody but releases
the evidence first; opposes a player who chose institutional secrecy; becomes a partner in an open
historical record.

**Not a branching tree.** A small number of endings selected by a small number of tracked values —
see below.

## 5. Relationship model — the smallest thing that works

One integer and a flag set. Nothing more.

```js
progress.story = {
  liaisonTrust: 0, // small signed integer, bounded
  // one-shot narrative flags, e.g. sawMeridianMark: true
};
```

Rules that keep this maintainable:

- **`liaisonTrust` is bounded and coarse.** It selects _tone_ and _which acknowledgement line
  plays_, not which scenes exist. A handful of thresholds, not a continuum.
- **Flags are one-shot booleans**, following the shipped `briefed` / `debriefed` pattern: absent on
  old saves, defaulting false through `readProgress()`'s merge, so adding one never invalidates an
  existing save.
- **No dialogue tree.** If a scene needs more than "which of two or three lines", it needs a
  rewrite, not a graph.
- **Nothing gates curriculum.** Trust never changes which history a student sees, what a mission
  asks, or whether a unit can be completed. It changes how a character talks to them.

`progress.story` **shipped in Phase 80**, extending `DEFAULT_PROGRESS` and `readProgress()`'s merge
in the ordinary way. `liaisonTrust` counts debriefed missions and is clamped at `MAX_LIAISON_TRUST`;
three bands (0, 1–2, 3+) select which Institute line plays, via the exported pure `liaisonLine()`.
`flags` is still empty, per the rule above.

## 6. Integration points

The strongest finding of the Phase 78 audit: **Voss can debut without a single new engine system.**

| Need                    | Mechanism                                                                            | Status                                             |
| ----------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Hands off a mission     | `activity.briefing.speaker` — an opaque id the host resolves                         | **Exists.** Authoring a string is the whole change |
| Portrait in a hand-off  | `characterSheet().portrait` — every character already has one                        | **Exists**                                         |
| Stands in the Institute | `HUB_NPC_BEHAVIOURS` entry, `{ kind: "station", at, facing }`                        | **Exists**                                         |
| Appears on a map        | `FIELD_NPC_BEHAVIOURS` for that unit                                                 | **Exists**                                         |
| Speaks in the field     | The existing dialogue bubble                                                         | **Exists**                                         |
| Sprite                  | `CHARACTER_SHEETS.liaison` + a `character-manifest.js` entry                         | Art, Phase 8                                       |
| Revealed costume        | `CHARACTER_SHEETS["liaison-meridian"]` — a second sheet key                          | Art, Phase 11                                      |
| Narrative state         | `progress.story`                                                                     | New, Phase 8                                       |
| Cutscenes               | See [`CUTSCENE-AND-DIALOGUE-CONVENTIONS.md`](./CUTSCENE-AND-DIALOGUE-CONVENTIONS.md) | Phase 9                                            |

Two costume states as **two sheet keys** is the right shape: a sheet key is one registry entry, the
revealed state is a genuinely different set of PNGs, and switching between them is a lookup rather
than a runtime tint. It also keeps the pre-reveal art untouched when the reveal art lands.

Placement caution when posting Voss in the Institute: hub staff are solid, stationed posts feed
`stationedPosts()` into the nav grid as occupied cells, and two characters within interaction reach
of each other are interchangeable to the nearest-interaction sort. Keep them clear of the Director,
of the Archive Room approach lane (columns 11–12), and of the tutorial tour's walked path.

## 7. Deferred

Do not resolve while writing something else: Voss's biography and family; their exact
recruitment by Meridian; whether they knew about the Original Drift before the player; their final
allegiance; and the closing scene. Each has content consequences and each is listed in
`CHRONICLE-CANON.md` §9 as deliberately unwritten.
