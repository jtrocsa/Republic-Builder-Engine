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

// Second content pass, proving out the generic Sequencing quest-type contract
// (apps/web/src/quest-types/generic/sequencing-quest.js) and the history
// Source Analysis (HIPP) quest-type contract
// (apps/web/src/quest-types/history/source-analysis-quest.js) against Case
// 1.01's real CASE_001_SOURCES and EXCHANGE_RECORDS (also in
// apps/web/src/content/unit-01-campaign.js).
export const UNIT_01_SEQUENCING_QUESTS = [
  {
    id: "case-001-sequencing-columbian-exchange",
    prompt:
      "Arrange these Case 1.01 developments in the order that reflects how each one caused or enabled the next — not simply the order the dates occurred in.",
    items: [
      {
        id: "smallpox-epidemic-1520",
        label:
          "Sustained Atlantic contact and colonization trigger the 1520 smallpox epidemic, devastating Indigenous populations with no prior immunity",
        position: 3,
      },
      {
        id: "horses-reshape-societies",
        label:
          "Introduced horses reshape mobility, warfare, transport, and later Indigenous and colonial societies",
        position: 4,
      },
      {
        id: "taino-society-precontact",
        label:
          "Organized Taíno communities already exist across the Caribbean, governed by caciques, before any European arrival",
        position: 0,
      },
      {
        id: "columbus-first-contact-letter",
        label:
          "Columbus's 1492 voyage makes first contact, and his 1493 letter to Rafael Sánchez reports it to secure continued Spanish crown backing",
        position: 1,
      },
      {
        id: "waldseemuller-map-knowledge",
        label:
          "European geographic knowledge changes as voyages continue, reflected in the 1507 Waldseemüller map's separate Western Hemisphere",
        position: 2,
      },
    ],
    explanation:
      "Each step enables the next: organized pre-contact Taíno society is what Columbus's expedition actually encountered; his letter's success in reassuring the crown's treasurer helped secure the continued backing that funded further voyages; those repeated voyages are what changed European geographic knowledge, shown in the Waldseemüller map; that same sustained contact and colonization is what exposed Indigenous populations to Old World pathogens, causing the 1520 smallpox epidemic among people with no prior immunity; and the ongoing exchange of the same period introduced horses, which went on to reshape conquest, transport, and Indigenous ways of life well beyond the moment of first contact.",
  },
];

export const UNIT_01_SOURCE_ANALYSIS_QUESTS = [
  {
    id: "case-001-hipp-columbus-letter",
    prompt:
      "Analyze Columbus's 1493 letter to Rafael Sánchez using HIPP reasoning. For each dimension below, choose the option that explains how or why it shapes the letter's argument — not the option that merely names the correct answer.",
    document: {
      text:
        "Since I know you will be pleased at the great victory our Lord has given me in this voyage, I write to tell you that in thirty-three days I passed from the Canary Islands to the Indies, where I found very many islands, and took possession of all of them for their Highnesses. The people of these islands are so guileless and generous with all they possess that no one would believe it without seeing it; whatever is asked of them, they never refuse, and they show as much love as if they gave their hearts. I have found gold in some rivers, and on the island they call Hispaniola there are mines of metal in great quantity. I am confident that, with a little more help from Your Highnesses, I shall bring back as much gold as is needed, and as much spice and cotton as their ships can carry, together with people to be converted to our holy faith.",
      attribution: "Christopher Columbus, Letter to Rafael Sánchez, 1493",
    },
    hippPrompts: [
      {
        id: "columbus-audience",
        dimension: "Intended audience",
        argument:
          "Rafael Sánchez was treasurer to the Spanish crown, the official who controlled funding for further voyages — this shapes what Columbus chooses to emphasize.",
        options: [
          {
            id: "audience-explained",
            text:
              "Because Sánchez was the treasurer overseeing crown funds for exploration, Columbus foregrounds gold, valuable goods, and easily governed peoples to reassure the official most able to authorize further voyages.",
            correct: true,
          },
          {
            id: "audience-named-only",
            text:
              "Rafael Sánchez was the treasurer to the Spanish crown, the official responsible for managing the monarchy's finances.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "audience-wrong-sailor",
            text:
              "Sánchez had sailed on the voyage himself, so Columbus wrote informally about hardships they had shared at sea.",
            correct: false,
          },
          {
            id: "audience-wrong-public",
            text:
              "The letter was written for a general Spanish public readership from its first draft, with no connection to any crown official.",
            correct: false,
          },
        ],
      },
      {
        id: "columbus-purpose",
        dimension: "Purpose",
        argument:
          "Columbus's purpose was to secure continued royal financial backing for further exploration, leading him to foreground profitable discoveries over hardships encountered.",
        options: [
          {
            id: "purpose-explained",
            text:
              "By foregrounding gold, valuable goods, and peaceable, convertible peoples, Columbus frames the voyage as a profitable investment, building the case for the crown to fund additional expeditions.",
            correct: true,
          },
          {
            id: "purpose-named-only",
            text:
              "Columbus wrote the letter to inform the Spanish crown of his voyage and describe the lands and people he had encountered.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "purpose-wrong-resign",
            text: "Columbus's purpose was to formally resign his command after the voyage's failures.",
            correct: false,
          },
          {
            id: "purpose-wrong-navigation",
            text:
              "The letter's purpose was to record precise longitude measurements for training future navigators.",
            correct: false,
          },
        ],
      },
    ],
  },
];
