/**
 * Pure request-body builders for POST /api/evaluate — kept dependency-free
 * (no fetch, no Supabase) so field mapping is unit-testable on its own. See
 * api/_lib/rubrics.js for the rubric each taskType maps to.
 */

export function buildHippEvaluationRequest(source, studentResponse, priorSubmission) {
  return {
    taskType: "hipp-sourcing",
    taskId: source.id,
    prompt: source.prompt,
    stimulus: source.excerpt,
    sourceMetadata: {
      creator: source.creator,
      date: source.date,
      type: source.type,
      record: source.record,
    },
    elementsAsked: source.hippElementsAsked || [],
    studentResponse,
    isRevision: Boolean(priorSubmission),
  };
}

// One call for the whole 3-part SAQ, matching SAQ_OUTPUT_SCHEMA's `rows`
// shape (part-a/part-b/part-c) — not one call per part.
export function buildSaqEvaluationRequest(unit, review, saqAnswers, priorSubmission) {
  const prompts = review.saq.prompts;
  const studentResponse = prompts
    .map((prompt, index) => `${prompt}\n${(saqAnswers[index] || "").trim()}`)
    .join("\n\n");
  return {
    taskType: "saq",
    taskId: `saq-${unit.id}`,
    prompt: prompts.join(" "),
    stimulus: review.saq.stimulus,
    sourceMetadata: null,
    elementsAsked: null,
    studentResponse,
    isRevision: Boolean(priorSubmission),
  };
}

// Same "saq" taskType/rubric as buildSaqEvaluationRequest above, but for a
// per-quest-instance SAQ (apps/web/src/quest-types/history/saq-quest.js)
// rather than the unit-level Archive Review SAQ block — the only difference
// is taskId is derived from the quest's own id, not a unit id, and the quest
// shape (quest.prompts/quest.stimulus) already matches review.saq's shape.
export function buildSaqQuestEvaluationRequest(quest, responses, priorSubmission) {
  const prompts = quest.prompts;
  const studentResponse = prompts
    .map((prompt, index) => `${prompt}\n${(responses[index] || "").trim()}`)
    .join("\n\n");
  return {
    taskType: "saq",
    taskId: `saq-quest-${quest.id}`,
    prompt: prompts.join(" "),
    stimulus: quest.stimulus,
    sourceMetadata: null,
    elementsAsked: null,
    studentResponse,
    isRevision: Boolean(priorSubmission),
  };
}

// Phase 49E: the "dbq" taskType/rubric (api/_lib/rubrics.js) is content-
// independent (same 7-row structure regardless of the actual prompt/
// documents), same as every other written-response rubric here — only the
// stimulus/prompt/taskId vary per quest instance. `stimulus` concatenates
// every document's label/attribution/date/excerpt so the evaluator can
// check document use and sourcing against the real documents, not just the
// student's response in isolation.
export function buildDbqEvaluationRequest(quest, response, priorSubmission) {
  const stimulus = quest.documents
    .map((doc) => `${doc.label} (${doc.attribution}, ${doc.date}): ${doc.excerpt}`)
    .join("\n\n");
  return {
    taskType: "dbq",
    taskId: `dbq-quest-${quest.id}`,
    prompt: quest.prompt,
    stimulus,
    sourceMetadata: null,
    elementsAsked: null,
    studentResponse: response,
    isRevision: Boolean(priorSubmission),
  };
}
