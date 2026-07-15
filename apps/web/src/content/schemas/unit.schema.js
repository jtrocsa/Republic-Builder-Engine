import { z } from "zod";

// Route names a case hands off to on Chronotravel (`goToCase()` sets
// `currentScreen = "travel"`, which self-advances to `caseById(id).route`).
// Zod can't see main.js's route dispatch, so this list is a second source of
// truth — update it by hand if a new case route is ever added in main.js.
const CASE_ROUTES = ["field", "ledger", "empire", "triangle", "regions"];

const MapPositionSchema = z.object({
  left: z.string().min(1, "mapPosition.left is required"),
  top: z.string().min(1, "mapPosition.top is required"),
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

export const CaseSchema = z.object({
  id: z.string().min(1, "case.id is required"),
  shortTitle: z.string().min(1, "case.shortTitle is required"),
  title: z.string().min(1, "case.title is required"),
  date: z.string().min(1, "case.date is required"),
  mapPosition: MapPositionSchema,
  location: z.string().min(1, "case.location is required"),
  question: z.string().min(1, "case.question is required"),
  mechanic: z.string().min(1, "case.mechanic is required"),
  route: z.enum(CASE_ROUTES, {
    message: `case.route must be one of: ${CASE_ROUTES.join(", ")}`,
  }),
  summary: z.string().min(1, "case.summary is required"),
  // Whether this case still gets a marker on the Chronicle Navigation Table.
  // Defaults true so every pre-existing case validates unchanged; cases
  // relocated into the Institute Archive Room are flagged false in content.
  navigationTableVisible: z.boolean().default(true),
  // Present only for cases relocated into the Archive Room; null for
  // ChronoTravel destination cases (route: "field") and for
  // not-yet-migrated standalone cases.
  archiveChallenge: ArchiveChallengeSchema.nullable().default(null),
});

export const UnitSchema = z.object({
  id: z.string().min(1, "unit.id is required"),
  title: z.string().min(1, "unit.title is required"),
  period: z.string().min(1, "unit.period is required"),
  description: z.string().min(1, "unit.description is required"),
  centralQuestion: z.string().min(1, "unit.centralQuestion is required"),
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
