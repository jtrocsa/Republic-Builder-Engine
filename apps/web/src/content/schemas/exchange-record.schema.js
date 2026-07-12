import { z } from "zod";

// A single source-driven MCQ card in the Exchange Ledger (Case 1.02 /
// `exchangeLedgerScreen()` in main.js).
export const ExchangeRecordSchema = z
  .object({
    id: z.string().min(1, "exchangeRecord.id is required"),
    label: z.string().min(1, "exchangeRecord.label is required"),
    icon: z.string().min(1, "exchangeRecord.icon is required"),
    sourceTitle: z.string().min(1, "exchangeRecord.sourceTitle is required"),
    sourceMeta: z.string().min(1, "exchangeRecord.sourceMeta is required"),
    excerpt: z.string().min(1, "exchangeRecord.excerpt is required"),
    sourceNote: z.string().min(1, "exchangeRecord.sourceNote is required"),
    question: z.string().min(1, "exchangeRecord.question is required"),
    choices: z.array(z.string().min(1)).min(2, "exchangeRecord.choices needs at least 2 options"),
    answer: z.number().int().nonnegative(),
    citation: z.string().min(1, "exchangeRecord.citation is required"),
  })
  .superRefine((record, ctx) => {
    if (record.answer >= record.choices.length) {
      ctx.addIssue({
        code: "custom",
        path: ["answer"],
        message: `exchangeRecord.answer (${record.answer}) is out of range for ${record.choices.length} choices.`,
      });
    }
  });

export const ExchangeRecordsSchema = z.array(ExchangeRecordSchema).superRefine((records, ctx) => {
  const firstSeenAt = new Map();
  records.forEach((item, index) => {
    if (firstSeenAt.has(item.id)) {
      ctx.addIssue({
        code: "custom",
        path: [index, "id"],
        message: `Duplicate exchange record id "${item.id}" (first seen at index ${firstSeenAt.get(item.id)}).`,
      });
    } else {
      firstSeenAt.set(item.id, index);
    }
  });
});
