import { describe, it, expect } from "vitest";
import {
  DbqQuestSchema,
  DbqQuestListSchema,
  renderDbqQuest,
  gradeDbqQuest,
  dbqAnsweredAny,
  isDbqComplete,
  dbqPartialSuccess,
  dbqHint,
  DBQ_MIN_RESPONSE_LENGTH,
} from "../../apps/web/src/quest-types/history/dbq-quest.js";

const document = (id) => ({
  id: `doc-${id}`,
  label: `Document ${id}`,
  attribution: `Sample creator ${id}`,
  date: "1776",
  excerpt: `Sample excerpt text for document ${id}.`,
});

const validQuest = {
  id: "sample-dbq",
  prompt: "Evaluate the extent to which a sample development changed the sample era.",
  documents: [document(1), document(2), document(3), document(4)],
  rubric: "DBQ practice rubric: 7 points total.",
};

const LONG_RESPONSE = "a".repeat(DBQ_MIN_RESPONSE_LENGTH);

describe("DbqQuestSchema", () => {
  it("accepts a well-formed quest with 4 documents (normal case)", () => {
    expect(DbqQuestSchema.safeParse(validQuest).success).toBe(true);
  });

  it("accepts a real 7-document quest (normal case)", () => {
    const sevenDocs = { ...validQuest, documents: [1, 2, 3, 4, 5, 6, 7].map(document) };
    expect(DbqQuestSchema.safeParse(sevenDocs).success).toBe(true);
  });

  it("rejects a quest missing an id (invalid/missing data)", () => {
    const withoutId = { ...validQuest };
    delete withoutId.id;
    expect(DbqQuestSchema.safeParse(withoutId).success).toBe(false);
  });

  it("rejects a quest with fewer than 4 documents (boundary case)", () => {
    expect(
      DbqQuestSchema.safeParse({ ...validQuest, documents: [document(1), document(2)] }).success
    ).toBe(false);
  });

  it("rejects a quest with more than 9 documents (boundary case)", () => {
    const tenDocs = { ...validQuest, documents: Array.from({ length: 10 }, (_, i) => document(i)) };
    expect(DbqQuestSchema.safeParse(tenDocs).success).toBe(false);
  });

  it("rejects duplicate document ids within one quest (duplicate ID)", () => {
    const result = DbqQuestSchema.safeParse({
      ...validQuest,
      documents: [document(1), document(1), document(2), document(3)],
    });
    expect(result.success).toBe(false);
    expect(
      result.error.issues.some((issue) => issue.message.includes("Duplicate document id"))
    ).toBe(true);
  });
});

describe("DbqQuestListSchema", () => {
  it("rejects a duplicate quest id (duplicate ID)", () => {
    const result = DbqQuestListSchema.safeParse([validQuest, { ...validQuest }]);
    expect(result.success).toBe(false);
    expect(
      result.error.issues.some((issue) => issue.message.includes("Duplicate dbq quest id"))
    ).toBe(true);
  });
});

describe("renderDbqQuest", () => {
  it("renders the prompt, rubric, and every document (normal case)", () => {
    const html = renderDbqQuest(validQuest);
    expect(html).toContain("Evaluate the extent to which");
    expect(html).toContain("DBQ practice rubric");
    validQuest.documents.forEach((doc) => {
      expect(html).toContain(doc.excerpt);
      expect(html).toContain(doc.label);
    });
  });

  it("fills in a saved response (normal case)", () => {
    const html = renderDbqQuest(validQuest, { response: "My draft thesis" });
    expect(html).toContain("My draft thesis");
  });

  it("escapes HTML in the prompt/document text (invalid/missing data)", () => {
    const html = renderDbqQuest({ ...validQuest, prompt: '<script>alert("x")</script>' });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("gradeDbqQuest", () => {
  it("is complete once the response reaches the minimum length (normal case)", () => {
    expect(gradeDbqQuest(validQuest, { response: LONG_RESPONSE }).complete).toBe(true);
  });

  it("is not complete below the minimum length (boundary case)", () => {
    expect(gradeDbqQuest(validQuest, { response: "too short" }).complete).toBe(false);
  });

  it("is not complete with no state (normal case)", () => {
    expect(gradeDbqQuest(validQuest, {}).complete).toBe(false);
  });
});

describe("dbqAnsweredAny", () => {
  it("is true once there is any non-whitespace text (normal case)", () => {
    expect(dbqAnsweredAny({ response: "a" })).toBe(true);
  });

  it("is false with no state or only whitespace (boundary case)", () => {
    expect(dbqAnsweredAny({})).toBe(false);
    expect(dbqAnsweredAny()).toBe(false);
    expect(dbqAnsweredAny({ response: "   " })).toBe(false);
  });
});

describe("isDbqComplete", () => {
  it("matches gradeDbqQuest's complete field (normal case)", () => {
    expect(isDbqComplete(gradeDbqQuest(validQuest, { response: LONG_RESPONSE }))).toBe(true);
    expect(isDbqComplete(gradeDbqQuest(validQuest, {}))).toBe(false);
  });
});

describe("dbqPartialSuccess", () => {
  it("is always false — no invented partial-credit state, matching saq/mcq/hipp (normal case)", () => {
    expect(dbqPartialSuccess(gradeDbqQuest(validQuest, { response: "a start" }))).toBe(false);
  });

  it("is false once complete, and false with nothing written yet (boundary case)", () => {
    expect(dbqPartialSuccess(gradeDbqQuest(validQuest, { response: LONG_RESPONSE }))).toBe(false);
    expect(dbqPartialSuccess(gradeDbqQuest(validQuest, {}))).toBe(false);
  });
});

describe("dbqHint", () => {
  it("returns a non-empty instructive string in every state (normal case)", () => {
    expect(dbqHint().length).toBeGreaterThan(0);
    expect(dbqHint(gradeDbqQuest(validQuest, { response: "a start" })).length).toBeGreaterThan(0);
    expect(dbqHint(gradeDbqQuest(validQuest, { response: LONG_RESPONSE })).length).toBeGreaterThan(
      0
    );
  });
});
