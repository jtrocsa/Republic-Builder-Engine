// History-coupled evidence-organizing quest type (DBQ-style): sources with
// attribution, matched to slots keyed to historical-thinking-skill
// categories, plus an optional free-text reflection gate. Deliberately not
// forced generic — it assumes historical source attribution and
// skill-category rubric structure, the way EMPIRE_EVIDENCE/TRIANGLE_CARGO/
// REGION_EVIDENCE (removed in plan Phase 5, once its regionsScreen() was
// migrated onto this quest type) already did in apps/web/src/content/unit-01-campaign.js
// and unit-02-campaign.js. This generalizes that recurring pattern (see
// apps/web/src/content/schemas/unit02-activities.schema.js for the
// buildTriangleCargoSchema factory precedent this follows) rather than
// inventing a new shape from scratch.
import { z } from "zod";
import { escapeHtml } from "../shared/html.js";

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

// The four College Board reasoning-process skills ("the four Cs") plus
// Sourcing — a distinct, fifth historical-thinking skill (source
// attribution/situation), not one of the four Cs, but the other category
// this quest type's sources have needed in practice. See
// docs/content-guide/skill-taxonomy.md for the full rationale, including why
// this stays separate from HIPP_DIMENSIONS in source-analysis-quest.js
// (that enum tags one argument-component within a single document; this one
// tags a whole source's dominant historical-thinking skill across a set).
export const SKILL_CATEGORIES = [
  "Comparison",
  "Causation",
  "Continuity and Change",
  "Contextualization",
  "Sourcing",
];

export const EvidenceSlotSchema = z.object({
  id: z.string().min(1, "slot.id is required"),
  label: z.string().min(1, "slot.label is required"),
});

export const EvidenceSlotsSchema = z
  .array(EvidenceSlotSchema)
  .min(1, "slots must contain at least one slot")
  .superRefine((slots, ctx) => assertUniqueIds(slots, ctx, "slot"));

export function buildEvidenceSourceSchema(slotIds) {
  const correctSlotId =
    slotIds && slotIds.length
      ? z.enum(slotIds, {
          message: `source.correctSlotId must be one of: ${slotIds.join(", ")}`,
        })
      : z.string().min(1, "source.correctSlotId is required");

  return z.object({
    id: z.string().min(1, "source.id is required"),
    label: z.string().min(1, "source.label is required"),
    attribution: z.string().min(1, "source.attribution is required"),
    excerpt: z.string().min(1, "source.excerpt is required"),
    skillCategory: z.enum(SKILL_CATEGORIES, {
      message: `source.skillCategory must be one of: ${SKILL_CATEGORIES.join(", ")}`,
    }),
    correctSlotId,
  });
}

export function buildEvidenceSourcesSchema(slotIds) {
  return z
    .array(buildEvidenceSourceSchema(slotIds))
    .min(1, "sources must contain at least one source")
    .superRefine((sources, ctx) => assertUniqueIds(sources, ctx, "source"));
}

export const EvidenceRubricSchema = z.object({
  skillCategories: z
    .array(z.enum(SKILL_CATEGORIES))
    .min(1, "rubric.skillCategories must contain at least one category"),
  pointsTotal: z.number().int().positive("rubric.pointsTotal must be a positive integer"),
  description: z.string().min(1, "rubric.description is required"),
});

// The `sources` field is validated up-front as `z.any()` here and re-checked
// against the quest's own `slots` inside superRefine, since `correctSlotId`
// can only be enum-constrained once the sibling `slots` array is known —
// the same cross-field dependency `buildTriangleCargoSchema(legIds)` and
// `buildRegionEvidenceSchema(regionIds)` solve with an external factory
// argument; this schema takes no external argument since slots live on the
// same object.
export const EvidenceOrganizingQuestSchema = z
  .object({
    id: z.string().min(1, "evidence-organizing quest id is required"),
    prompt: z.string().min(1, "prompt is required"),
    slots: EvidenceSlotsSchema,
    sources: z.array(z.any()),
    reflectionPrompt: z.string().min(1).optional(),
    rubric: EvidenceRubricSchema,
  })
  .superRefine((quest, ctx) => {
    const slotIds = quest.slots.map((slot) => slot.id);
    const result = buildEvidenceSourcesSchema(slotIds).safeParse(quest.sources);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        ctx.addIssue({ code: "custom", path: ["sources", ...issue.path], message: issue.message });
      });
    }
  });

export const EvidenceOrganizingQuestListSchema = z
  .array(EvidenceOrganizingQuestSchema)
  .superRefine((items, ctx) => assertUniqueIds(items, ctx, "evidence-organizing quest"));

export const REFLECTION_MIN_LENGTH = 20;

/**
 * @param {import("zod").infer<typeof EvidenceOrganizingQuestSchema>} quest
 * @param {{ placements?: Record<string,string>, reflection?: string }} [state]
 */
