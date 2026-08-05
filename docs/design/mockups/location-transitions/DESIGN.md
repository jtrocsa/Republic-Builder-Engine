# Location transitions — design spec

Status: **mockup, not built.** This documents the settled look and rules for the arrival screen so
that folding it into `main.js` later is execution, not design. Nothing here is wired into the game
yet; see §7 for the integration seam.

---

## 1. What it is and when it fires

A short, warm "you have arrived" screen — a stylized image of where you're going, light geometric
framing, and a circular **Syncing** loader that fills, then resolves to **Synced** and a "press to
enter" prompt.

Diegetically it is the record catching up to where the Chronicler is: consistent with Chronicle's
frame (Chronotravel to a setting, then preserving/transmitting the record). Keep that reading — the
loader is *the record syncing*, never a generic "Loading…".

**Fires on:**

- A **warp / Chronotravel** to a field map (from the Navigation Table).
- **Entering a new building** — the Institute, or a settlement's hall.

**Does not fire on:**

- **Room-to-room inside one building.** Field interiors are deliberately seamless (they swap on
  `progress.currentFieldRoom` with no screen change); a transition screen there would break that.
  The boundary is *building → building* or *world → world*, not *room → room*.

## 2. Layer anatomy

All layers are children of `.screen`, stacked by `z-index`. Motion that represents **light or water
must sit above the darkening layers** or the scrim/vignette crushes it — this was the single biggest
bug in the mockup's history.

| Layer                       | z | Role                                                                    |
| --------------------------- | - | ----------------------------------------------------------------------- |
| `.scene-img`                | 0 | The painting. Slow `breathe` (Ken-Burns) drift.                         |
| `.vignette`                 | 1 | Edges fade into navy so the frame isn't a hard photo.                   |
| `.scrim`                    | 2 | Directional darkening for text legibility (heavier on the text side).   |
| **scene-fx** (`.cb-fx`, `.ar-flicker`, `.ar-beams`) | 3 | **Contextual motion — above the scrim.** Toggled per scene. |
| `#spray` (canvas)           | 4 | Particles: dust motes, surf sparkle.                                    |
| `.ticks`                    | 5 | Geometric frame — corner ticks, a slow rotating tick-ring.              |
| `.overlay` / `.ov-bottom`   | 6–7 | Text (eyebrow, title, meta, goal, question) + loader + enter prompt.  |

Scene layers are shown per destination via `.screen[data-scene="<id>"] .<layer> { display: block }`.

## 3. Per-destination config (`DEST`)

Each destination is one object. This is the whole content surface:

| Field     | Meaning                                                             |
| --------- | ------------------------------------------------------------------ |
| `eyebrow` | Tiny top label — `Entering` (building) or `Chronotravel` (warp).   |
| `kicker`  | Line above the title — the org, or `Case 1.01 · …`.                |
| `title`   | The destination name (the hero line).                              |
| `meta`    | Place · date — `Caribbean · 1493`, `Present day · Navigation Table`. |
| `goal`    | Orienting "what you'll do" line. Normally `null` — see the one-statement rule below. |
| `q`       | The central question — the single body statement on a warp card, or `null`.        |
| `sync`    | Loader label — `Syncing archive`, `Syncing record`.                |
| `enter`   | Prompt — `Press E to enter`, `Follow the evidence`.                |
| `scene`   | The scene id (drives the art `<img>` and the `data-scene` toggles). |

**One body statement per card.** A warp card shows exactly one line under the title/meta: the central
question (`q`). The earlier task-briefing `goal` paragraph was dropped — stacking a "what you'll do"
goal *and* the question was too much text, and the two said the same thing (each case's goal already
ends on the same stakes the question asks). The in-world Mission Tracker briefs the actual tasks, so
the arrival screen doesn't. `goal` stays in the schema (rendered above `q` when set) for a future card
where a concrete orienting line beats an abstract question, but the shipped warp cards leave it `null`.
A building card (the Archive) has neither and leans on title + meta alone.

In the game these come from real content, not literals — see §7.

## 4. The Syncing loader

