/**
 * Turns Manage Content's structured authoring-form text into real,
 * schema-shaped content objects (validated against the exact Zod schemas
 * scripts/validate-content.js and the quest engines already use), and back
 * again for pre-filling an edit form from existing content. Pure, no DOM/
 * network — the only io is text in, {ok, content|errors} out.
 *
 * List-shaped fields (choices, sequence items, evidence records, HIPP
 * prompts) use a compact line-based text convention rather than dynamic
 * add/remove rows, so the form stays a handful of labeled textareas instead
 * of a large stateful sub-form tree:
 *
 *  - MCQ choices: one per line, the correct one prefixed with "*".
 *  - Sequencing items: one per line, written in the CORRECT causal order —
 *    renderSequencingQuest()'s own doc comment warns an already-sorted
 *    authored array gives the answer away for free, so the stored item
 *    order is shuffled here while `position` (derived from the order the
 *    teacher actually typed) stays the real answer key.
 *  - Evidence-organizing sources / HIPP prompts: repeated "Key: value" line
 *    blocks separated by a blank line, parsed by parseBlocks()/parseFields().
 */
import { buildSourceSchema } from "../content/schemas/source.schema.js";
import { McqQuestSchema } from "../quest-types/generic/mcq-quest.js";
import { SequencingQuestSchema } from "../quest-types/generic/sequencing-quest.js";
import {
  EvidenceOrganizingQuestSchema,
  SKILL_CATEGORIES,
} from "../quest-types/history/evidence-organizing-quest.js";
import { SourceAnalysisQuestSchema, HIPP_DIMENSIONS } from "../quest-types/history/source-analysis-quest.js";

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

