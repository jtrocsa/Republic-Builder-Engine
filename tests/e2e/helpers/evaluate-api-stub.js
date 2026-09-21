/**
 * **The third door: `POST /api/evaluate`, the Archive Evaluator.**
 *
 * `supabase-stub.js` answers `*.supabase.co` and `roster-api-stub.js` answers `/api/roster/*`.
 * This is the one remaining thing the game talks to, and it is the one a **student** talks to:
 * every written response in Chronicle — a source reading in the field, a unit's Archive Review SAQ,
 * an SAQ or DBQ Archive Challenge — is sent here, and the reply is the only feedback that student
 * ever reads on their own writing.
 *
 * It had no stub, so none of that was walkable. Under `npm run dev` the path does not exist at all
 * (Vite serves `apps/web`, not `api/`), and in production it costs a real Claude call per press.
 * So until now **nothing in the suite had ever seen an evaluator response rendered**, on any screen,
 * for any task type — and the first thing this stub was pointed at found that the written rubrics'
 * `met` value reached the student raw. See decision log `0149`.
 *
 * **What is under test is the client half**, exactly as `roster-api-stub.js` says of its own four
 * endpoints: the request builders, the pending/error states, the markup, and the row that lands in
 * `submissions` afterwards. The endpoint body is not — it runs on Vercel and calls a model, and a
 * fixture cannot vouch for what a model writes.
 *
 * What this file owes it is its **contract**: the validation branches it refuses on, the status
 * codes it refuses with, and the payload shape it returns. The first two are copied from
 * `api/evaluate.js` deliberately, because an error message the client can never provoke is a branch
 * that may as well not exist.
 *
 * **The reply's shape is derived from `RUBRICS`, never hand-written.** `api/_lib/rubrics.js` holds
 * the JSON schema the real endpoint hands the model, so the enum of rubric rows, the enum of `met`
 * values and the enum of readiness verdicts are all read back out of it here. A hand-written
 * fixture drifts from the schema silently and then defends the drift — which had already happened
 * once: `teacher-classroom-with-students.spec.js` carried an SAQ feedback blob in the **HIPP**
 * shape, under a comment claiming it was the SAQ schema's, with `element` values in neither enum.
 * Nothing could tell, because nothing else had ever produced one.
 */

import { RUBRICS } from "../../../api/_lib/rubrics.js";

/** `api/evaluate.js`'s own model id, which the app stores beside the feedback and shows a teacher. */
const MODEL = "claude-haiku-4-5";

/** `api/evaluate.js`'s own cap. Copied so the client's "too long" branch is reachable. */
const MAX_RESPONSE_CHARS = 20000;

/** The enum a schema node declares, or a loud failure — a renamed field must not answer `[]`. */
function enumOf(node, what) {
  if (!Array.isArray(node?.enum) || node.enum.length === 0) {
    throw new Error(
      `api/_lib/rubrics.js no longer declares an enum for ${what}. This stub builds its reply out ` +
        "of the schema on purpose, so a renamed field has to stop the run rather than answer with " +
        "a shape the client has never seen."
    );
  }
  return node.enum;
}

/**
 * One evaluator reply, in whichever of the two shapes this task type's schema declares.
 *
 * The `met` values **cycle** through the schema's enum rather than taking one value, so a single
 * press renders every verdict the rubric can return. That is the point: the defect this stub was
 * written to find was in how one of those verdicts is printed, and a response that says the same
 * thing on every row would have shown one third of it.
 */
function feedbackFor(taskType, body, options) {
  const schema = RUBRICS[taskType].outputSchema;
  const verdicts = enumOf(schema.properties.readiness, `${taskType}'s readiness`);
  if (!verdicts.includes(options.readiness)) {
    throw new Error(
      `"${options.readiness}" is not a readiness ${taskType}'s rubric can return. The three are: ` +
        verdicts.join(", ")
    );
  }
  const reply = { forward: options.forward, readiness: options.readiness };

  if (schema.properties.elements) {
    const declared = enumOf(
      schema.properties.elements.items.properties.element,
      `${taskType}'s elements`
    );
    const asked = (Array.isArray(body.elementsAsked) ? body.elementsAsked : []).filter((element) =>
      declared.includes(element)
    );
    return {
      elements: (asked.length ? asked : declared).map((element, index) => ({
        element,
        mirror: `${options.mirror} (${element})`,
        gap: index === 0 ? "" : options.gap,
      })),
      ...reply,
    };
  }

  const rowItem = schema.properties.rows.items.properties;
  const metValues = enumOf(rowItem.met, `${taskType}'s met`);
  return {
    rows: enumOf(rowItem.row, `${taskType}'s rows`).map((row, index) => {
      const met = metValues[index % metValues.length];
      return {
        row,
        met,
        mirror: `${options.mirror} (${row})`,
        // The rubric's own instruction is that `gap` is empty when the row is met.
        gap: met === "yes" ? "" : options.gap,
      };
    }),
    ...reply,
  };
}

/**
 * Answer every `POST /api/evaluate` on this page without leaving the machine.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{
 *   readiness?: string,
 *   forward?: string,
 *   mirror?: string,
 *   gap?: string,
 *   fail?: {status: number, error: string} | null,
 * }} [options] `fail` short-circuits every call with that status and body, which is how the
 *   client's 429/502 branches are reached; the rest are the strings the reply carries, so a spec
 *   can assert that the sentence the evaluator wrote is the sentence on the screen.
 * @returns {Promise<{requests: object[], failWith: (fail: {status: number, error: string} | null) => void}>}
 *   `requests` is every body the client sent, in order — which is what proves the request builders
 *   put the student's whole answer in the envelope.
 */
export async function stubEvaluator(page, options = {}) {
  const settings = {
    readiness: options.readiness || "on_track",
    forward: options.forward || "Name the party the Acts were written against.",
    mirror: options.mirror || "You state a claim and attach a document to it.",
    gap: options.gap || "The claim does not yet say who it excludes.",
  };
  let fail = options.fail || null;
  const requests = [];

  await page.route("**/api/evaluate", async (route) => {
    const request = route.request();
    const json = (status, payload) =>
      route.fulfill({ status, contentType: "application/json", body: JSON.stringify(payload) });

    if (request.method() !== "POST") return json(405, { error: "POST only" });

    let body;
    try {
      body = JSON.parse(request.postData() || "{}");
    } catch {
      body = {};
    }
    requests.push(body);

    if (fail) return json(fail.status, { error: fail.error });

    // `api/evaluate.js`'s four refusals, in its own order and its own words.
    if (!RUBRICS[body.taskType]) {
      return json(400, {
        error: `No AI rubric for taskType "${body.taskType}" — score this task locally.`,
      });
    }
    if (typeof body.prompt !== "string" || !body.prompt.trim()) {
      return json(400, { error: "prompt is required" });
    }
    if (typeof body.studentResponse !== "string" || !body.studentResponse.trim()) {
      return json(400, { error: "studentResponse is required" });
    }
    if (body.studentResponse.length > MAX_RESPONSE_CHARS) {
      return json(400, { error: "studentResponse is too long" });
    }

    return json(200, { feedback: feedbackFor(body.taskType, body, settings), model: MODEL });
  });

  return {
    requests,
    /** Turn failure on or off mid-test, so one page can walk the refusal and then the recovery. */
    failWith: (next) => {
      fail = next;
    },
  };
}
