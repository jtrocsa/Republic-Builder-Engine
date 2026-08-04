// The story rules that are cheap to state and cheap to break by accident.
//
// Phase 78 wrote Chronicle's temporal canon down (docs/design/CHRONICLE-CANON.md, decision log
// 0061). Three of its rules are enforceable, and each protects against a different kind of drift
// between the documents and the game:
//
//   1. The banned phrasing. Six technical-sounding phrases that mean nothing and pull the game
//      toward science fiction and away from history. They are easy to type and nobody would notice
//      one for a phase.
//   2. The canon itself. The five travel rules and the operational rule are referenced by four
//      other documents; a later edit that drops one silently un-anchors all of them.
//   3. The teacher/story firewall. `activityRoute` decides which mission a record opens. It must
//      never become a teacher-editable form field, or a classroom could change locked map story.
//
// Deliberately does NOT scan docs/ for the banned phrases: CHRONICLE-CANON.md lists them in order
// to ban them, and a scan that cannot tell a ban from a use would fail on its own rule book.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

import {
  defaultSourceFields,
  sourceToFields,
} from "../../apps/web/src/engine/custom-content-authoring.js";

// Resolved off the repo root rather than import.meta.url: Vitest rewrites that to a non-file URL
// and readdirSync rejects it. Same reason as tests/unit/activity-content.test.js.
const ROOT = process.cwd();

/** Every .js file under a directory, recursively. */
function jsFilesUnder(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return jsFilesUnder(full);
    return full.endsWith(".js") ? [full] : [];
  });
}

/** Markdown with emphasis, blockquote markers and wrapping removed, so a rule can span two lines. */
function flatten(markdown) {
  return markdown
    .replace(/^\s*>\s?/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

describe("Chronicle canon", () => {
  // CHRONICLE-CANON.md §8. Each of these sounds precise and says nothing, and every one of them
  // describes history as a machine that can break rather than as a record that can be argued with.
  //
  // `record drift` was added in Phase 81B, and it is the only entry here that had actually
  // shipped. The Director's briefing defined it as "fragments of the past changing, vanishing, or
  // contradicting each other" — which is the precise list canon §6 exists to keep the word *drift*
  // away from. A source can be incomplete, biased, unverified or flatly contradicted by another
  // source without anyone having travelled anywhere; those are the historian's problems and they
  // take the historian's words. Calling them a temporal event teaches a student something false
  // about history, which is the failure this whole document was written to prevent.
  //
  // Note this bans the *phrase*, not the word. `drift` on its own is used all over the codebase in
  // its ordinary engineering sense — two values drifting out of sync — and about twenty comments
  // depend on that still being allowed. A looser pattern here would fail on all of them and be
  // deleted within a phase, which is worse than no rule.
  const BANNED = [
    "temporal integrity",
    "quantum record",
    "anchor instability",
    "causal resonance",
    "timeline corruption",
    "one true timeline",
    "record drift",
  ];

  it("ships none of the banned science-fiction phrasing", () => {
    const files = [
      ...jsFilesUnder(join(ROOT, "apps/web/src/content")),
      ...jsFilesUnder(join(ROOT, "apps/web/src/engine")),
      join(ROOT, "apps/web/src/main.js"),
    ];

    const offenders = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8").replace(/\s+/g, " ").toLowerCase();
      for (const phrase of BANNED) {
        if (text.includes(phrase)) offenders.push(`${file.slice(ROOT.length + 1)}: "${phrase}"`);
      }
    }

    expect(offenders, "banned phrasing reached shipped code").toEqual([]);
  });

  // The five rules are the whole of how travel works. Four other documents cite them by number, so
  // dropping or rewording one turns those citations into pointers at nothing.
  it("still states all five travel rules and the operational rule", () => {
    const canon = flatten(readFileSync(join(ROOT, "docs/design/CHRONICLE-CANON.md"), "utf8"));

    const rules = [
      "Surviving objects retain temporal imprints.",
      "Anchor glass makes those imprints accessible.",
      "The Navigation Table opens a passage through a strong imprint.",
      "A lasting intervention causes temporal drift.",
      "The Codex preserves evidence recorded before that drift changed the present.",
    ];
    for (const rule of rules) {
      expect(canon, `travel rule missing: ${rule}`).toContain(rule);
    }

    expect(canon, "the operational rule is missing").toContain(
      "Enter carefully. Observe freely. Preserve evidence. Change only what is necessary to stop " +
        "an outside alteration."
    );
  });

  // The seam that keeps a classroom out of locked map story. A source's `activityRoute` names the
  // engine a record opens; custom-content-authoring.js carries it forward from the source being
  // edited rather than exposing it, so a teacher can restate what a source *says* but never change
  // which mission it *is*. See docs/design/MAP-NARRATIVE-STRUCTURE.md §2.
  it("never exposes a source's engine wiring as a teacher-editable field", () => {
    const wiring = [
      "activityRoute",
      "visual",
      "feedback",
      "citation",
      "externalUrl",
      "reconstruction",
      "investigationMode",
      "investigationQuestId",
    ];

    const blank = Object.keys(defaultSourceFields());
    // A fully-populated source, so the assertion cannot pass merely because a key was undefined.
    const populated = Object.keys(
      sourceToFields({
        type: "letter",
        title: "A record",
        creator: "Someone",
        date: "1623",
        record: "A record",
        excerpt: "An excerpt",
        prompt: "A prompt",
        activityRoute: "interview",
        visual: "map",
        investigationMode: "reader",
      })
    );

    for (const field of wiring) {
      expect(blank, `defaultSourceFields() exposes ${field}`).not.toContain(field);
      expect(populated, `sourceToFields() leaks ${field}`).not.toContain(field);
    }
  });
});
