# Design mockups

Interactive look-and-feel explorations that are **deliberately not wired into the game**. They exist
to lock a visual style and a set of rules *before* the work is built in `main.js`, so integration is
a matter of following a settled spec instead of designing in production code.

Nothing here is imported by `apps/web/src/main.js`. These are standalone HTML pages reviewed as
**Claude Artifacts**.

## What's here

| Folder / file             | What it explores                                                              |
| ------------------------- | ---------------------------------------------------------------------------- |
| `location-transitions/`   | The "arrival" screen on a warp / entering a new building (Syncing loader). See its `DESIGN.md`. |
| `codex-handover.html`     | The Director-hands-you-the-Codex cutscene beat — self-paced dialogue, animated Codex. |

## Shared rules for any mockup added here

1. **Self-contained when published.** Artifacts run under a strict CSP that blocks every external
   request — no CDN, no external fonts, no remote images. A published page must inline everything.
   Where art is heavy, keep it as separate files in the repo and inline it only at publish time (see
   `location-transitions/inline.mjs` for the pattern). Don't commit the giant inlined output.
2. **On-brand.** Chronicle palette and type only — deep navy, gold/`--gold-soft`, teal accent, warm
   parchment/ink; Cinzel (label) / Spectral (display) / DM Sans (ui) with serif fallbacks. Pull the
   exact tokens from `apps/web/src/styles/global.css`. No generic admin-panel styling.
3. **Respect reduced motion.** Every animated mockup needs a single switch that stills everything,
   driven by `prefers-reduced-motion` and a manual toggle — the same contract the game holds via
   `prefersReducedMotion()`.
4. **Copy comes from real content.** When a mockup shows case/unit text, use the real strings from
   `content/unit-0N-campaign.js`, not invented placeholder copy.

## Verification caveat (read before "it looks static")

The in-app preview browser **suspends `requestAnimationFrame` and SMIL when backgrounded**, so you
often *cannot screenshot canvas or SVG-filter motion* — the still looks frozen even when the live
page moves. Verify motion by reading the animated values directly (`svg.setCurrentTime(t)` then the
element's `animVal`) or by pumping the canvas draw function, and confirm the final result by
**reloading the published artifact**. CSS keyframe motion *is* visible in stills.