- A ring fills over ~2.4s (eased), with a live `%` readout; the `sync` label **wraps inside the
  circle** (two short lines, never spilling out the sides).
- On completion it reads **`Synced`** — teal, **no checkmark** — and the enter prompt appears.
- **Reduced motion:** paints straight to 100% / `Synced`, no animation.

## 5. Contextual motion — the core rule

> Effects must be **native to each specific painting**, not a generic layer dropped on top. Pick the
> one or two things that would actually move in *that* place and animate *those*.

Generic floating particles on everything, or a lit rectangle laid over water, both read as fake. The
two shipped treatments are the reference patterns:

**Interior / light scene — the Archive.** Warm glow at the actual windows (`radial-gradient`s at the
window positions, gently flickering) + soft blurred light `.beam`s at the real incidence angle +
**sparse dust confined to the light** (`#spray` canvas, `ARCHIVE_ZONES` aligned to the beams). Dust
lives only where light is; it never falls like snow across the whole frame.

**Exterior / water scene — the Caribbean.** The **painted water's own pixels ripple** —
`feTurbulence` + `feDisplacementMap` in an SVG, driven by SMIL, warping the image inside **soft
radial masks over a few water spots** (the rocks, two stretches of surf), plus a handful of specular
sparkles on the surf. Deliberately **not** the whole bay (that warped the docks and left a seam at
the beach) and **not** generic particles.

### Choosing motion for a new map

Ask what physically moves there, then animate only that — e.g. a forge's heat-shimmer and embers, a
canal's water, a flag, lamplight, dust in a mill shaft. Keep it subtle ("the image doesn't need to
be fully moving"), keep it above the scrim, and give it a reduced-motion off switch.

## 6. Motion techniques (and their gotchas)

| Technique                                   | Use for                        | Gotcha                                                                 |
| ------------------------------------------- | ------------------------------ | --------------------------------------------------------------------- |
| CSS keyframes (`breathe`, drift, flicker)   | glows, breathing, slow drift   | Visible in stills. Simplest; reach for this first.                     |
| SVG `feTurbulence` + `feDisplacementMap` (SMIL) | making *painted* water/heat/flags actually move | Warps real pixels. Pause for reduced motion via `svg.pauseAnimations()` — CSS `animation:none` can't stop SMIL. |
| Canvas particles (rAF)                      | dust, sparkle, embers          | Confine to zones or it looks like weather. rAF is suspended in the preview pane (verify by pumping the draw fn). |

## 7. Integration path into the game

This is a mockup on purpose. When it's built for real:

- **It's a transient overlay on existing transitions, not a new world.** The warp already routes
  through the `travel` screen; entering the Institute routes to the `institute` screen. The arrival
  screen plays over/into those boundaries. It must **not** touch the world transform — the camera
  stays a pure function of player position; this is chrome on top, shown while control is locked
  (reuse the one input-lock discipline, don't invent a second).
- **Fire it on building→building / world→world only** — gate on the warp and on outdoor→Institute
  (and outdoor→settlement-hall) boundaries, never on a `currentFieldRoom` room-to-room swap.
- **Copy from content, not literals.** The mockup hardcodes case-001's real strings; the game reads
  them so it stays rename-aware — title via `resolvedCaseName()`/`resolvedCaseTitle()`, the case
  number via `caseNumberLabel()`, the goal/question from the case content. `sync`/`enter` are the
  only genuinely new strings and belong with the transition config.
- **Art moves to the assets pipeline.** Drop the inline-base64 approach; reference paintings like
  every other asset (`new URL('../assets/…', import.meta.url)`), keep them optimized.
- **Motion becomes one small reusable piece**, not copy-pasted per screen: the CSS layer set, one
  SVG-filter helper for water/heat, and the canvas spray, parameterized per scene. An engine layer
  holds no APUSH facts — the painting and its `DEST` config are content.
- **Reduced motion** flows from `prefersReducedMotion()`, matching every other animated surface.

Deliberately **out of scope** until then: no new screen scaffolding, no persistence fields, no
content-schema changes. Lock the look here first.
