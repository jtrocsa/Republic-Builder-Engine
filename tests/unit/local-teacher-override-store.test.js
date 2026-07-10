import { describe, it, expect, beforeEach } from "vitest";
import { UNIT_01 } from "../../apps/web/src/content/unit-01-campaign.js";
import {
  getOverride,
  hasOverride,
  resolveField,
  setOverride,
  clearOverride,
  clearAllOverrides,
} from "../../apps/web/src/repositories/local-teacher-override-store.js";

const STORAGE_KEY = "republic-builder.chronicle.teacher-overrides.v1";

beforeEach(() => {
  localStorage.clear();
});

describe("no stored override", () => {
  it("resolveField falls back to the official value when nothing is stored", () => {
    expect(resolveField(UNIT_01.id, "title", UNIT_01.title)).toBe(UNIT_01.title);
    expect(hasOverride(UNIT_01.id, "title")).toBe(false);
  });

  it("leaves the official UNIT_01 content object untouched", () => {
    const before = JSON.stringify(UNIT_01);
    resolveField(UNIT_01.id, "title", UNIT_01.title);
    expect(JSON.stringify(UNIT_01)).toBe(before);
  });
});

describe("saving an override", () => {
  it("persists a field override under the stable content id", () => {
    setOverride(UNIT_01.id, "title", "A Teacher-Edited Unit Title");
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(hasOverride(UNIT_01.id, "title")).toBe(true);
  });

  it("rejects unsupported field names without writing anything", () => {
    setOverride(UNIT_01.id, "notARealField", "should not save");
    expect(hasOverride(UNIT_01.id, "notARealField")).toBe(false);
  });
});

describe("reloading an override", () => {
  it("returns the same override value from a fresh read (simulated page refresh)", () => {
    setOverride(UNIT_01.id, "centralQuestion", "A teacher-edited guiding question?");
    // Re-read directly from localStorage rather than an in-memory cache, the
    // way a fresh page load would.
    expect(getOverride(UNIT_01.id, "centralQuestion")).toBe(
      "A teacher-edited guiding question?"
    );
  });
});

describe("resolving override over official value", () => {
  it("prefers the override once one exists", () => {
    setOverride(UNIT_01.id, "title", "Overridden Title");
    expect(resolveField(UNIT_01.id, "title", UNIT_01.title)).toBe("Overridden Title");
  });

  it("resolves per field independently — overriding title does not affect centralQuestion", () => {
    setOverride(UNIT_01.id, "title", "Overridden Title");
    expect(resolveField(UNIT_01.id, "centralQuestion", UNIT_01.centralQuestion)).toBe(
      UNIT_01.centralQuestion
    );
  });
});

describe("clearing an override", () => {
  it("clearOverride removes just the one field and resolution falls back to official", () => {
    setOverride(UNIT_01.id, "title", "Overridden Title");
    clearOverride(UNIT_01.id, "title");
    expect(hasOverride(UNIT_01.id, "title")).toBe(false);
    expect(resolveField(UNIT_01.id, "title", UNIT_01.title)).toBe(UNIT_01.title);
  });

  it("clearOverride on a field with no override is a harmless no-op", () => {
    expect(() => clearOverride(UNIT_01.id, "title")).not.toThrow();
    expect(hasOverride(UNIT_01.id, "title")).toBe(false);
  });

  it("clearAllOverrides removes every field for a content id at once (panel reset control)", () => {
    setOverride(UNIT_01.id, "title", "Overridden Title");
    setOverride(UNIT_01.id, "centralQuestion", "Overridden question?");
    clearAllOverrides(UNIT_01.id);
    expect(hasOverride(UNIT_01.id, "title")).toBe(false);
    expect(hasOverride(UNIT_01.id, "centralQuestion")).toBe(false);
  });
});

describe("preserving unrelated overrides", () => {
  it("clearing one field leaves a sibling field override on the same content id intact", () => {
    setOverride(UNIT_01.id, "title", "Overridden Title");
    setOverride(UNIT_01.id, "centralQuestion", "Overridden question?");
    clearOverride(UNIT_01.id, "title");
    expect(hasOverride(UNIT_01.id, "centralQuestion")).toBe(true);
  });

  it("setting an override for one content id leaves another content id's overrides intact", () => {
    setOverride(UNIT_01.id, "title", "Overridden Unit 1 Title");
    setOverride("unit-02", "title", "Overridden Unit 2 Title");
    expect(getOverride(UNIT_01.id, "title")).toBe("Overridden Unit 1 Title");
    expect(getOverride("unit-02", "title")).toBe("Overridden Unit 2 Title");
  });
});

describe("malformed stored data", () => {
  it("treats non-JSON stored data as no overrides, without throwing", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");
    expect(() => resolveField(UNIT_01.id, "title", UNIT_01.title)).not.toThrow();
    expect(resolveField(UNIT_01.id, "title", UNIT_01.title)).toBe(UNIT_01.title);
  });

  it("treats a stored array (wrong top-level shape) as no overrides", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["not", "an", "object"]));
    expect(hasOverride(UNIT_01.id, "title")).toBe(false);
  });

  it("drops an unsupported field name but keeps a valid sibling field on the same content id", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        [UNIT_01.id]: { title: "Valid Override", someFutureField: "should be dropped" },
      })
    );
    expect(getOverride(UNIT_01.id, "title")).toBe("Valid Override");
    expect(hasOverride(UNIT_01.id, "someFutureField")).toBe(false);
  });

  it("drops a non-string field value but keeps other valid entries", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        [UNIT_01.id]: { title: 12345 },
        "unit-02": { title: "Still Valid" },
      })
    );
    expect(hasOverride(UNIT_01.id, "title")).toBe(false);
    expect(getOverride("unit-02", "title")).toBe("Still Valid");
  });
});
