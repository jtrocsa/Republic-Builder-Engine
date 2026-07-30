import { z } from "zod";
import { CED_THEME_CODES } from "../ced-taxonomy.js";

// Route names a case hands off to on Chronotravel (`goToCase()` sets
// `currentScreen = "travel"`, which self-advances to `caseById(id).route`) —
// named after the screen id it dispatches to, so travelScreen()'s handoff is
// a pure passthrough with no null special case (Phase 48A). Zod can't see
// main.js's route dispatch, so this list is a second source of truth —
// update it by hand if a new case route is ever added in main.js. The
// former per-case bespoke route names ("ledger"/"empire"/"triangle"/
// "founding") are retired along with the screens they dispatched to.
// "mission" replaced "archive-challenges" for every non-map case in Phase 58. The old value meant
// "Chronotravel to this case lands on the shared Archive Challenges list", which rendered *every*
// case's challenge in one list merely reordered to put the traveled-to case first — same title, same
// list, same look for all six of them, and five of the six were the same quest type. The Archive
// Room is now what its name says: the AP writing work (SAQ, DBQ), reached from the Archive Terminal.
// A "mission" case is a mission of its own, framed by its own title, question and mechanic.
const CASE_ROUTES = ["field", "mission"];

const MapPositionSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

// BRAND's own field values are a known, deliberately-untouched cleanup item
// (see CLAUDE.md's "Republic Builder Engine" retirement note) — this only
// checks the fields are present, not what they currently say.
export const BrandSchema = z.object({
  engine: z.string().min(1, "BRAND.engine is required"),
  campaign: z.string().min(1, "BRAND.campaign is required"),
  status: z.string().min(1, "BRAND.status is required"),
});

// A case's Archive Challenge, if it has one — the shared quest-type engine
// (quest-types/index.js's QUEST_TYPES) renders/grades it, so questType is
// cross-referenced against Object.keys(QUEST_TYPES) in validate-content.js,
// not against a Zod enum here (Zod can't see application code).
const ArchiveChallengeSchema = z.object({
  questType: z.string().min(1, "case.archiveChallenge.questType is required"),
  questId: z.string().min(1, "case.archiveChallenge.questId is required"),
});

// Phase 49D: real College Board CED alignment metadata, surfaced read-only
// on the Teacher Dashboard (Manage Content's mission cards) alongside each
// mission's existing kind/mechanic labels — not a 4th independently-authored
// taxonomy: the 4th CED dimension the roadmap names ("Historical Thinking
// Skill") is deliberately NOT a field here. It's derived at render time from
// the skillCategory tags mcq/sequencing/hipp/evidence-organizing quests
// already carry (Phase 49B) — see engine/ced-alignment.js — so it can never
// drift from what a case's actual content exercises.
const CedAlignmentSchema = z.object({
  // 1-9 (not 1-3) even though only Periods 1-3 exist in the game today —
  // Chronicle's own roadmap (PHASES-46-50.md) states it plans to grow into
  // the CED's full 9 periods, and narrowing this to 1-3 now would just mean
  // widening it again later for no benefit.
  period: z.number().int().min(1).max(9, "case.ced.period must be 1-9"),
  keyConcepts: z
    .array(z.string().regex(/^[1-9]\.[1-9]$/, 'case.ced.keyConcepts entries must look like "1.2"'))
    .min(1, "case.ced.keyConcepts must contain at least one entry"),
  themes: z
    .array(
      z.enum(CED_THEME_CODES, {
        message: `case.ced.themes entries must be one of: ${CED_THEME_CODES.join(", ")}`,
      })
    )
    .min(1, "case.ced.themes must contain at least one entry")
    .max(3, "case.ced.themes should stay focused - at most 3 per case"),
});

// Whether a case gets a marker on the Chronicle Navigation Table has no
// field here — it's purely a per-classroom teacher override
// ("navTableVisible" in teacher-override-repository.js, default visible),
// not a content-authored global default. A content-level field would be the
// wrong layer: every case shows by default (Phase 48A), and a teacher hiding
// one mission for their own classroom shouldn't require re-authoring
// content. See resolvedNavTableVisible()/archiveScreen() in main.js.
export const CaseSchema = z.object({
  id: z.string().min(1, "case.id is required"),
  shortTitle: z.string().min(1, "case.shortTitle is required"),
  title: z.string().min(1, "case.title is required"),
  date: z.string().min(1, "case.date is required"),
  mapPosition: MapPositionSchema,
  location: z.string().min(1, "case.location is required"),
  question: z.string().min(1, "case.question is required"),
  mechanic: z.string().min(1, "case.mechanic is required"),
  // Every case requires a real route name — "field" for a Chronotravel
  // destination with a walkable map, "mission" for a case whose whole mechanic
  // is its `archiveChallenge` quest below (main.js's missionScreen() renders
  // that one quest and nothing else).
  route: z.enum(CASE_ROUTES, {
    message: `case.route must be one of: ${CASE_ROUTES.join(", ")}`,
  }),
  summary: z.string().min(1, "case.summary is required"),
  // The quest a `route: "mission"` case *is*; null for Chronotravel
  // destination cases (route: "field"), whose mechanic is the map itself.
  // Still named `archiveChallenge` rather than renamed to `mission`: the key is
  // read by the teacher content-selection pipeline, by progress.archiveChallenges
  // completion records in every existing save, and by two migrations' column
  // names, so renaming it is a data change disguised as a rename.
  archiveChallenge: ArchiveChallengeSchema.nullable().default(null),
  ced: CedAlignmentSchema,
});

export const UnitSchema = z.object({
  id: z.string().min(1, "unit.id is required"),
  title: z.string().min(1, "unit.title is required"),
  period: z.string().min(1, "unit.period is required"),
  description: z.string().min(1, "unit.description is required"),
  centralQuestion: z.string().min(1, "unit.centralQuestion is required"),
  // Unit-level Archive Challenges — bonus content not tied to relocating one
  // case (contrast with a case's own `archiveChallenge`, singular). Defaults
  // to empty so every pre-existing unit validates unchanged; completing all
  // of these is required for unit completion alongside all cases (see
  // main.js's unitReadyForReview()).
  archiveChallenges: z.array(ArchiveChallengeSchema).default([]),
  cases: z
    .array(CaseSchema)
    .min(1, "unit.cases must contain at least one case")
    .superRefine((cases, ctx) => {
      const firstSeenAt = new Map();
      cases.forEach((item, index) => {
        if (firstSeenAt.has(item.id)) {
          ctx.addIssue({
            code: "custom",
            path: [index, "id"],
            message: `Duplicate case id "${item.id}" (first seen at cases[${firstSeenAt.get(item.id)}]).`,
          });
        } else {
          firstSeenAt.set(item.id, index);
        }
      });
    }),
});
