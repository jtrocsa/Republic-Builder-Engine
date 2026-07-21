import { z } from "zod";

/**
 * Reference-only shape for the syllabus-wide primary source library
 * (apps/web/src/content/primary-source-library/). Deliberately NOT the same
 * shape as buildSourceSchema (source.schema.js) — that schema's
 * activityRoute/reconstruction/investigationQuestId fields are wired to a
 * specific built case's gameplay, which most of Units 4-9 don't have yet.
 * This schema only carries real historical metadata: nothing here should be
 * read as "this is playable content," only "this is researched and ready to
 * be pulled into a real case's source array when one is built."
 */

export const PRIORITY_TIERS = ["essential", "very_common", "useful"];

export function buildPrimarySourceEntrySchema() {
  return z.object({
    id: z.string().min(1, "id is required"),
    unit: z.number().int().min(1).max(9),
    priority: z.enum(PRIORITY_TIERS),
    topPriorityRank: z.number().int().min(1).max(50).nullable(),
    title: z.string().min(1, "title is required"),
    creator: z.string().min(1, "creator is required"),
    date: z.string().min(1, "date is required"),
    apushUse: z.string().min(1, "apushUse is required"),
    excerpt: z.string().min(1, "excerpt is required"),
    citation: z.string().min(1, "citation is required"),
    externalUrl: z.url({ message: "externalUrl must be a valid URL" }).nullable(),
  });
}

export function buildVisualSourceEntrySchema() {
  return z.object({
    id: z.string().min(1, "id is required"),
    unit: z.number().int().min(1).max(9),
    title: z.string().min(1, "title is required"),
    description: z.string().min(1, "description is required"),
    citation: z.string().min(1, "citation is required"),
    externalUrl: z.url({ message: "externalUrl must be a valid URL" }).nullable(),
  });
}

export const UnitMetaSchema = z.object({
  unit: z.number().int().min(1).max(9),
  period: z.string().min(1),
  years: z.string().min(1),
  label: z.string().min(1),
  testableComparisons: z.array(z.string().min(1)).min(1),
});

function dedupeById(list, ctx) {
  const firstSeenAt = new Map();
  list.forEach((item, index) => {
    if (firstSeenAt.has(item.id)) {
      ctx.addIssue({
        code: "custom",
        path: [index, "id"],
        message: `Duplicate id "${item.id}" (first seen at index ${firstSeenAt.get(item.id)}).`,
      });
    } else {
      firstSeenAt.set(item.id, index);
    }
  });
}

export function buildPrimarySourcesSchema() {
  return z.array(buildPrimarySourceEntrySchema()).superRefine(dedupeById);
}

export function buildVisualSourcesSchema() {
  return z.array(buildVisualSourceEntrySchema()).superRefine(dedupeById);
}
