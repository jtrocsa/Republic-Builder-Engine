// Curated pool of teacher-selectable alternates for Case 1.01 Practice
// Check MCQ quests — Teacher Mode's "swap a question" picker. Each entry's
// `quest` object is validated against the same McqQuestSchema shape as
// UNIT_01_MCQ_QUESTS (see scripts/validate-content.js). `replacesQuestId`
// must match a real UNIT_01_MCQ_QUESTS id — checked by validate-content.js's
// checkAlternateReferences.
//
// Proof-of-pipeline seed (one alternate for one slot) — extending coverage
// to more quests or other units is pure content work.
export const CASE_001_MCQ_ALTERNATES = [
  {
    replacesQuestId: "case-001-mcq-taino-sourcing",
    quest: {
      id: "case-001-mcq-taino-sourcing-alt-authorship",
      prompt:
        "A student wants to know exactly what daily life was like in a Taíno village in 1490. What is the biggest limitation of using the Library of Congress exhibition text to answer that question?",
      choices: [
        "It was written centuries after 1490 by people summarizing existing scholarship, not by anyone who lived it",
        "It focuses only on Spanish colonial administration",
        "It was translated from a language other than English",
        "It only discusses events after Columbus's arrival",
      ],
      answer: 0,
      explanation:
        "The exhibition text is a 1991 secondary summary. Its biggest limitation for reconstructing daily life in 1490 is that it was written well after the fact, drawing on other scholarship rather than direct experience.",
    },
  },
];
