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

// A single leg of the Triangle Ledger circuit (`triangleScreen()` in main.js).
export const TriangleLegSchema = z.object({
  id: z.string().min(1, "triangleLeg.id is required"),
  label: z.string().min(1, "triangleLeg.label is required"),
  fromLabel: z.string().min(1, "triangleLeg.fromLabel is required"),
  toLabel: z.string().min(1, "triangleLeg.toLabel is required"),
  description: z.string().min(1, "triangleLeg.description is required"),
});

export const TriangleLegsSchema = z
  .array(TriangleLegSchema)
  .min(1, "TRIANGLE_LEGS must contain at least one leg")
  .superRefine((legs, ctx) => assertUniqueIds(legs, ctx, "triangle leg"));

function buildTriangleCargoItemSchema(legIds) {
  return z
    .object({
      id: z.string().min(1, "triangleCargo.id is required"),
      label: z.string().min(1, "triangleCargo.label is required"),
      icon: z.string().min(1, "triangleCargo.icon is required"),
      leg: z.enum(legIds, { message: `triangleCargo.leg must be one of: ${legIds.join(", ")}` }),
      sourceTitle: z.string().min(1, "triangleCargo.sourceTitle is required"),
      sourceMeta: z.string().min(1, "triangleCargo.sourceMeta is required"),
      consequence: z.string().min(1, "triangleCargo.consequence is required"),
      question: z.string().min(1, "triangleCargo.question is required"),
      choices: z.array(z.string().min(1)).min(2, "triangleCargo.choices needs at least 2 options"),
      answer: z.number().int().nonnegative(),
      citation: z.string().min(1, "triangleCargo.citation is required"),
    })
    .superRefine((cargo, ctx) => {
      if (cargo.answer >= cargo.choices.length) {
        ctx.addIssue({
          code: "custom",
          path: ["answer"],
          message: `triangleCargo.answer (${cargo.answer}) is out of range for ${cargo.choices.length} choices.`,
        });
      }
    });
}

export function buildTriangleCargoSchema(legIds) {
  return z.array(buildTriangleCargoItemSchema(legIds)).superRefine((cargoList, ctx) => {
    assertUniqueIds(cargoList, ctx, "triangle cargo");
  });
}

// A colonial region column in the "Charter & Compact" activity
// (`regionsScreen()` in main.js).
export const RegionRecordSchema = z.object({
  id: z.string().min(1, "regionRecord.id is required"),
  label: z.string().min(1, "regionRecord.label is required"),
  summary: z.string().min(1, "regionRecord.summary is required"),
});

export const RegionRecordsSchema = z
  .array(RegionRecordSchema)
  .min(1, "REGION_RECORDS must contain at least one region")
  .superRefine((regions, ctx) => assertUniqueIds(regions, ctx, "region"));

function buildRegionEvidenceItemSchema(regionIds) {
  return z.object({
    id: z.string().min(1, "regionEvidence.id is required"),
    label: z.string().min(1, "regionEvidence.label is required"),
    source: z.string().min(1, "regionEvidence.source is required"),
    detail: z.string().min(1, "regionEvidence.detail is required"),
    region: z.enum(regionIds, {
      message: `regionEvidence.region must be one of: ${regionIds.join(", ")}`,
    }),
  });
}

export function buildRegionEvidenceSchema(regionIds) {
  return z.array(buildRegionEvidenceItemSchema(regionIds)).superRefine((evidence, ctx) => {
    assertUniqueIds(evidence, ctx, "region evidence");
  });
}
