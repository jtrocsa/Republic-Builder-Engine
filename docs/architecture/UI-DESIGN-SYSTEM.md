# Chronicle UI Design System

Reference for the shared token/primitive layer introduced in Phase 44 (the
"Chronicle Design System" pass). Read this before styling any new
teacher-facing screen — the goal is that new work reuses these tokens and
primitives instead of hand-rolling another one-off card/button/border, which
is exactly how `global.css` grew to 470+ `!important` declarations and 14
independent button implementations before this pass.

## Scope: teacher screens, not gameplay

This design system targets **teacher-facing surfaces**: sign-in/join,
teacher dashboard, mission cards, Manage Content (the mission editor),
grading. It does **not** restyle gameplay screens (`.field-*`, `.hub-*`,
`.quest-*`, `.map-*`, `.director-*` families) — those are regression-prone
(see CLAUDE.md's "Gameplay invariants" section) and have zero e2e coverage
protecting a restyle. Three things *do* apply app-wide because they're
genuinely shared primitives, not screen-specific rules:

- The `:root` token layer (colors, spacing, radius, shadow, etc.)
- The global `:focus-visible` ring
- The `prefers-reduced-motion` umbrella
- The `.btn`/`.kicker`/`.back-link` button and label de-cap (removing
  `text-transform: uppercase` from buttons and back-links; `.kicker`
  itself deliberately keeps its uppercase treatment as an archival eyebrow
  label)

Gameplay screens inherit these because they use the same base classes, but
their own selectors (`.field-npc`, `.hub-shell`, etc.) were not touched.

## Principles

1. **Gold is an accent, not a default.** Reserve it for primary actions,
   selected state, progress, and small decorative details. Ordinary
   borders and dividers use `--c-border-subtle`/`--c-border` (translucent
   blue-gray/cream), not gold. Before this pass, `rgba(239, 204, 122, …)`
   appeared 157 times as an ungoverned literal — if you're tempted to write
   that literal again, use a token instead.
2. **Reuse the shared primitive before writing new CSS.** Check the table
   below first. A new one-off class is a sign something is missing from
   this system, not a reason to skip it.
3. **Sentence case for interface text; `.kicker` stays uppercase.** Buttons,
   labels, and body copy read naturally. Small archival-style eyebrow
   labels (`.kicker`) keep the uppercase Cinzel treatment — that's
   deliberate visual personality, not an oversight.
4. **Serif for identity and titles, sans for interface.** `--c-font-display`
   (Spectral) for page/section titles and brand moments; `--c-font-label`
   (Cinzel) for small eyebrow/label text; `--c-font-ui` (DM Sans) for
   buttons, form controls, body copy, metadata.
5. **Status is never color-only.** Chips carry a text label and (via
   `data-status-key`/tone class) a shape/border difference, not just a
   color shift.

## Tokens

All defined in `apps/web/src/styles/global.css`'s `:root` block (top of the
file, right after the `@import`). The original 10 tokens (`--ink`,
`--muted`, `--gold`, `--gold-soft`, `--panel`, `--line`, `--paper`,
`--danger`) are kept as aliases — existing code doesn't need to change, but
new code should prefer the `--c-*` names below since they're the documented,
semantic set.

### Colors

| Token | Value | Use |
|---|---|---|
| `--c-canvas` | `#052838` | Page background base |
| `--c-surface` / `--c-surface-raised` / `--c-surface-interactive` | navy at 0.72/0.91/0.4 alpha | Card/panel backgrounds, by elevation |
| `--c-surface-parchment` | `#e9d5a3` | The one place a lighter, paper-toned surface is appropriate (student-facing excerpt text) |
| `--c-text` / `--c-text-secondary` / `--c-text-muted` | `#f7e7bd` / `#d8e3de` / `#c4d0cf` | Primary/secondary/muted text, in that contrast order |
| `--c-text-on-gold` | `#19303a` | Text on a gold-filled surface (primary buttons) |
| `--c-border-subtle` / `--c-border` / `--c-border-strong` | translucent cream 0.14 / gold 0.4 / gold 0.6 | Ordinary borders, in increasing emphasis — default to `-subtle` |
| `--c-border-gold` | `var(--gold)` | Full-strength gold border — reserve for the rare case a border itself needs to read as the primary accent (e.g. a focus ring) |
| `--c-gold` / `--c-gold-soft` / `--c-gold-hover` | `#e1b65d` / `#f0d488` / `#f0d488` | Primary accent |
| `--c-success` / `--c-warning` / `--c-error` / `--c-info` | `#87d5a4` / `#f0cf7a` / `#bd755f` / `#7ee6ec` | Status tones for chips |
| `--c-focus-ring` | `var(--c-gold)` | The global focus ring color |
| `--c-disabled-bg` / `--c-disabled-text` | navy 0.3 / cream 0.4 | Disabled form control treatment |

