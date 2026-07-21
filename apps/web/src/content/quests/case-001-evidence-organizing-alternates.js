// Curated pool of teacher-selectable alternates for Case 1.01's Evidence
// Organizing quest — Teacher Mode's "swap a question" picker, generalized
// from the source+MCQ-only pattern established by
// case-001-mcq-alternates.js to the history Evidence Organizing quest type
// (apps/web/src/quest-types/history/evidence-organizing-quest.js). Each
// entry's `quest` object is validated against the same
// EvidenceOrganizingQuestSchema shape as UNIT_01_EVIDENCE_ORGANIZING_QUESTS
// (apps/web/src/content/quests/unit-01-quests.js). `replacesQuestId` must
// match a real UNIT_01_EVIDENCE_ORGANIZING_QUESTS id.
//
// Proof-of-pipeline seed (one alternate for one slot) — extending coverage
// to more quests or other units is pure content work.
//
// This alternate reuses the same three Case 1.01 records as the official
// quest (taino-context, columbus-letter, waldseemuller-map, both real and
// cited in apps/web/src/content/unit-01-campaign.js's CASE_001_SOURCES) and
// keeps the same defensible skill-category mapping — Contextualization,
// Sourcing, and Continuity and Change are each the strongest fit for their
// record regardless of how the task is framed. What differs is the
// pedagogical angle: instead of the official quest's "why does using more
// than one kind of record strengthen an argument" reflection, this version
// asks students to identify which record is most vulnerable to bias and
// argue why triangulating it against the other two protects an argument
// from that bias — a bias-awareness framing a teacher might prefer over the
// general multi-source-strength framing.
export const CASE_001_EVIDENCE_ORGANIZING_ALTERNATES = [
  {
    replacesQuestId: "case-001-evidence-record-sourcing",
    quest: {
      id: "case-001-evidence-record-sourcing-alt-bias-awareness",
      prompt:
        "Match each Case 1.01 record to the historical-thinking skill it best demonstrates, then use your reflection to identify which record is most vulnerable to bias.",
      slots: [
        { id: "contextualization", label: "Contextualization" },
        { id: "sourcing-situation", label: "Sourcing" },
        { id: "continuity-and-change", label: "Continuity and Change" },
      ],
      sources: [
        {
          id: "taino-context",
          label: "The Caribbean—Island Society",
          attribution: "Library of Congress exhibition text, 1991",
          excerpt:
            "The largest group of people living in the islands of the Caribbean were the Taínos. Their villages were governed by chieftains, or caciques.",
          skillCategory: "Contextualization",
          correctSlotId: "contextualization",
        },
        {
          id: "columbus-letter",
          label: "Letter Reporting on the First Voyage",
          attribution: "Christopher Columbus, 1493",
          excerpt:
            "“They are so ingenuous and free with all they have, that no one would believe it without seeing it.”",
          skillCategory: "Sourcing",
          correctSlotId: "sourcing-situation",
        },
        {
          id: "waldseemuller-map",
          label: "Universalis cosmographia",
          attribution: "Martin Waldseemüller, 1507",
          excerpt:
            "A printed European world map made after early Atlantic voyages, labeling the new lands “America.”",
          skillCategory: "Continuity and Change",
          correctSlotId: "continuity-and-change",
        },
      ],
      reflectionPrompt:
        "In 2–3 sentences, name the record you judge most vulnerable to bias, explain the bias you see in it, and explain why reading it alongside the other two records helps protect a historical argument from that bias.",
      rubric: {
        skillCategories: ["Contextualization", "Sourcing", "Continuity and Change"],
        pointsTotal: 3,
        description:
          "Earn 1 point per record correctly matched to the historical-thinking skill it best demonstrates.",
      },
    },
  },
];
