import { describe, it, expect } from "vitest";
import {
  deriveStudentLoginEmail,
  validateJoinCode,
  validateStudentIdCode,
  validatePassword,
} from "../../apps/web/src/engine/auth-flows.js";

describe("deriveStudentLoginEmail", () => {
  it("builds a deterministic synthetic email from classroom id and student code", () => {
    expect(deriveStudentLoginEmail("classroom-123", "07")).toBe(
      "student-classroom-123-07@chronicle.invalid"
    );
  });

  it("produces different emails for different student codes in the same classroom", () => {
    expect(deriveStudentLoginEmail("classroom-123", "07")).not.toBe(
      deriveStudentLoginEmail("classroom-123", "08")
    );
  });

  it("produces different emails for the same student code in different classrooms", () => {
    expect(deriveStudentLoginEmail("classroom-123", "07")).not.toBe(
      deriveStudentLoginEmail("classroom-456", "07")
    );
  });
});

describe("validateJoinCode", () => {
  it("accepts a plausible classroom code", () => {
    expect(validateJoinCode("FOX7K2")).toBe(true);
  });

  it("rejects an empty or too-short code", () => {
    expect(validateJoinCode("")).toBe(false);
    expect(validateJoinCode("FX7")).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(validateJoinCode(undefined)).toBe(false);
    expect(validateJoinCode(null)).toBe(false);
  });
});

describe("validateStudentIdCode", () => {
  it("accepts a non-empty code", () => {
    expect(validateStudentIdCode("07")).toBe(true);
  });

  it("rejects an empty or whitespace-only code", () => {
    expect(validateStudentIdCode("")).toBe(false);
    expect(validateStudentIdCode("   ")).toBe(false);
  });
});

describe("validatePassword", () => {
  it("accepts a password of at least 8 characters", () => {
    expect(validatePassword("longenough")).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(validatePassword("short")).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(validatePassword(undefined)).toBe(false);
  });
});