`--c-gold-rgb`, `--c-ink-rgb`, `--c-navy-rgb`, `--c-teal-rgb`,
`--c-black-rgb`, `--c-white-rgb` are raw `R, G, B` triples for building new
`rgba(var(--c-*-rgb), alpha)` values without hardcoding another literal.

### Type

`--c-font-display` (Spectral serif), `--c-font-label` (Cinzel serif),
`--c-font-ui` (DM Sans). Size scale: `--c-text-display` (hero clamp),
`--c-text-page` (page/section-editor titles, `clamp(1.9rem, 2.6vw, 2.6rem)`),
`--c-text-section` (1.2rem), `--c-text-body` (1rem), `--c-text-meta`
(0.85rem), `--c-text-label` (0.72rem). Line-height: `--c-leading-tight` /
`-normal` / `-relaxed`.

### Spacing, shape, elevation

`--c-space-1` through `-8` = 4/8/12/16/24/32/48/64px. `--c-radius-sm` (8px,
inputs/chips), `-md` (12px, cards), `-lg` (16px, page shells/dialogs),
`-pill` (999px, chips). Three shadow tiers: `--c-shadow-subtle` /
`-raised` / `-overlay`, replacing what used to be 42 unique bespoke
`box-shadow` values.

### Layout, motion

`--c-width-auth` (460px — the sign-in/join card), `--c-width-content`
(1180px), `--c-width-editor` (1480px), `--c-width-reading` (68ch),
`--c-gutter` (56px), `--c-header-h` (58px). `--c-dur-fast` (120ms),
`--c-dur-base` (200ms), `--c-dur-slow` (320ms).

## Shared primitives (CSS)

`c-` prefixed to avoid collision with the file's ~570 existing selectors.
Defined in a dedicated banner section near the top of `global.css`, right
after the token block — intentionally positioned *before* the file's
milestone-log CSS so later, more-specific gameplay overrides still win by
normal cascade order if they need to.

| Class | Purpose |
|---|---|
| `.c-page`, `.c-page--wide` | Page shell width container (content vs. editor width) |
| `.c-page-header`, `.c-page-title`, `.c-eyebrow`, `.c-page-description`, `.c-page-actions` | Page header block |
| `.c-section`, `.c-section-head`, `.c-section-title`, `.c-section-description` | Loose content grouping with a top divider between sections |
| `.c-card`, `.c-card--interactive` | Bounded surface; `--interactive` adds hover/focus-within lift |
| `.c-panel`, `.c-panel--parchment` | Lighter-weight grouping than a card; `--parchment` is the student-excerpt treatment |
| `.c-field`, `.c-field--inline`, `.c-field-label-row`, `.c-label`, `.c-label-hint`, `.c-help`, `.c-error-text` | Form field scaffolding |
| `.c-input`, `.c-textarea`, `.c-select` | Form controls, with `:hover`/`:focus-visible`/`[aria-invalid]`/`:disabled` states |
| `.c-chip`, `.c-chip--gold/success/warning/error/muted` | The one shared badge/pill primitive |
| `.c-empty`, `.c-loading`, `.c-skeleton` | Empty state, inline loading note (with spinner), skeleton shimmer |
| `.c-toolbar`, `.c-steps`, `.c-step` | Action row and step-indicator primitives |

## Button hierarchy

One base (`.btn`) + variants. All have real `:hover`/`:active`/`:disabled`/
`:focus-visible` states now (none existed before this pass).

| Variant | Class | Use | Look |
|---|---|---|---|
| Primary | `.btn-gold` | The one most-important action on a screen (Sign In, Save Draft, Publish, Continue) | Filled gold gradient, dark text |
| Secondary | `.btn-outline` | Important but non-primary (Preview as student, Continue with Google, Edit mission) | Dark surface, subtle border |
| Tertiary | `.btn-plain` / `.text-button` / `.back-link` | Low-priority (Back, Cancel, View details) | No chrome, cream text |
| Danger | `.btn-danger` | Destructive only (Remove, Discard) | Muted red, fills on hover |
| Dev | `.btn-dev` | Development-only controls | Dashed border, monospace — visually quarantined from production actions |

**Never give two actions on the same screen equal visual weight** unless
they're genuinely equal-priority alternatives (e.g. a tab switcher). If you
find yourself reaching for `.btn-gold` twice in one view, one of them is
probably the wrong variant.

## JS markup helpers

`apps/web/src/main.js`, defined just after `feedbackError()`/
`feedbackSuccess()`. Thin template-literal builders over the CSS primitives
above — use them for new teacher-screen markup instead of hand-writing the
HTML string again.

