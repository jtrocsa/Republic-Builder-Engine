import { describe, it, expect, vi, beforeEach } from "vitest";

let fromResult = { data: null, error: null };
function makeQueryBuilder() {
  const builder = {
    select: () => builder,
    eq: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    single: () => Promise.resolve(fromResult),
    then: (resolve, reject) => Promise.resolve(fromResult).then(resolve, reject),
  };
  return builder;
}

vi.mock("../../apps/web/src/lib/supabase-client.js", () => ({
  supabase: { from: vi.fn(() => makeQueryBuilder()) },
}));

vi.mock("../../apps/web/src/repositories/remote-auth-repository.js", () => ({
  getSession: vi.fn().mockResolvedValue({ user: { id: "teacher-1" } }),
}));

import {
  listCustomContentForCase,
  createCustomContent,
  updateCustomContent,
  deleteCustomContent,
} from "../../apps/web/src/repositories/remote-custom-content-repository.js";

beforeEach(() => {
  fromResult = { data: null, error: null };
});

describe("listCustomContentForCase", () => {
  it("returns the rows for the given classroom/case", async () => {
    fromResult = { data: [{ id: "item-1", mode: "addition" }], error: null };
    const rows = await listCustomContentForCase("classroom-1", "case-001");
    expect(rows).toEqual([{ id: "item-1", mode: "addition" }]);
  });

  it("throws on a Supabase error", async () => {
    fromResult = { data: null, error: new Error("boom") };
    await expect(listCustomContentForCase("classroom-1", "case-001")).rejects.toThrow("boom");
  });
});

describe("createCustomContent", () => {
  it("inserts a row and returns it", async () => {
    fromResult = { data: { id: "item-2", mode: "replacement" }, error: null };
    const row = await createCustomContent({
      classroomId: "classroom-1",
      caseId: "case-001",
      slotKind: "mcq",
      mode: "replacement",
      replacesOfficialId: "case-001-mcq-taino-sourcing",
      relatedSourceId: "taino-context",
      content: { id: "x", prompt: "P" },
    });
    expect(row.id).toBe("item-2");
  });
});

describe("updateCustomContent", () => {
  it("patches only the provided fields", async () => {
    fromResult = { data: { id: "item-2", status: "published" }, error: null };
    const row = await updateCustomContent("item-2", { status: "published" });
    expect(row.status).toBe("published");
  });
});

describe("deleteCustomContent", () => {
  it("resolves when the delete succeeds", async () => {
    fromResult = { data: null, error: null };
    await expect(deleteCustomContent("item-2")).resolves.toBeUndefined();
  });

  it("throws on a Supabase error", async () => {
    fromResult = { data: null, error: new Error("nope") };
    await expect(deleteCustomContent("item-2")).rejects.toThrow("nope");
  });
});
