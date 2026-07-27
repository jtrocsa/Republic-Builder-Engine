import { describe, it, expect } from "vitest";
import {
  manageContentPreviewResolutionForAction,
  contentPreviewVersionLabel,
} from "../../apps/web/src/main.js";

// manageContentPreviewResolutionForAction() is the fix for a confirmed real
// bug: enterContentPreview() used to always resolve "draft" regardless of
// which action triggered it, so a teacher who published, then made further
// unsaved edits, and then clicked "Preview Published Mission" would see
// those newer edits instead of the actual published content the button
// claims to show. This pure mapping is what both enterContentPreview()'s
// call sites and this test agree on, so the label and the actual behavior
// can't drift apart again.
describe("manageContentPreviewResolutionForAction", () => {
  it("resolves 'published' for Preview Published Mission — the confirmed bug's fix", () => {
    expect(manageContentPreviewResolutionForAction("preview-published-mission")).toBe("published");
  });

  it("resolves 'draft' for Preview Standard Mission (Step 1 -> Step 2)", () => {
    expect(manageContentPreviewResolutionForAction("wizard-go-preview")).toBe("draft");
  });

  it("resolves 'draft' for a map mission's Preview as student", () => {
    expect(manageContentPreviewResolutionForAction("toggle-content-preview")).toBe("draft");
  });

  it("returns null for preview-authoring-changes — it never calls enterContentPreview() at all", () => {
    expect(manageContentPreviewResolutionForAction("preview-authoring-changes")).toBeNull();
  });

  it("returns null for an unrelated action", () => {
    expect(manageContentPreviewResolutionForAction("save-authoring-draft")).toBeNull();
  });
});

// contentPreviewVersionLabel() backs the preview banner's version text —
// exactly 3 real, distinguishable labels, deliberately not a 4th "current
// student version" (Published *is* the current student version by
// definition — see the function's own doc comment for why a 4th label
// would either duplicate that or fabricate a distinction the data model
// can't back).
describe("contentPreviewVersionLabel", () => {
  it("reports 'Your unsaved edits' whenever an in-memory preview quest exists, regardless of resolution", () => {
    expect(contentPreviewVersionLabel(true, "draft")).toBe("Your unsaved edits");
    expect(contentPreviewVersionLabel(true, "published")).toBe("Your unsaved edits");
    expect(contentPreviewVersionLabel(true, undefined)).toBe("Your unsaved edits");
  });

  it("reports 'Published version' when resolution is published and there's no unsaved preview quest", () => {
    expect(contentPreviewVersionLabel(false, "published")).toBe("Published version");
  });

  it("reports 'Draft version' when resolution is draft (or unset) and there's no unsaved preview quest", () => {
    expect(contentPreviewVersionLabel(false, "draft")).toBe("Draft version");
    expect(contentPreviewVersionLabel(false, undefined)).toBe("Draft version");
  });
});