export function parseLines(text) {
  return (text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

// Splits a textarea's content into blank-line-separated blocks, then each
// block into { key: value } from "Key: value" lines — a value may continue
// onto following lines until the next "Key:" line or the block ends.
function parseBlocks(text) {
  return (text || "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const fields = {};
      let currentKey = null;
      for (const rawLine of block.split("\n")) {
        const line = rawLine.trim();
        const match = line.match(/^([A-Za-z][A-Za-z ]*):\s*(.*)$/);
        if (match) {
          currentKey = match[1].trim().toLowerCase();
          fields[currentKey] = match[2];
        } else if (currentKey) {
          fields[currentKey] = fields[currentKey] ? `${fields[currentKey]}\n${line}` : line;
        }
      }
      return fields;
    });
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
  return { prompt: "", choicesText: "", explanation: "" };
}

export function mcqToFields(quest) {
  const choicesText = (quest.choices || [])
    .map((choice, i) => `${i === quest.answer ? "*" : ""}${choice}`)
    .join("\n");
  return { prompt: quest.prompt || "", choicesText, explanation: quest.explanation || "" };
}

export function buildMcqContent(fields) {
  const lines = parseLines(fields.choicesText);
  if (lines.length < 2) {
    return { ok: false, errors: ["choices: enter at least 2 choices, one per line"] };
  }
  const correctLines = lines.filter((line) => line.startsWith("*"));
  if (correctLines.length !== 1) {
    return {
      ok: false,
      errors: [`choices: mark exactly one correct choice with a leading "*" (found ${correctLines.length})`],
    };
  }
  const choices = lines.map((line) => line.replace(/^\*/, "").trim());
  const answer = lines.findIndex((line) => line.startsWith("*"));
  const content = {
    id: shortId(fields.prompt),
    prompt: (fields.prompt || "").trim(),
    choices,
    answer,
    explanation: (fields.explanation || "").trim(),
  };
  const result = McqQuestSchema.safeParse(content);
  if (!result.success) return { ok: false, errors: issuesToMessages(result.error) };
  return { ok: true, content: result.data };
}

// --- Sequencing ---

export function defaultSequencingFields() {
  return { prompt: "", itemsText: "", explanation: "" };
}

export function sequencingToFields(quest) {
  const inOrder = [...(quest.items || [])].sort((a, b) => a.position - b.position);
  return { prompt: quest.prompt || "", itemsText: inOrder.map((item) => item.label).join("\n"), explanation: quest.explanation || "" };
}

export function buildSequencingContent(fields) {
  const labels = parseLines(fields.itemsText);
  if (labels.length < 2) {
    return { ok: false, errors: ["items: enter at least 2 items, one per line, in the correct order"] };
  }
  const positionByLabel = new Map(labels.map((label, position) => [label, position]));
  // Shuffle the stored order so the authored (correct) order isn't handed
  // to the student for free — position (from positionByLabel) is the real
  // answer key, matching renderSequencingQuest()'s documented convention.
  const shuffled = [...labels];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const items = shuffled.map((label) => ({
    id: shortId(label),
    label,
    position: positionByLabel.get(label),
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
  return { prompt: "", slotsText: "", sourcesText: "", reflectionPrompt: "" };
}

export function evidenceOrganizingToFields(quest) {
  const slotLabelById = new Map((quest.slots || []).map((slot) => [slot.id, slot.label]));
  const sourcesText = (quest.sources || [])
    .map(
      (source) =>
        `Label: ${source.label}\nAttribution: ${source.attribution}\nSkill: ${source.skillCategory}\nCorrect slot: ${slotLabelById.get(source.correctSlotId) || source.correctSlotId}\nExcerpt: ${source.excerpt}`
    )
    .join("\n\n");
  return {
    prompt: quest.prompt || "",
    slotsText: (quest.slots || []).map((slot) => slot.label).join("\n"),
    sourcesText,
    reflectionPrompt: quest.reflectionPrompt || "",
  };
}

export function buildEvidenceOrganizingContent(fields) {
  const slotLabels = parseLines(fields.slotsText);
  if (slotLabels.length < 2) {
    return { ok: false, errors: ["slots: enter at least 2 slots, one per line"] };
  }
  const slots = slotLabels.map((label) => ({ id: slugify(label), label }));
  const slotIdByLabel = new Map(slots.map((slot) => [slot.label.toLowerCase(), slot.id]));

  const blocks = parseBlocks(fields.sourcesText);
  if (blocks.length < 1) {
    return {
      ok: false,
      errors: [
        'sources: add at least one record block (Label / Attribution / Skill / Correct slot / Excerpt, one block per record, separated by a blank line)',
      ],
    };
  }
  const errors = [];
  const sources = blocks.map((block, index) => {
    const skillCategory = SKILL_CATEGORIES.find(
      (category) => category.toLowerCase() === (block.skill || "").trim().toLowerCase()
    );
    const correctSlotId = slotIdByLabel.get((block["correct slot"] || "").trim().toLowerCase());
    if (!skillCategory) {
      errors.push(`sources[${index}].skill: must be one of ${SKILL_CATEGORIES.join(", ")} (got "${block.skill || ""}")`);
    }
    if (!correctSlotId) {
      errors.push(`sources[${index}].correct slot: must exactly match one of the slot labels above (got "${block["correct slot"] || ""}")`);
    }
    return {
      id: shortId(block.label),
      label: (block.label || "").trim(),
      attribution: (block.attribution || "").trim(),
      excerpt: (block.excerpt || "").trim(),
      skillCategory: skillCategory || SKILL_CATEGORIES[0],
      correctSlotId: correctSlotId || slots[0].id,
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
      description: "Earn 1 point per record correctly matched to the slot its evidence best supports.",
    },
  };
  const result = EvidenceOrganizingQuestSchema.safeParse(content);
  if (!result.success) return { ok: false, errors: issuesToMessages(result.error) };
  return { ok: true, content: result.data };
}

// --- HIPP ---

export function defaultHippFields() {
  return { documentText: "", documentAttribution: "", promptsText: "" };
}

export function hippToFields(quest) {
  const promptsText = (quest.hippPrompts || [])
    .map((prompt) => {
      const optionLines = prompt.options.map((option) => {
        const prefix = option.correct ? "*" : option.identificationOnly ? "~" : "-";
        return `${prefix} ${option.text}`;
      });
      return `Dimension: ${prompt.dimension}\nArgument: ${prompt.argument}\nOptions:\n${optionLines.join("\n")}`;
    })
    .join("\n\n");
  return {
    documentText: quest.document?.text || "",
    documentAttribution: quest.document?.attribution || "",
    promptsText,
  };
}

// HIPP prompt blocks use their own parser (parseBlocks()'s "Key: value"
// convention doesn't fit the Options: list well) — split on "Dimension:"
// lines instead.
function parseHippPromptBlocks(text) {
  const blocks = [];
  let current = null;
  for (const rawLine of (text || "").split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const dimensionMatch = line.match(/^Dimension:\s*(.*)$/i);
    if (dimensionMatch) {
      if (current) blocks.push(current);
      current = { dimension: dimensionMatch[1].trim(), argument: "", options: [] };
      continue;
    }
    if (!current) continue;
    const argumentMatch = line.match(/^Argument:\s*(.*)$/i);
    if (argumentMatch) {
      current.argument = argumentMatch[1].trim();
      continue;
    }
    if (/^Options:?$/i.test(line)) continue;
    const optionMatch = line.match(/^([*~-])\s*(.*)$/);
    if (optionMatch) {
      current.options.push({
        text: optionMatch[2].trim(),
        correct: optionMatch[1] === "*",
        identificationOnly: optionMatch[1] === "~",
      });
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

export function buildHippContent(fields) {
  const promptBlocks = parseHippPromptBlocks(fields.promptsText);
  if (!promptBlocks.length) {
    return {
      ok: false,
      errors: [
        'prompts: add at least one "Dimension: / Argument: / Options:" block — mark the correct option with "*" and the identification-only distractor with "~"',
      ],
    };
  }
  const errors = [];
  const hippPrompts = promptBlocks.map((block, index) => {
    const dimension = HIPP_DIMENSIONS.find((d) => d.toLowerCase() === block.dimension.toLowerCase());
    if (!dimension) {
      errors.push(`prompts[${index}].dimension: must be one of ${HIPP_DIMENSIONS.join(", ")} (got "${block.dimension}")`);
    }
    return {
      id: shortId(block.dimension),
      dimension: dimension || HIPP_DIMENSIONS[0],
      argument: block.argument,
      options: block.options.map((option, oi) => ({ id: shortId(`${block.dimension}-${oi}`), ...option })),
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

// --- Dispatch ---

const BUILDERS = {
  source: buildSourceContent,
  mcq: buildMcqContent,
  sequencing: buildSequencingContent,
  "evidence-organizing": buildEvidenceOrganizingContent,
  hipp: buildHippContent,
};

const DEFAULT_FIELDS = {
  source: defaultSourceFields,
  mcq: defaultMcqFields,
  sequencing: defaultSequencingFields,
  "evidence-organizing": defaultEvidenceOrganizingFields,
  hipp: defaultHippFields,
};

const TO_FIELDS = {
  source: sourceToFields,
  mcq: mcqToFields,
  sequencing: sequencingToFields,
  "evidence-organizing": evidenceOrganizingToFields,
  hipp: hippToFields,
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
