/**
 * POST /api/evaluate — the Archive Evaluator.
 *
 * Takes a student submission, selects the rubric by taskType, calls Claude
 * (Haiku) with structured output, and returns formative feedback — never a
 * grade. ANTHROPIC_API_KEY is read from the server environment only (Vercel
 * env vars in production, .env.local for `vercel dev`); it never reaches the
 * client bundle.
 */
import Anthropic from "@anthropic-ai/sdk";
import { RUBRICS } from "./_lib/rubrics.js";

const MODEL = "claude-haiku-4-5";
const MAX_RESPONSE_CHARS = 20000;

const client = new Anthropic();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const {
    taskType,
    taskId,
    prompt,
    studentResponse,
    sourceMetadata,
    elementsAsked,
    stimulus,
    isRevision,
  } = req.body ?? {};

  const rubric = RUBRICS[taskType];
  if (!rubric) {
    return res
      .status(400)
      .json({ error: `No AI rubric for taskType "${taskType}" — score this task locally.` });
  }
  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "prompt is required" });
  }
  if (typeof studentResponse !== "string" || !studentResponse.trim()) {
    return res.status(400).json({ error: "studentResponse is required" });
  }
  if (studentResponse.length > MAX_RESPONSE_CHARS) {
    return res.status(400).json({ error: "studentResponse is too long" });
  }

  const submission = {
    task_type: taskType,
    task_id: taskId ?? null,
    prompt,
    source_metadata: sourceMetadata ?? null,
    elements_asked: Array.isArray(elementsAsked) ? elementsAsked : null,
    stimulus: stimulus ?? null,
    is_revision: Boolean(isRevision),
    student_response: studentResponse,
  };

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: rubric.systemPrompt,
      output_config: { format: { type: "json_schema", schema: rubric.outputSchema } },
      messages: [{ role: "user", content: JSON.stringify(submission) }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock) {
      return res.status(502).json({ error: "The Archive returned an empty evaluation." });
    }

    return res.status(200).json({ feedback: JSON.parse(textBlock.text), model: MODEL });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "The Archive is busy — try again in a moment." });
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Archive Evaluator API error", err.status, err.message);
      return res
        .status(502)
        .json({ error: "The Archive could not evaluate this record right now." });
    }
    console.error("Archive Evaluator unexpected error", err);
    return res.status(500).json({ error: "Unexpected evaluator error." });
  }
}
