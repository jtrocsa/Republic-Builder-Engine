// Minimal quest-type lookup — not a registry, not a plugin-discovery system.
// Adding a third quest type later means one more entry here; nothing else
// changes. See docs/architecture/QUEST-TYPE-ARCHITECTURE.md for why this is
// deliberately this small (PlatformCore/QuestEngine renderer registries
// remain a separate, deferred, cross-subject concern — see
// docs/architecture/ARCHITECTURE-QUICKREF.md §8).
import {
  McqQuestSchema,
  McqQuestListSchema,
  renderMcqQuest,
  gradeMcqQuest,
  mcqAnsweredAny,
  isMcqComplete,
  mcqPartialSuccess,
  mcqHint,
} from "./generic/mcq-quest.js";
import {
  SequencingQuestSchema,
  SequencingQuestListSchema,
  renderSequencingQuest,
  gradeSequencingQuest,
  sequencingAnsweredAny,
  isSequencingComplete,
  sequencingPartialSuccess,
  sequencingHint,
} from "./generic/sequencing-quest.js";
import {
  EvidenceOrganizingQuestSchema,
  EvidenceOrganizingQuestListSchema,
  renderEvidenceOrganizingQuest,
  gradeEvidenceOrganizingQuest,
  evidenceOrganizingAnsweredAny,
  isEvidenceOrganizingComplete,
  evidenceOrganizingPartialSuccess,
  evidenceOrganizingHint,
} from "./history/evidence-organizing-quest.js";
import {
  SourceAnalysisQuestSchema,
  SourceAnalysisQuestListSchema,
  renderSourceAnalysisQuest,
  gradeSourceAnalysisQuest,
  hippAnsweredAny,
  isHippComplete,
  hippPartialSuccess,
  hippHint,
} from "./history/source-analysis-quest.js";

// Key naming note: the evidence-organizing entry keeps the key
// "evidence-organizing" (established in Phase 8, already wired into
// local-content-repository.js/validate-content.js/tests) rather than the
// shorter "evidence" a later planning note suggested — renaming a shipped
// key for no functional reason isn't worth the churn.
// answeredAny/isComplete/partialSuccess/hint let a screen derive a uniform
// completion/status story without branching on questType itself — added to
// close a real, confirmed duplication where main.js independently re-derived
// this exact logic twice (once for Archive/Investigation Challenges, once for
// Practice Check), disagreeing on HIPP's partial-credit wording between the
// two. See docs/architecture/FOCUSED-UI-AND-MECHANICS-REUSE-AUDIT.md §3.
export const QUEST_TYPES = {
  mcq: {
    schema: McqQuestSchema,
    listSchema: McqQuestListSchema,
    render: renderMcqQuest,
    grade: gradeMcqQuest,
    answeredAny: mcqAnsweredAny,
    isComplete: isMcqComplete,
    partialSuccess: mcqPartialSuccess,
    hint: mcqHint,
  },
  sequencing: {
    schema: SequencingQuestSchema,
    listSchema: SequencingQuestListSchema,
    render: renderSequencingQuest,
    grade: gradeSequencingQuest,
    answeredAny: sequencingAnsweredAny,
    isComplete: isSequencingComplete,
    partialSuccess: sequencingPartialSuccess,
    hint: sequencingHint,
  },
  "evidence-organizing": {
    schema: EvidenceOrganizingQuestSchema,
    listSchema: EvidenceOrganizingQuestListSchema,
    render: renderEvidenceOrganizingQuest,
    grade: gradeEvidenceOrganizingQuest,
    answeredAny: evidenceOrganizingAnsweredAny,
    isComplete: isEvidenceOrganizingComplete,
    partialSuccess: evidenceOrganizingPartialSuccess,
    hint: evidenceOrganizingHint,
  },
  hipp: {
    schema: SourceAnalysisQuestSchema,
    listSchema: SourceAnalysisQuestListSchema,
    render: renderSourceAnalysisQuest,
    grade: gradeSourceAnalysisQuest,
    answeredAny: hippAnsweredAny,
    isComplete: isHippComplete,
    partialSuccess: hippPartialSuccess,
    hint: hippHint,
  },
};

function requireQuestType(questType) {
  const type = QUEST_TYPES[questType];
  if (!type) {
    throw new Error(
      `Unknown quest type "${questType}" — known types: ${Object.keys(QUEST_TYPES).join(", ")}`
    );
  }
  return type;
}

export function renderQuest(questType, quest, state) {
  return requireQuestType(questType).render(quest, state);
}

export function gradeQuest(questType, quest, state) {
  return requireQuestType(questType).grade(quest, state);
}

export function questAnsweredAny(questType, state) {
  return requireQuestType(questType).answeredAny(state);
}

export function isQuestComplete(questType, result) {
  return requireQuestType(questType).isComplete(result);
}

export function questPartialSuccess(questType, result) {
  return requireQuestType(questType).partialSuccess(result);
}

export function questHint(questType, result) {
  return requireQuestType(questType).hint(result);
}
