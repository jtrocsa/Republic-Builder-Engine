/**
 * Turns Manage Content's structured authoring-form fields into real,
 * schema-shaped content objects (validated against the exact Zod schemas
 * scripts/validate-content.js and the quest engines already use), and back
 * again for pre-filling an edit form from existing content. Pure, no DOM/
 * network — the only io is a fields object in, {ok, content|errors} out.
 *
 * List-shaped fields (choices, sequence items, evidence slots/sources, HIPP
 * prompts/options) are structured row arrays, one array entry per editable
 * row in the UI, addressed positionally (no persisted synthetic row id is
 * needed — schema-level ids for choices/items/sources/options are generated
 * here at build time via shortId/slugify, same as before).
 *
 *  - MCQ choices: [{ text, correct }] — exactly one row must be correct.
 *  - Sequencing items: [{ label, position }], position 0-based. The stored
 *    item order is shuffled independently of `position` before saving —
 *    renderSequencingQuest()'s own doc comment warns an already-sorted
 *    authored array gives the answer away for free, so `position` (set
 *    directly by the teacher) stays the real answer key.
 *  - Evidence-organizing sources reference slots by id (`correctSlotId`),
 *    resolved live against the current slot rows rather than by matching
 *    free-text labels.
 */
import { buildSourceSchema } from "../content/schemas/source.schema.js";
import { McqQuestSchema } from "../quest-types/generic/mcq-quest.js";
import { SequencingQuestSchema } from "../quest-types/generic/sequencing-quest.js";
import {
  EvidenceOrganizingQuestSchema,
  SKILL_CATEGORIES,
} from "../quest-types/history/evidence-organizing-quest.js";
import {
  SourceAnalysisQuestSchema,
  HIPP_DIMENSIONS,
} from "../quest-types/history/source-analysis-quest.js";
import { ExchangeRecordSchema } from "../content/schemas/exchange-record.schema.js";