```js
btn({ label, action, variant, disabled, type, attrs })
// variant: "primary" | "secondary" | "tertiary" | "danger" | "dev"

chip({ label, tone, live })
// tone: "default" | "gold" | "success" | "warning" | "error" | "muted"
// live: true adds role="status" aria-live="polite" for a chip that updates

fieldMarkup({ id, label, type, value, help, required, optional, error, textarea, rows })
// Labeled field with required/optional indicator, help text, and an
// aria-describedby/aria-invalid-wired error message

emptyState({ title, body, action })
loadingNote(text)  // role="status" aria-live="polite" inline loading text

pageHeaderMarkup({ eyebrow, title, description, status, actions, breadcrumb })
sectionHeadMarkup({ title, description, actions })
```

`authTabsMarkup(tabs)` (near `passwordFieldMarkup`) builds a quiet pill-style
tab switcher (`role="tablist"`/`"tab"`/`aria-selected`) — used by the
sign-in/create-account and join/claim switchers, and the same pattern
(`role="tablist"` on `teacherDashboardTabsMarkup()`'s wrapper) is reused on
the Teacher Dashboard's own tab bar.

## Accessibility expectations for new work

- Every interactive control needs a visible focus state — it's the default
  now (`:focus-visible` is global), don't suppress it.
- Status/chip color is never the only signal — pair with a text label.
- New tables need a `<caption>` and `th[scope="col"]`.
- New tab-like UI should use `authTabsMarkup()` or match its
  `role="tablist"`/`"tab"`/`aria-selected` pattern. Roving tabindex +
  arrow-key navigation was deliberately **not** added — the app's global
  keydown handler already carries significant gameplay-movement complexity
  (WASD steering, held-key state for two mini-games), and standard Tab
  traversal already makes every tab keyboard-operable. If you add arrow-key
  tab navigation later, scope it carefully against that handler.
- Click-only interactive elements inside a template literal (spans with
  `data-action` and a click handler) are a known trap — the highlight tool's
  per-sentence segments were exactly this until Phase 44 C7. Use a real
  `<button>` and reset its default chrome (`border: 0; padding: 0;
  background: none; font: inherit; display: inline;` if it needs to sit
  inline in running text) rather than a clickable non-interactive element.

## Responsive

Manage Content-specific breakpoints: `1024px` (command bar/shell padding
tightens) and `760px` (existing, dialog/summary layout). These are the only
two breakpoints inside the teacher-facing CSS region — the file's other
breakpoints (`700`/`1180`/`1220px`) belong to gameplay selectors and are out
of this system's scope; don't "helpfully" consolidate them into the teacher
breakpoints without a dedicated gameplay-responsive audit first.

## What this pass deliberately did not do

- **Did not restructure gameplay CSS** (`.field-*`, `.hub-*`, `.quest-*`,
  `.map-*`, `.director-*`) at the time this pass (Phase 44) ran — that
  restructuring, plus the dead-CSS sweep below, is exactly what Phase 45
  (`ARCHITECTURE-QUICKREF.md`) did once a real visual-regression net
  existed to make it safe.
- **The full dead-CSS sweep referenced here as "not done" shipped in
  Phase 45D.** One confirmed-orphaned class (`.roster-progress-pill`,
  superseded by `chip()`) was removed in this pass; the ~93-candidate
  figure this section originally cited was never itself individually
  verified or enumerated anywhere — Phase 45D built a real scanner
  (literal + template-literal-stem matching, e.g. the jigsaw puzzle's
  `` `map-piece--p${n}` `` pattern) and verified every removal by hand
  rather than trusting that count. A large "stem-only" bucket (79
  classes, mostly legitimate dynamic-class usage) is still deliberately
  unswept — don't assume an apparently-unused class is dead without
  grepping for template-literal construction first.
- **Did not add roving-tabindex arrow-key navigation** to the new tablist
  markup — see the accessibility section above.
- **Did not adopt axe-core or Lighthouse CI** — both are on
  `ARCHITECTURE-QUICKREF.md`'s explicit "consider-later, not adopted" list.
  Accessibility verification in this pass was manual (browser + DevTools
  accessibility tree), not automated.
- **Did not paginate or virtualize** the roster/submissions tables or the
  Sources tab's per-unit pool lists — matches the standing 2026-07-23 audit
  conclusion that these are adequate at current data volumes. Revisit if a
  real classroom's data volume becomes actually large.

## Guidance for future Claude Code sessions

- **Check this doc and the tables above before writing new teacher-screen
  CSS.** If what you need isn't here, consider whether it belongs here
  before adding a one-off class.
- **Don't touch gameplay-family selectors** as part of a "consistency"
  pass unless the task explicitly asks for gameplay UI work — that's the
  one hard boundary this whole pass respected.
- **Verify Prettier-cleanliness of only what you touched**, not the whole
  file — `main.js` and `global.css` both carry pre-existing formatting
  debt from before this pass (whole-file `prettier --write` will silently
  reformat hundreds of unrelated lines; diff your specific edit region
  against a temp-formatted copy instead).
- **Browser-verify visual changes**, per CLAUDE.md's standing rule — this
  pass's commits were each verified live (dev-fake-teacher login → the
  actual screen → screenshot/accessibility-tree check) before committing,
  not just built/linted.