export function renderEvidenceOrganizingQuest(quest, state = {}) {
  const placements = state.placements || {};
  const placedBySlot = new Map();
  quest.sources.forEach((source) => {
    const slotId = placements[source.id];
    if (!slotId) return;
    const existing = placedBySlot.get(slotId) || [];
    existing.push(source);
    placedBySlot.set(slotId, existing);
  });

  const reflectionLength = (state.reflection || "").trim().length;

  return `<section class="quest quest-evidence-organizing" data-quest-id="${escapeHtml(quest.id)}" data-quest-type="evidence-organizing">
  <p class="quest-prompt">${escapeHtml(quest.prompt)}</p>
  <div class="quest-evidence-sources">
    ${quest.sources
      .map((source) => {
        const placedSlotId = placements[source.id];
        const isPlaced = Boolean(placedSlotId);
        return `<article class="evidence-card${isPlaced ? " evidence-card--placed" : ""}" draggable="true" data-evidence-source="${escapeHtml(source.id)}" ${isPlaced ? `data-evidence-placed="true"` : ""}>
      <h3>${escapeHtml(source.label)}${isPlaced ? `<span class="evidence-placed-badge" aria-hidden="true">✓</span>` : ""}</h3>
      <p class="evidence-attribution">${escapeHtml(source.attribution)}</p>
      <p class="evidence-excerpt">${escapeHtml(source.excerpt)}</p>
      <label class="evidence-select-label">Place in
        <select data-evidence-select="${escapeHtml(source.id)}" data-quest-id="${escapeHtml(quest.id)}">
          <option value="">— place —</option>
          ${quest.slots
            .map(
              (slot) =>
                `<option value="${escapeHtml(slot.id)}" ${placedSlotId === slot.id ? "selected" : ""}>${escapeHtml(slot.label)}</option>`
            )
            .join("")}
        </select>
      </label>
    </article>`;
      })
      .join("")}
  </div>
  <div class="quest-evidence-slots">
    ${quest.slots
      .map((slot) => {
        const placed = placedBySlot.get(slot.id) || [];
        return `<div class="evidence-slot" data-evidence-slot="${escapeHtml(slot.id)}">
      <h4>${escapeHtml(slot.label)}</h4>
      ${
        placed.length
          ? placed
              .map(
                (source) =>
                  `<p class="evidence-slot-filled" data-evidence-slot-filled="${escapeHtml(source.id)}">${escapeHtml(source.label)}</p>`
              )
              .join("")
          : `<p class="evidence-slot-empty">Drop evidence here</p>`
      }
    </div>`;
      })
      .join("")}
  </div>
  ${
    quest.reflectionPrompt
      ? `<label class="quest-reflection">${escapeHtml(quest.reflectionPrompt)}
    <textarea data-evidence-reflection="${escapeHtml(quest.id)}">${escapeHtml(state.reflection || "")}</textarea>
  </label>
  <p class="quest-reflection-counter" data-evidence-reflection-counter="${escapeHtml(quest.id)}">${reflectionLength}/${REFLECTION_MIN_LENGTH} characters</p>`
      : ""
  }
</section>`;
}

/**
 * @param {import("zod").infer<typeof EvidenceOrganizingQuestSchema>} quest
 * @param {{ placements?: Record<string,string>, reflection?: string }} [state]
 */
export function gradeEvidenceOrganizingQuest(quest, state = {}) {
  const placements = state.placements || {};
  const allPlacedCorrectly = quest.sources.every(
    (source) => placements[source.id] === source.correctSlotId
  );
  const reflectionRequired = Boolean(quest.reflectionPrompt);
  const reflectionOk =
    !reflectionRequired ||
    (typeof state.reflection === "string" &&
      state.reflection.trim().length >= REFLECTION_MIN_LENGTH);
  return {
    allPlacedCorrectly,
    reflectionOk,
    complete: allPlacedCorrectly && reflectionOk,
  };
}

/** @param {{ placements?: Record<string,string> }} [state] */
export function evidenceOrganizingAnsweredAny(state = {}) {
  return Object.keys(state.placements || {}).length > 0;
}

/** @param {ReturnType<typeof gradeEvidenceOrganizingQuest>} result */
export function isEvidenceOrganizingComplete(result) {
  return !!result.complete;
}

// The one quest type with a real partial-credit UI state: every source is in
// the right slot, but the (optional) reflection gate still isn't satisfied.
// Callers use this to keep the "success"-styled feedback for that specific
// state rather than the plain not-yet-answered instruction.
/** @param {ReturnType<typeof gradeEvidenceOrganizingQuest>} result */
export function evidenceOrganizingPartialSuccess(result) {
  return !!result.allPlacedCorrectly && !result.reflectionOk;
}

/** @param {ReturnType<typeof gradeEvidenceOrganizingQuest>} result */
export function evidenceOrganizingHint(result) {
  return evidenceOrganizingPartialSuccess(result)
    ? "All records restored to the right slot. Add a reflection of at least a sentence to complete this challenge."
    : 'Drag each record into the slot it belongs in (or use the "Place in" menu on each card).';
}
