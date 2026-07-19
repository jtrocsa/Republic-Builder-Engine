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
