import { describe, it, expect } from "vitest";
import { manageContentSlotStatus } from "../../apps/web/src/main.js";

// manageContentSlotStatus() derives the Manage Content command bar's status
// badge purely from the slot data loadManageContentCaseData() already loads
// plus the transient pending/lastActionFailed/draftSavedSincePublish flags
// set around each save/publish action — see its own doc comment in main.js.
// Covers every branch: pending/failure states take priority over the
// slot's own draft/published data, an unset slot has no activity yet, no
// draft/published alt means the official version is untouched, matching
// draft/published ids mean a draft was published as-is, differing ids mean
// an unpublished draft exists, and draftSavedSincePublish overrides a
// same-id false "Published" reading — the known blind spot where editing
// an already-customized slot reuses its existing custom_content_items row,
// so draftAltId doesn't change even though the row's content just did.
describe("manageContentSlotStatus", () => {
  it("reports Saving… while a save/publish is in flight, regardless of slot state", () => {
    expect(manageContentSlotStatus(null, true, null, false)).toEqual({
      key: "saving",
      label: "Saving…",
    });
  });

  it("reports Save failed / Publish failed distinctly, taking priority over slot state", () => {
    const slot = { draftAltId: "a", publishedAltId: "a" };
    expect(manageContentSlotStatus(slot, false, "save", false)).toEqual({
      key: "failed",
      label: "Save failed",
    });
    expect(manageContentSlotStatus(slot, false, "publish", false)).toEqual({
      key: "failed",
      label: "Publish failed",
    });
  });

  it("reports no activity yet when the case has no official quest slot", () => {
    expect(manageContentSlotStatus(null, false, null, false)).toEqual({
      key: "none",
      label: "No activity yet",
    });
  });

  it("reports Official version when neither a draft nor a published alt exists", () => {
    expect(
      manageContentSlotStatus({ draftAltId: null, publishedAltId: null }, false, null, false)
    ).toEqual({ key: "official", label: "Official version" });
  });

  it("reports Published once a draft has been published as-is (draft and published ids match)", () => {
    expect(
      manageContentSlotStatus(
        { draftAltId: "custom-1", publishedAltId: "custom-1" },
        false,
        null,
        false
      )
    ).toEqual({ key: "published", label: "Published" });
  });

  it("reports Draft changes when a saved draft hasn't been published yet", () => {
    expect(
      manageContentSlotStatus(
        { draftAltId: "custom-2", publishedAltId: "custom-1" },
        false,
        null,
        false
      )
    ).toEqual({ key: "draft", label: "Draft changes (not yet visible to students)" });
  });

  it("reports Draft changes via draftSavedSincePublish even when draft/published ids still match", () => {
    // The blind spot: a teacher edits an already-customized slot further —
    // persistAuthoringSelection() reuses the same custom_content_items row,
    // so draftAltId/publishedAltId look identical even though the content
    // was just updated. draftSavedSincePublish is the session-local signal
    // that catches this.
    expect(
      manageContentSlotStatus(
        { draftAltId: "custom-1", publishedAltId: "custom-1" },
        false,
        null,
        true
      )
    ).toEqual({ key: "draft", label: "Draft changes (not yet visible to students)" });
  });
});
