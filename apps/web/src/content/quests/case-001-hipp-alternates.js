// Curated pool of teacher-selectable alternates for Case 1.01's HIPP Source
// Analysis quest — Teacher Mode's "swap a question" picker, generalized
// from the source+MCQ-only pattern established by
// case-001-mcq-alternates.js to the history Source Analysis (HIPP) quest
// type (apps/web/src/quest-types/history/source-analysis-quest.js). Each
// entry's `quest` object is validated against the same
// SourceAnalysisQuestSchema shape as UNIT_01_SOURCE_ANALYSIS_QUESTS
// (apps/web/src/content/quests/unit-01-quests.js). `replacesQuestId` must
// match a real UNIT_01_SOURCE_ANALYSIS_QUESTS id.
//
// Proof-of-pipeline seed (one alternate for one slot) — extending coverage
// to more quests or other units is pure content work.
//
// This alternate analyzes the exact same document as the official quest —
// Columbus's 1493 letter to Rafael Sánchez — but tags the two HIPP
// dimensions the official quest does NOT use (Historical situation and
// Point of view, instead of Intended audience and Purpose), giving a
// teacher a different pedagogical angle on the identical primary source.
export const CASE_001_HIPP_ALTERNATES = [
  {
    replacesQuestId: "case-001-hipp-columbus-letter",
    quest: {
      id: "case-001-hipp-columbus-letter-alt-situation-and-viewpoint",
      prompt:
        "Analyze Columbus's 1493 letter to Rafael Sánchez using HIPP reasoning. For each dimension below, choose the option that explains how or why it shapes the letter's argument — not the option that merely names the correct answer.",
      document: {
        text: "Since I know you will be pleased at the great victory our Lord has given me in this voyage, I write to tell you that in thirty-three days I passed from the Canary Islands to the Indies, where I found very many islands, and took possession of all of them for their Highnesses. The people of these islands are so guileless and generous with all they possess that no one would believe it without seeing it; whatever is asked of them, they never refuse, and they show as much love as if they gave their hearts. I have found gold in some rivers, and on the island they call Hispaniola there are mines of metal in great quantity. I am confident that, with a little more help from Your Highnesses, I shall bring back as much gold as is needed, and as much spice and cotton as their ships can carry, together with people to be converted to our holy faith.",
        attribution: "Christopher Columbus, Letter to Rafael Sánchez, 1493",
      },
      hippPrompts: [
        {
          id: "columbus-historical-situation",
          dimension: "Historical situation",
          argument:
            "The letter was written in 1493, immediately after Spain's Reconquista concluded and while Portugal already held established, lucrative trade routes to Africa and Asia — this competitive urgency shapes Columbus's rush to report profitable discoveries and formally claim territory.",
          options: [
            {
              id: "situation-explained",
              text: "Because Spain had only just unified after the Reconquista and faced a rival, Portugal, that already controlled established trade routes to Africa and Asia, Columbus emphasizes gold, valuable goods, and formal possession of the islands to stake Spain's claim quickly, before rivals could contest it.",
              correct: true,
            },
            {
              id: "situation-named-only",
              text: "The letter was written in 1493, shortly after Spain's Reconquista ended and while Portugal controlled established trade routes to Africa and Asia.",
              identificationOnly: true,
              correct: false,
            },
            {
              id: "situation-wrong-posthumous",
              text: "The letter was compiled decades after Columbus's death by court historians summarizing his voyages from memory.",
              correct: false,
            },
            {
              id: "situation-wrong-shipwreck",
              text: "The letter was written during a prolonged shipwreck that stranded Columbus's crew for a year before any rescue arrived.",
              correct: false,
            },
          ],
        },
        {
          id: "columbus-point-of-view",
          dimension: "Point of view",
          argument:
            "As the expedition's commander, standing to gain noble titles, a governorship, and a share of future profits promised under the Capitulations of Santa Fe, Columbus had personal incentive to describe the islands' peoples as uniformly compliant and generous.",
          options: [
            {
              id: "viewpoint-explained",
              text: "Because Columbus stood to gain noble titles, a governorship, and a share of profits under the Capitulations of Santa Fe, his point of view as an interested commander leads him to portray the islanders as uniformly guileless and generous — a framing that served his case for continued backing rather than a neutral account.",
              correct: true,
            },
            {
              id: "viewpoint-named-only",
              text: "Columbus wrote as the commander of the expedition, a Genoese mariner sailing under the authority of the Spanish crown.",
              identificationOnly: true,
              correct: false,
            },
            {
              id: "viewpoint-wrong-auditor",
              text: "Columbus wrote from the point of view of a neutral royal auditor sent afterward to verify other officers' claims about the voyage.",
              correct: false,
            },
            {
              id: "viewpoint-wrong-caciques",
              text: "The letter reflects the collective point of view of the Taíno caciques, who reviewed and approved its wording before it was sent.",
              correct: false,
            },
          ],
        },
      ],
    },
  },
];
