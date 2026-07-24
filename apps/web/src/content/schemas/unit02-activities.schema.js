import { z } from "zod";

function assertUniqueIds(items, ctx, label) {
  const firstSeenAt = new Map();
  items.forEach((item, index) => {
    if (firstSeenAt.has(item.id)) {
      ctx.addIssue({
        code: "custom",
        path: [index, "id"],
        message: `Duplicate ${label} id "${item.id}" (first seen at index ${firstSeenAt.get(item.id)}).`,
      });
    } else {
      firstSeenAt.set(item.id, index);
    }
  });
}

// Record Reconstruction lanes for case-004 (Unit 2's mirror of case-001's
// hard-coded-in-main.js lane set — see source.schema.js).
export const CaseLaneSchema = z.object({
  id: z.string().min(1, "lane.id is required"),
  label: z.string().min(1, "lane.label is required"),
});

export const CaseLanesSchema = z
  .array(CaseLaneSchema)
  .min(1, "case lanes must contain at least one lane")
  .superRefine((lanes, ctx) => assertUniqueIds(lanes, ctx, "lane"));

// RegionRecordSchema/RegionRecordsSchema/buildRegionEvidenceSchema (for the
// "Charter & Compact" activity's regionsScreen() in main.js) were removed in
// plan Phase 5 once that screen was deleted — its content now validates as
// an Archive Challenge quest (evidence-organizing-quest.js's schemas) instead.
//
// TriangleLegSchema/TriangleLegsSchema/buildTriangleCargoSchema (for the
// "Triangle Ledger" activity's triangleScreen() in main.js) were removed the
// same way once that screen was deleted (Manage Content wizard redesign,
// Phase A) — its content now validates as an Archive Challenge quest
// (evidence-organizing-quest.js's schemas) instead too.
