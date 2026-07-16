# 0031 — Art & Map Style Unification: Canonical Element Dictionary Adopted

Date: 2026-07-16

## Decision

Adopt `docs/architecture/art-and-map-style-guide.md` as the durable reference for which
tileset pack/sheet supplies each recurring visual element (grass, trees, buildings,
water, interior furniture, etc.), per historical setting. The trigger was a direct
request to unify Chronicle's visual identity the way Pokémon's is unified — not by
literally cloning GBA pixel scale, but by having one deliberate answer per element
instead of each map re-deciding its own art from scratch. This planning pass also
corrected an early scoping assumption: `apps/web/src/assets/tilesets/` holds 87 files
across 9 packs, not "thousands" as initially believed — a small, fully-catalogable set,
not an open-ended search space.

All four existing maps were audited against the new guide:

- **Caribbean field** (`case-001`) already matches the guide (Island survival, tropical)
  but uses only 2 of 13 sheets in the pack — flagged as an optional enrichment, not a
  fix.
- **Riverbend field** (`case-004`) is genre-consistent (Medieval Fishing Village +
  Medieval Fantasy Town + one `farm` crop tile) but its `import.meta.glob` wiring is
  over-broad, bundling whole pack folders when each map only references one file per
  pack — a known, previously-deferred issue (see `0029`'s notes) now scheduled for
  cleanup.
- **Institute Archive Room** was initially suspected to be a style mismatch (Medieval
  Tavern furniture standing in for a modern research institute) — this suspicion was
  **wrong**. Decision log `0030` already evaluated and rejected `Modern Interiors` for
  a real technical reason (its sheets aren't a uniform tile grid the loader can parse)
  and deliberately chose Medieval Tavern's neutral shelving/table furniture, reframed
  as archive record storage. The guide records this as canonical, not reopened.
- **Unit 3's Common Cause field** (`case-007`, 1770s Philadelphia) remains the one
  genuine gap — no pack in the repo fits colonial Philadelphia, already acknowledged
  in-code. It stays CSS-drawn (`commonCauseWorldMarkup()`) rather than forcing a
  mismatched pack through Tiled.

## Rationale

**A dictionary, not a fidelity downgrade.** The user's own framing — "this is what we
use for grass, for trees, for houses" — is a request for consistency of _element
identity_, not a request to shrink the art to literal GBA scale. The existing 48px
painted-pixel packs are kept as the fidelity baseline; the fix is picking one canonical
source per category per setting and stopping ad hoc per-map re-selection.

**Camera and dialogue are restyled-in-place, not redesigned.** Both `.field-viewport`
and `.field-speech-bubble` are explicitly invariant-protected in `CLAUDE.md`, sourced
from real regressions across milestones 3.4.5–3.4.15. The Pokémon touchstone invited a
bigger interaction-model change (full-width bottom dialogue box, tighter camera zoom)
but that risk wasn't judged worth the marginal aesthetic gain. This is recorded as a
deliberate, considered decision so it isn't silently reopened in a future session.

**Existing reasoning was read before being second-guessed.** Before finalizing the
guide, `0029` and `0030` were re-read directly — this caught the Archive Room
misdiagnosis above before it turned into wasted remediation work, and confirmed the
Riverbend glob-scoping issue was already known and explicitly deferred rather than
newly discovered.

## Notes

- Two read-only audits fed the guide: (1) the Riverbend `farm`-pack usage was traced by
  GID — only tile local id 38 (GID 551, a repeated ground-fill/crop-row tile) and local
  id 47 (GID 560, a sparse structures accent) are actually placed; no vehicle tile is
  used, downgrading the original anachronism concern from "confirmed risk" to
  "confirmed low-risk, glob-scoping is the real remaining issue." (2) The Caribbean
  field's two loaded sheets (`tile-B-01.png`, `tile-B-02.png`) were found to have
  substantial unused content already (coral, driftwood, shells, campfire, tents, crates,
  a full unused coastline autotile blob set) — meaning basic enrichment needs no new
  glob entries at all, just placing more of what's already bundled.
- This pass produced **no code changes** — the guide and this record are documentation
  only. Follow-up phases (Riverbend glob cleanup, optional Caribbean enrichment) are
  tracked separately and will each get their own verification pass per
  `docs/architecture/art-and-map-style-guide.md`'s conventions.
- The only unresolved item is the Gap Register's single entry: a Revolutionary/Georgian
  colonial urban architecture set for Unit 3, deferred to a future asset-acquisition
  session rather than forced with a mismatched pack.