export function slugify(text, fallback = "item") {
  const slug = (text || "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function shortId(text) {
  return `custom-${slugify(text)}-${Math.random().toString(36).slice(2, 7)}`;
}

function issuesToMessages(error) {
  return error.issues.map((issue) => `${issue.path.join(".") || "content"}: ${issue.message}`);
}

// --- Source ---
//
// A source carries several engine-wiring fields (visual, activityRoute,
// feedback, citation, externalUrl, reconstruction, investigationMode/
// investigationQuestId) that a teacher shouldn't hand-edit through a text
// form — they control which reader visual renders, field-jigsaw routing,
// and Investigation Challenge gating, not "what the source says." Editing
// always starts from an existing official source, so buildSourceContent
// carries those fields forward unchanged from `wiring` (the source object
// being edited) rather than exposing them as form fields.

export function defaultSourceFields() {
  return { type: "", title: "", creator: "", date: "", record: "", excerpt: "", prompt: "" };
}

export function sourceToFields(source) {
  return {
    type: source.type || "",
    title: source.title || "",
    creator: source.creator || "",
    date: source.date || "",
    record: source.record || "",
    excerpt: source.excerpt || "",
    prompt: source.prompt || "",
  };
}

export function buildSourceContent(fields, wiring) {
  const content = {
    ...wiring,
    id: shortId(fields.title),
    type: (fields.type || "").trim(),
    title: (fields.title || "").trim(),
    creator: (fields.creator || "").trim(),
    date: (fields.date || "").trim(),
    record: (fields.record || "").trim(),
    excerpt: (fields.excerpt || "").trim(),
    prompt: (fields.prompt || "").trim(),
  };
  const result = buildSourceSchema().safeParse(content);
  if (!result.success) return { ok: false, errors: issuesToMessages(result.error) };
  return { ok: true, content: result.data };
}

// --- MCQ ---

export function defaultMcqFields() {
  return {
    prompt: "",
    choices: [
      { text: "", correct: true },
      { text: "", correct: false },
    ],
    explanation: "",
  };
}

export function mcqToFields(quest) {
  return {
    prompt: quest.prompt || "",
    choices: (quest.choices || []).map((text, i) => ({ text, correct: i === quest.answer })),
    explanation: quest.explanation || "",
  };
}

export function buildMcqContent(fields) {
  const choices = Array.isArray(fields.choices) ? fields.choices : [];
  if (choices.length < 2) {
    return { ok: false, errors: ["choices: add at least 2 choices"] };
  }
  const correctCount = choices.filter((choice) => choice.correct).length;
  if (correctCount !== 1) {
    return {
      ok: false,
      errors: [`choices: mark exactly one choice correct (found ${correctCount})`],
    };
  }
  const content = {
    id: shortId(fields.prompt),
    prompt: (fields.prompt || "").trim(),
    choices: choices.map((choice) => (choice.text || "").trim()),
    answer: choices.findIndex((choice) => choice.correct),
    explanation: (fields.explanation || "").trim(),
  };
  const result = McqQuestSchema.safeParse(content);
  if (!result.success) return { ok: false, errors: issuesToMessages(result.error) };
  return { ok: true, content: result.data };
}

// --- Sequencing ---

export function defaultSequencingFields() {
  return {
    prompt: "",
    items: [
      { label: "", position: 0 },
      { label: "", position: 1 },
    ],
    explanation: "",
  };
}

export function sequencingToFields(quest) {
  const items = [...(quest.items || [])]
    .sort((a, b) => a.position - b.position)
    .map((item, i) => ({ label: item.label, position: i }));
  return { prompt: quest.prompt || "", items, explanation: quest.explanation || "" };
}

export function buildSequencingContent(fields) {
  const rows = Array.isArray(fields.items) ? fields.items : [];
  if (rows.length < 2) {
    return { ok: false, errors: ["items: add at least 2 items"] };
  }
  const positions = rows.map((row) => row.position);
  const isValidPermutation =
    new Set(positions).size === rows.length && positions.every((p) => p >= 0 && p < rows.length);
  if (!isValidPermutation) {
    return {
      ok: false,
      errors: ["items: each item must have a unique position from 1 to the number of items"],
    };
  }
  // Shuffle the stored order so the authored (correct) order isn't handed
  // to the student for free — `position` (set directly by the teacher) is
  // the real answer key, matching renderSequencingQuest()'s documented
  // convention.
  const shuffledIndices = rows.map((_, i) => i);
  for (let i = shuffledIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
  }
  const items = shuffledIndices.map((i) => ({
    id: shortId(rows[i].label),
    label: (rows[i].label || "").trim(),
    position: positions[i],
  }));
  const content = {
    id: shortId(fields.prompt),
    prompt: (fields.prompt || "").trim(),
    items,
    explanation: (fields.explanation || "").trim() || undefined,
  };
  const result = SequencingQuestSchema.safeParse(content);
  if (!result.success) return { ok: false, errors: issuesToMessages(result.error) };
  return { ok: true, content: result.data };
}

// --- Evidence organizing ---

export function defaultEvidenceOrganizingFields() {
  return {
    prompt: "",
    slots: [{ label: "" }, { label: "" }],
    sources: [
      {
        label: "",
        attribution: "",
        excerpt: "",
        skillCategory: SKILL_CATEGORIES[0],
        correctSlotId: "",
      },
    ],
    reflectionPrompt: "",
  };
}

export function evidenceOrganizingToFields(quest) {
  return {
    prompt: quest.prompt || "",
    slots: (quest.slots || []).map((slot) => ({ label: slot.label })),
    sources: (quest.sources || []).map((source) => ({
      label: source.label,
      attribution: source.attribution,
      excerpt: source.excerpt,
      skillCategory: source.skillCategory,
      correctSlotId: source.correctSlotId,
    })),
    reflectionPrompt: quest.reflectionPrompt || "",
  };
}

export function buildEvidenceOrganizingContent(fields) {
  const slotRows = Array.isArray(fields.slots) ? fields.slots : [];
  if (slotRows.length < 2) {
    return { ok: false, errors: ["slots: add at least 2 slots"] };
  }
  const slots = slotRows.map((row) => ({
    id: slugify(row.label),
    label: (row.label || "").trim(),
  }));
  const slotIds = new Set(slots.map((slot) => slot.id));

  const sourceRows = Array.isArray(fields.sources) ? fields.sources : [];
  if (sourceRows.length < 1) {
    return { ok: false, errors: ["sources: add at least 1 evidence record"] };
  }
  const errors = [];
  const sources = sourceRows.map((row, index) => {
    const skillCategory = SKILL_CATEGORIES.includes(row.skillCategory) ? row.skillCategory : null;
    if (!skillCategory) {
      errors.push(`sources[${index}].skillCategory: must be one of ${SKILL_CATEGORIES.join(", ")}`);
    }
    if (!slotIds.has(row.correctSlotId)) {
      errors.push(`sources[${index}].correctSlotId: must reference one of the current slots`);
    }
    return {
      id: shortId(row.label),
      label: (row.label || "").trim(),
      attribution: (row.attribution || "").trim(),
      excerpt: (row.excerpt || "").trim(),
      skillCategory: skillCategory || SKILL_CATEGORIES[0],
      correctSlotId: slotIds.has(row.correctSlotId) ? row.correctSlotId : slots[0].id,
    };
  });
  if (errors.length) return { ok: false, errors };

  const usedSkillCategories = [...new Set(sources.map((source) => source.skillCategory))];
  const content = {
    id: shortId(fields.prompt),
    prompt: (fields.prompt || "").trim(),
    slots,
    sources,
    reflectionPrompt: (fields.reflectionPrompt || "").trim() || undefined,
    rubric: {
      skillCategories: usedSkillCategories,
      pointsTotal: sources.length,
      description:
        "Earn 1 point per record correctly matched to the slot its evidence best supports.",
    },
  };
  const result = EvidenceOrganizingQuestSchema.safeParse(content);
  if (!result.success) return { ok: false, errors: issuesToMessages(result.error) };
  return { ok: true, content: result.data };
}

// --- HIPP ---

export function defaultHippFields() {
  return {
    documentText: "",
    documentAttribution: "",
    hippPrompts: [
      {
        dimension: HIPP_DIMENSIONS[0],
        argument: "",
        options: [
          { text: "", correct: true, identificationOnly: false },
          { text: "", correct: false, identificationOnly: true },
          { text: "", correct: false, identificationOnly: false },
        ],
      },
    ],
  };
}

export function hippToFields(quest) {
  return {
    documentText: quest.document?.text || "",
    documentAttribution: quest.document?.attribution || "",
    hippPrompts: (quest.hippPrompts || []).map((prompt) => ({
      dimension: prompt.dimension,
      argument: prompt.argument,
      options: (prompt.options || []).map((option) => ({
        text: option.text,
        correct: option.correct,
        identificationOnly: option.identificationOnly,
      })),
    })),
  };
}

export function buildHippContent(fields) {
  const promptRows = Array.isArray(fields.hippPrompts) ? fields.hippPrompts : [];
  if (promptRows.length < 1) {
    return { ok: false, errors: ["prompts: add at least 1 HIPP prompt"] };
  }
  const errors = [];
  const hippPrompts = promptRows.map((prompt, index) => {
    const dimension = HIPP_DIMENSIONS.includes(prompt.dimension) ? prompt.dimension : null;
    if (!dimension) {
      errors.push(`prompts[${index}].dimension: must be one of ${HIPP_DIMENSIONS.join(", ")}`);
    }
    const optionRows = Array.isArray(prompt.options) ? prompt.options : [];
    return {
      id: shortId(prompt.dimension),
      dimension: dimension || HIPP_DIMENSIONS[0],
      argument: (prompt.argument || "").trim(),
      options: optionRows.map((option, oi) => ({
        id: shortId(`${prompt.dimension}-${oi}`),
        text: (option.text || "").trim(),
        correct: !!option.correct,
        identificationOnly: !!option.identificationOnly,
      })),
    };
  });
  if (errors.length) return { ok: false, errors };

  const content = {
    id: shortId(fields.documentAttribution),
    prompt: `Analyze this document using HIPP reasoning for the dimension(s) below.`,
    document: {
      text: (fields.documentText || "").trim(),
      attribution: (fields.documentAttribution || "").trim(),
    },
    hippPrompts,
  };
  const result = SourceAnalysisQuestSchema.safeParse(content);
  if (!result.success) return { ok: false, errors: issuesToMessages(result.error) };
  return { ok: true, content: result.data };
}

// --- Ledger record (Case 1.02's Exchange Ledger) ---
//
// Combines a small source card and its one inline MCQ in a single object —
// see ledgerRecordFieldsMarkup()'s doc comment in main.js. Choices are
// authored the same [{ text, correct }] shape as MCQ's, flattened to
// ExchangeRecordSchema's { choices: string[], answer: index } at build time.

export function defaultLedgerRecordFields() {
  return {
    label: "",
    icon: "",
    sourceTitle: "",
    sourceMeta: "",
    excerpt: "",
    sourceNote: "",
    question: "",
    choices: [
      { text: "", correct: true },
      { text: "", correct: false },
    ],
    citation: "",
  };
}

export function ledgerRecordToFields(record) {
  return {
    label: record.label || "",
    icon: record.icon || "",
    sourceTitle: record.sourceTitle || "",
    sourceMeta: record.sourceMeta || "",
    excerpt: record.excerpt || "",
    sourceNote: record.sourceNote || "",
    question: record.question || "",
    choices: (record.choices || []).map((text, i) => ({ text, correct: i === record.answer })),
    citation: record.citation || "",
  };
}

export function buildLedgerRecordContent(fields) {
  const choices = Array.isArray(fields.choices) ? fields.choices : [];
  if (choices.length < 2) {
    return { ok: false, errors: ["choices: add at least 2 choices"] };
  }
  const correctCount = choices.filter((choice) => choice.correct).length;
  if (correctCount !== 1) {
    return {
      ok: false,
      errors: [`choices: mark exactly one choice correct (found ${correctCount})`],
    };
  }
  const content = {
    id: shortId(fields.label),
    label: (fields.label || "").trim(),
    icon: (fields.icon || "").trim(),
    sourceTitle: (fields.sourceTitle || "").trim(),
    sourceMeta: (fields.sourceMeta || "").trim(),
    excerpt: (fields.excerpt || "").trim(),
    sourceNote: (fields.sourceNote || "").trim(),
    question: (fields.question || "").trim(),
    choices: choices.map((choice) => (choice.text || "").trim()),
    answer: choices.findIndex((choice) => choice.correct),
    citation: (fields.citation || "").trim(),
  };
  const result = ExchangeRecordSchema.safeParse(content);
  if (!result.success) return { ok: false, errors: issuesToMessages(result.error) };
  return { ok: true, content: result.data };
}

// --- Dispatch ---

const BUILDERS = {
  source: buildSourceContent,
  mcq: buildMcqContent,
  sequencing: buildSequencingContent,
  "evidence-organizing": buildEvidenceOrganizingContent,
  hipp: buildHippContent,
  "ledger-record": buildLedgerRecordContent,
};

const DEFAULT_FIELDS = {
  source: defaultSourceFields,
  mcq: defaultMcqFields,
  sequencing: defaultSequencingFields,
  "evidence-organizing": defaultEvidenceOrganizingFields,
  hipp: defaultHippFields,
  "ledger-record": defaultLedgerRecordFields,
};

const TO_FIELDS = {
  source: sourceToFields,
  mcq: mcqToFields,
  sequencing: sequencingToFields,
  "evidence-organizing": evidenceOrganizingToFields,
  hipp: hippToFields,
  "ledger-record": ledgerRecordToFields,
};

export function buildAuthoredContent(slotKind, fields, sourceWiring) {
  const builder = BUILDERS[slotKind];
  if (!builder) return { ok: false, errors: [`Unknown content type "${slotKind}".`] };
  return slotKind === "source" ? builder(fields, sourceWiring) : builder(fields);
}

export function defaultAuthoringFields(slotKind) {
  return (DEFAULT_FIELDS[slotKind] || defaultMcqFields)();
}

export function authoringFieldsFromContent(slotKind, content) {
  return (TO_FIELDS[slotKind] || mcqToFields)(content);
}
