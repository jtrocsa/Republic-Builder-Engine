import { z } from "zod";

/**
 * A primary/secondary-source record shown in the field/Codex reader
 * (`sourceReader()`/`codexScreen()` in main.js).
 *
 * `reconstructionIds`, when given, constrains `reconstruction` to a known set
 * of Record Reconstruction lane ids (see `unit02-activities.schema.js` for
 * where those ids come from for case-004). case-001's lane ids are hard-coded
 * in main.js's `RECONSTRUCTION_LANES["case-001"]`, not in content, so no
 * content-file list exists to check case-001 sources against — see
 * docs/content/CONTENT-VALIDATION.md's "Known limitations".
 */
export function buildSourceSchema({ reconstructionIds } = {}) {
  const reconstruction =
    reconstructionIds && reconstructionIds.length
      ? z.enum(reconstructionIds, {
          message: `source.reconstruction must be one of: ${reconstructionIds.join(", ")}`,
        })
      : z.string().min(1, "source.reconstruction is required");

  return z.object({
    id: z.string().min(1, "source.id is required"),
    type: z.string().min(1, "source.type is required"),
    title: z.string().min(1, "source.title is required"),
    creator: z.string().min(1, "source.creator is required"),
    date: z.string().min(1, "source.date is required"),
    record: z.string().min(1, "source.record is required"),
    visual: z.string().min(1, "source.visual is required"),
    activityRoute: z.string().min(1).nullable(),
    excerpt: z.string().min(1, "source.excerpt is required"),
    prompt: z.string().min(1, "source.prompt is required"),
    feedback: z.string().min(1, "source.feedback is required"),
    citation: z.string().min(1, "source.citation is required"),
    externalUrl: z.url({ message: "source.externalUrl must be a valid URL" }),
    localAsset: z.string().min(1).optional(),
    reconstruction,
    // Investigation Challenge gating via the shared quest-type engine
    // (quest-types/index.js's QUEST_TYPES) — an additive sibling to
    // activityRoute's legacy bespoke-screen gating. A source should set at
    // most one of activityRoute / investigationMode, not both. questType is
    // cross-referenced against Object.keys(QUEST_TYPES) in
    // validate-content.js, not a Zod enum, for the same reason as
    // case.archiveChallenge.questType above.
    investigationMode: z.string().min(1).nullable().default(null),
    investigationQuestId: z.string().min(1).nullable().default(null),
  });
}

export function buildSourcesSchema(options) {
  return z.array(buildSourceSchema(options)).superRefine((sources, ctx) => {
    const firstSeenAt = new Map();
    sources.forEach((item, index) => {
      if (firstSeenAt.has(item.id)) {
        ctx.addIssue({
          code: "custom",
          path: [index, "id"],
          message: `Duplicate source id "${item.id}" (first seen at index ${firstSeenAt.get(item.id)}).`,
        });
      } else {
        firstSeenAt.set(item.id, index);
      }
    });
  });
}
