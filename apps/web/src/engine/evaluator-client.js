/**
 * Thin fetch wrapper around POST /api/evaluate (api/evaluate.js). Throws a
 * typed error carrying the HTTP status so callers can distinguish a
 * validation error (400) from rate-limiting (429) or a backend failure
 * (500/502) and show the right message.
 */

export class EvaluatorRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "EvaluatorRequestError";
    this.status = status;
  }
}

export async function evaluateSubmission(requestBody) {
  const response = await fetch("/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new EvaluatorRequestError(
      payload.error || `The Archive Evaluator request failed (${response.status}).`,
      response.status
    );
  }
  return payload; // { feedback, model }
}
