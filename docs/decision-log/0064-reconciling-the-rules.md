# 0064 — Reconciling the rules

**Phase 81A · 2026-08-03 · Accepted**

The opening pass of Phase 81, a six-part program (81A–81F) that reconciles the design rules, rewrites
the lore against the canon, builds the cutscene system, decides the remaining maps as one solve, and
authors activities for Units 3–5.

This entry covers 81A only: the rules. It changes no player-visible behaviour. Its job is to make
the documents that govern 81B–81F agree with each other first, because two of the conflicts below
were actively producing wrong work.

---

## The problem

Fifteen cases across five units were built over many phases, and the governing documents were written
alongside them rather than before them. That is the right order for a game nobody had played yet, and
it left the rule set with contradictions that only surface when you try to use the rules to decide
something.

The audit found sixteen. Most are documentation drift and are recorded rather than fixed. Two were
load-bearing, and both were producing wrong answers rather than merely reading oddly.

## 1. The variety rule could not be satisfied as written

`MISSION-ACTIVITY-CATALOG.md` §5 rule 2 read **"no two adjacent units may share a primary
activity."** Four engines exist and a unit ships three, so any two units share at least two engines.
The rule forbade something no schedule could avoid — it was unsatisfiable, not merely strict.

Phase 70 had already worked around it without amending it. When Riverbend was slated, what was
actually applied was: the **whole slate** must not repeat, and a repeated engine earns its place by
asking a structurally different question. Unit 1's interview puts four topical questions to seven
people; Unit 2's puts one civic question set to eight and lets the answers stratify by legal status.
Same engine, different question, and the two missions do not feel alike.

Rule 2 now says what Phase 70 did. The important half is the clause that got added: **the question
axis is what carries this rule.** The engine axis is its cheap half, and a rotation that varies
engines while asking the same shape of question every time satisfies the letter and defeats the
purpose.

## 2. Rule 3 forced uniformity while claiming to enforce variety

Rule 3 read **"every unit ships at least one Group A entry."** `interview` is the only Group A
engine. So the rule forced an interview into all nine units and left exactly **three legal slates**
out of the four combinations — which is the opposite of what a variety rule is for.

The arithmetic is worth stating because it is not obvious and it decided a real question. When Unit
6's brief was written, `MAP-NARRATIVE-STRUCTURE.md` §6 proposed INTERVIEW + ASSEMBLY + TRACE and
called it provisional, "settled when [Units 3–5's] is." Under the old rules that provisional slate
had only three possible values and Units 3–5 could not be slated independently of it. The whole
nine-unit sequence was one constraint problem that nobody could solve locally — which is why four
maps' worth of engine decisions had been deferred rather than made.

Rule 3 is now a **condition rather than a requirement**: a unit that omits Group A must carry its
talk another way — authored companion dialogue, a scripted scene, or the §3 substrate fields. That
restores the fourth slate (`assembly · discrepancy · trace`) and lets a map be genuinely different
rather than differently decorated.

**The concern behind the original rule stands, and is why this is a condition and not a deletion.**
Groups B, C and D can all be built without a single NPC becoming a person. A unit that drops the
interview takes on a debt it has to pay somewhere else on that map, and 81C's companion dialogue is
what makes paying it possible.

## 3. Four planned maps were filed one period off

`p8-depression-street`, `p8-wwii-europe-ruins` and `p8-war-factory` all depict 1929–1945. That is
**Period 7** (1890–1945); Period 8 begins in 1945. And `p9-suburb` — "postwar suburbia" — is
**Period 8**, not 9.

The consequence is the finding, not the error: **Period 8 had no correctly-assigned planned map at
all.** The Cold War, civil rights, Vietnam and the Great Society were the library's genuinely
under-served period, and the file said the opposite — its only flagged-thin entry was
`p7-wwi-front`. Anyone planning Periods 6–9 from this file would have concluded Period 8 was covered
three times over.

`tile-palettes.test.js`'s "covers all nine APUSH periods" assertion passed throughout, because it
counts which period numbers appear rather than reading what the entries depict. That is the right
scope for that test and it is not being widened; a test cannot know that a breadline is not Cold War.

Ids were corrected along with the fields, since the `pN-` prefix was wrong with them and nothing
outside the file referenced them. `p9-campus` became `p8-campus` on the same reasoning — the campus
is one of Period 8's defining settings, and its sheets are era-agnostic enough to serve a Period 9
map unchanged, so the move is an assignment rather than an exclusion.

## 4. The gap register disagreed with the gap array

`art-and-map-style-guide.md`'s Gap Register carried seven rows; `canonical-palette.js`'s `GAPS`
exported six. The missing one was **Antebellum American commercial street**, registered in prose
when Canal Crossroads shipped and never mirrored into code — even though the guide's own text claims
the two are mirrored. Added to the array.

## 5. What is recorded rather than fixed

These are real tensions with reasons to leave them alone. They are collected here so a future session
stops rediscovering them one at a time and proposing a fix each time:

- **`case.archiveChallenge` (singular, a mission's quest slot) vs. `unit.archiveChallenges[]`
  (plural, Archive Room work).** A genuine naming trap. Cannot be renamed — the keys are read by the
  teacher content-selection pipeline, by `progress.archiveChallenges` in every existing save, and by
  two Supabase column names. Renaming is a data migration disguised as a rename. Write around it.
- **"Engine code never contains APUSH-specific facts"** vs. the case-ID literals still in `main.js`.
  Aspirational for the current slice, as CLAUDE.md already says. The Phase 70 pattern is the way out:
  make it data when a _second_ consumer needs the same gate, not before.
- **The Archive Commission inversion.** `MISSION-ACTIVITY-CATALOG.md` §1 argues a unit's Archive
  Challenge should be unlocked _by_ completion rather than required _for_ it; `unitReadyForReview()`
  does the reverse. Deferred deliberately — it is a progression gate with existing saves behind it.
- **`caseNumberLabel()`'s half-followed convention.** Only Unit 1's case titles carry the
  `"Case N.NN — Name"` prefix, so the activity eyebrow is bare on four units of five. The fix is a
  content decision, not a patch.
- **Four pre-solved sequencing quests in Units 3–4.** A real defect, fixed in 81F when those files
  are already open.
- **`shortTitle` means the place**, is not rename-aware, and must never be used to name a mission.

## Consequences

- Units 3–9's engine slates became decidable. 81D makes that decision as one solve.
- Period 8 is now visible as an art gap and enters the ranked commission list.
- No player-visible behaviour changed in 81A. The two content-facing conflicts the audit
  found — `record drift` in the opening, and travel described as date-led — are 81B's work, and the
  ban on the first lands in the same commit that removes it.
