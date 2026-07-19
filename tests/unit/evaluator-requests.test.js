import { describe, it, expect } from "vitest";
import {
  buildHippEvaluationRequest,
  buildSaqEvaluationRequest,
} from "../../apps/web/src/engine/evaluator-requests.js";

const SOURCE = {
  id: "columbus-letter",
  type: "Primary source · letter",
  creator: "Christopher Columbus",
  date: "1493",
  record: "Letter to Rafael Sánchez, written after the first voyage",
  prompt: "How do the creator and intended audience shape what this letter emphasizes?",
  excerpt: "They are so ingenuous and free with all they have...",
  hippElementsAsked: ["intended_audience", "purpose", "point_of_view"],
};

describe("buildHippEvaluationRequest", () => {
  it("maps a source's fields onto the api/evaluate.js request shape", () => {
    const request = buildHippEvaluationRequest(SOURCE, "My initial reading.", null);
    expect(request).toEqual({
      taskType: "hipp-sourcing",
      taskId: "columbus-letter",
      prompt: SOURCE.prompt,
      stimulus: SOURCE.excerpt,
      sourceMetadata: {
        creator: SOURCE.creator,
        date: SOURCE.date,
        type: SOURCE.type,
        record: SOURCE.record,
      },
      elementsAsked: SOURCE.hippElementsAsked,
      studentResponse: "My initial reading.",
      isRevision: false,
    });
  });

  it("marks isRevision true when a prior submission is passed", () => {
    const request = buildHippEvaluationRequest(SOURCE, "Revised reading.", { some: "prior" });
    expect(request.isRevision).toBe(true);
  });

  it("defaults elementsAsked to an empty array when the source has none tagged", () => {
    const { hippElementsAsked, ...sourceWithoutElements } = SOURCE;
    void hippElementsAsked;
    const request = buildHippEvaluationRequest(sourceWithoutElements, "text", null);
    expect(request.elementsAsked).toEqual([]);
  });
});

describe("buildSaqEvaluationRequest", () => {
  const unit = { id: "unit-01" };
  const review = {
    saq: {
      stimulus: "A quoted primary source stimulus.",
      prompts: ["A. Identify one feature.", "B. Explain one change.", "C. Explain one cause."],
    },
  };

  it("concatenates all three SAQ parts into one studentResponse, in prompt order", () => {
    const answers = { 0: "Answer A", 1: "Answer B", 2: "Answer C" };
    const request = buildSaqEvaluationRequest(unit, review, answers, null);

    expect(request.taskType).toBe("saq");
    expect(request.taskId).toBe("saq-unit-01");
    expect(request.stimulus).toBe(review.saq.stimulus);
    expect(request.elementsAsked).toBeNull();
    expect(request.isRevision).toBe(false);
    expect(request.studentResponse).toBe(
      "A. Identify one feature.\nAnswer A\n\nB. Explain one change.\nAnswer B\n\nC. Explain one cause.\nAnswer C"
    );
  });

  it("treats a missing answer for a part as an empty string rather than throwing", () => {
    const answers = { 0: "Answer A" };
    const request = buildSaqEvaluationRequest(unit, review, answers, null);
    expect(request.studentResponse).toContain("B. Explain one change.\n\n");
  });

  it("marks isRevision true when a prior submission is passed", () => {
    const request = buildSaqEvaluationRequest(unit, review, {}, { some: "prior" });
    expect(request.isRevision).toBe(true);
  });
});
