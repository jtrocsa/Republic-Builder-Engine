// First real content built against the generic MCQ and history
// evidence-organizing quest-type contracts (apps/web/src/quest-types/).
// Source-grounded practice tied to Case 1.01's real CASE_001_SOURCES
// (apps/web/src/content/unit-01-campaign.js) — supplements the existing
// end-of-unit REVIEW.mcq, it does not replace it.
export const UNIT_01_MCQ_QUESTS = [
  {
    id: "case-001-mcq-taino-sourcing",
    prompt:
      "The Library of Congress exhibition text on Taíno society is best classified as which kind of record?",
    choices: [
      "A primary source written by a Taíno community leader",
      "A secondary source written well after the events it describes",
      "A primary source created during first contact in 1492",
      "An administrative record issued by the Spanish crown",
    ],
    answer: 1,
    explanation:
      "The exhibition text was written in 1991 to summarize existing scholarship — useful context, but a secondary source, not a Taíno-authored primary account.",
  },
  {
    id: "case-001-mcq-columbus-audience",
    prompt: "Columbus's 1493 letter to Rafael Sánchez most directly reflects the influence of which factor?",
    choices: [
      "His audience: a royal treasurer whose support could shape future voyages",
      "His training as a professional cartographer",
      "Direct editorial review by Taíno leaders before publication",
      "A requirement to write only in Latin for the Spanish court",
    ],
    answer: 0,
    explanation:
      "The letter was addressed to Rafael Sánchez, treasurer to the Spanish monarchs — Columbus had reason to frame his account to justify continued royal backing.",
  },
  {
    id: "case-001-mcq-waldseemuller-change",
    prompt: "What does the 1507 Waldseemüller map most directly provide evidence of?",
    choices: [
      "The precise daily life of Caribbean communities in 1493",
      "A change in European geographic knowledge following Atlantic voyages",
      "The final political borders of the modern Americas",
      "Direct testimony from an Indigenous mapmaker",
    ],
    answer: 1,
    explanation:
      "As a printed European map made after early Atlantic voyages, it documents how European geographic understanding was changing — not what Caribbean life looked like on the ground.",
  },
];

export const UNIT_01_EVIDENCE_ORGANIZING_QUESTS = [
  {
    id: "case-001-evidence-record-sourcing",
    prompt:
      "Match each Case 1.01 record to the historical-thinking skill it best demonstrates, then explain why using more than one kind of record strengthens a historical argument.",
    slots: [
      { id: "contextualization", label: "Contextualization" },
      { id: "sourcing-situation", label: "Sourcing and Situation" },
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
        skillCategory: "Sourcing and Situation",
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
      "In 2–3 sentences, explain how using context, a primary letter, and a map together builds a stronger historical argument than any one record alone.",
    rubric: {
      skillCategories: ["Contextualization", "Sourcing and Situation", "Continuity and Change"],
      pointsTotal: 3,
      description:
        "Earn 1 point per record correctly matched to the historical-thinking skill it best demonstrates.",
    },
  },
];
