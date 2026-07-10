import { z } from "zod";

// A single evidence card in the "Empire's Foundations" system-building
// activity (Case 1.03 / `empireScreen()` in main.js).
export const EmpireEvidenceSchema = z.object({
  id: z.string().min(1, "empireEvidence.id is required"),
  label: z.string().min(1, "empireEvidence.label is required"),
  source: z.string().min(1, "empireEvidence.source is required"),
  detail: z.string().min(1, "empireEvidence.detail is required"),
});

export const EmpireEvidenceListSchema = z
  .array(EmpireEvidenceSchema)
  .min(1, "EMPIRE_EVIDENCE must contain at least one card")
  .superRefine((cards, ctx) => {
    const firstSeenAt = new Map();
    cards.forEach((item, index) => {
      if (firstSeenAt.has(item.id)) {
        ctx.addIssue({
          code: "custom",
          path: [index, "id"],
          message: `Duplicate empire evidence id "${item.id}" (first seen at index ${firstSeenAt.get(item.id)}).`,
        });
      } else {
        firstSeenAt.set(item.id, index);
      }
    });
  });

const EmpireConnectionSchema = z.object({
  from: z.string().min(1, "empireConnection.from is required"),
  to: z.string().min(1, "empireConnection.to is required"),
  clue: z.string().min(1, "empireConnection.clue is required"),
});

// EMPIRE_CONNECTIONS is a documentary/UI-narrative list (main.js never reads
// it — see CLAUDE.md's engine/content-boundary notes on `EMPIRE_CONNECTIONS`
// being a dead import). It's still validated because a broken `from`/`to`
// reference here is exactly the kind of stale-content bug this phase exists
// to catch before it's ever wired back up.
export function buildEmpireConnectionsSchema(evidenceIds) {
  const validIds = new Set(evidenceIds);
  return z.array(EmpireConnectionSchema).superRefine((connections, ctx) => {
    connections.forEach((connection, index) => {
      if (!validIds.has(connection.from)) {
        ctx.addIssue({
          code: "custom",
          path: [index, "from"],
          message: `empireConnection.from "${connection.from}" does not match any EMPIRE_EVIDENCE id.`,
        });
      }
      if (!validIds.has(connection.to)) {
        ctx.addIssue({
          code: "custom",
          path: [index, "to"],
          message: `empireConnection.to "${connection.to}" does not match any EMPIRE_EVIDENCE id.`,
        });
      }
    });
  });
}
