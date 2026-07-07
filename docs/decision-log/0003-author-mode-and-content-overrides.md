# 0003 — Author Mode and Content Overrides

**Status:** Accepted for development builds

## Decision

Chronicle screens separate **student-facing content** from **screen structure and mechanics**.

- The version committed in `apps/web/src/content/` is the canonical default content.
- A development-only **Author Mode** may edit text, labels, dates, titles, prompts, source metadata, alt text, and other content fields.
- Author Mode saves drafts in the current browser using `localStorage`.
- It can export/import JSON and reset to repository defaults.
- It does **not** expose layout geometry, CSS, navigation rules, scoring, progression rules, or data architecture.

## Why

The project needs frequent copy revision without turning every wording test into a code edit. At the same time, student-facing UI must stay coherent across Chromebooks, laptops, and future devices.

## Responsive-layout rule

Author Mode does not include free drag-and-drop positioning. Text regions must wrap and expand within responsive layouts. Length warnings signal when wording may need a visual review at Chromebook width.

## Publishing rule

The Author Mode control is temporary for development and teacher-authoring builds. A future authentication/role system will determine when it is available in published deployments.

## Current scope

Milestone 1.1 applies the pattern to the Chronicle Institute opening. Future scenes should reuse the same content-store utilities and content-file approach.
