/**
 * Unit 2 — Period 2: 1607–1754 (placeholder content).
 *
 * Structural mirror of unit-01-campaign.js. Every record below is a
 * PLACEHOLDER: the shapes are final, the historical copy is not. Swap titles,
 * excerpts, prompts, and citations when the real Period 2 content arrives —
 * nothing in main.js depends on the wording, only on the field names.
 */

export const UNIT_02 = {
  id: "unit-02",
  title: "Colonial Crossroads",
  period: "Period 2 · 1607–1754",
  description:
    "Placeholder: how distinct colonial societies took shape along the Atlantic seaboard, and how the transatlantic economy bound them together.",
  centralQuestion:
    "Placeholder: how did geography, labor, and empire produce different colonial societies in British North America?",
  cases: [
    {
      id: "case-004",
      shortTitle: "Riverbend",
      title: "The Riverbend Settlement",
      date: "1619",
      mapPosition: { left: "26%", top: "34%" },
      location: "Chesapeake tidewater (placeholder)",
      question:
        "Placeholder: what do the settlement's own records reveal about who did its work and who held its power?",
      mechanic: "Field Investigation",
      route: "field",
      summary:
        "Placeholder: walk a young tobacco settlement on the river, speak with its people, and secure three records before they are lost.",
    },
    {
      id: "case-005",
      shortTitle: "Triangle Ledger",
      title: "The Triangle Ledger",
      date: "1732",
      mapPosition: { left: "52%", top: "52%" },
      location: "The Atlantic circuit",
      question:
        "Placeholder: what did each leg of the Atlantic trade actually carry, and who bore its costs?",
      mechanic: "Trade Route Plotter",
      route: "triangle",
      summary:
        "Placeholder: reconstruct the triangular trade from shipping records — plot each cargo onto the leg that carried it.",
    },
    {
      id: "case-006",
      shortTitle: "Charter & Compact",
      title: "Charter & Compact",
      date: "1607–1754",
      mapPosition: { left: "30%", top: "20%" },
      location: "The thirteen colonies",
      question:
        "Placeholder: which documents built which colonial societies — and what differences do they prove?",
      mechanic: "Region Builder",
      route: "regions",
      summary:
        "Placeholder: restore the Archive's damaged display of the colonial regions by returning each founding record to the society it built.",
    },
  ],
};

export const CASE_004_SOURCES = [
  {
    id: "riverbend-charter",
    type: "Primary source · charter",
    title: "Placeholder Charter of the Riverbend Company",
    creator: "Placeholder colonial company",
    date: "1618",
    record: "Company charter · placeholder",
    visual: "context",
    activityRoute: null,
    excerpt:
      "Placeholder excerpt: the company grants fifty acres to every person who pays their own passage across the sea...",
    prompt:
      "Placeholder prompt: what was this charter trying to accomplish, and for whom was it written?",
    feedback:
      "Placeholder Institute Context: headright-style land grants recruited settlers and tied land ownership to paying for passage — including the passage of others.",
    citation: "Placeholder citation, colonial records collection.",
    externalUrl: "https://www.loc.gov/",
    reconstruction: "founding",
  },
  {
    id: "riverbend-letter",
    type: "Primary source · letter",
    title: "Placeholder Letter of an Indentured Servant",
    creator: "Placeholder indentured servant",
    date: "1623",
    record: "Personal letter · placeholder",
    visual: "letter",
    activityRoute: null,
    excerpt:
      "Placeholder excerpt: I have nothing to comfort me, nor is there nothing to be gotten here but sickness and death...",
    prompt:
      "Placeholder prompt: what does this letter reveal about the conditions of bound labor, and how might its audience have shaped what it says?",
    feedback:
      "Placeholder Institute Context: letters home from indentured servants describe the gap between recruitment promises and tobacco-field reality.",
    citation: "Placeholder citation, colonial correspondence collection.",
    externalUrl: "https://www.loc.gov/",
    reconstruction: "labor",
  },
  {
    id: "riverbend-ledger",
    type: "Primary source · account book",
    title: "Placeholder Wharf Account Book",
    creator: "Placeholder factor at the river landing",
    date: "1630",
    record: "Trade ledger · placeholder",
    visual: "context",
    activityRoute: null,
    excerpt:
      "Placeholder excerpt: received of the Charles, 14 hogsheads tobacco; delivered, cloth, tools, and sundry English goods...",
    prompt:
      "Placeholder prompt: what does this account book prove about the settlement's place in a wider economy?",
    feedback:
      "Placeholder Institute Context: wharf ledgers document the export economy that tied colonial settlements to English merchants and markets.",
    citation: "Placeholder citation, mercantile records collection.",
    externalUrl: "https://www.loc.gov/",
    reconstruction: "exchange",
  },
];

export const CASE_004_LANES = [
  { id: "founding", label: "Founding & land" },
  { id: "labor", label: "Labor & people" },
  { id: "exchange", label: "Trade & empire" },
];

export const TRIANGLE_LEGS = [
  {
    id: "outbound",
    label: "Outbound passage",
    fromLabel: "England / Europe",
    toLabel: "West Africa",
    description: "Placeholder: manufactured goods sailed south and east.",
  },
  {
    id: "middle",
    label: "The Middle Passage",
    fromLabel: "West Africa",
    toLabel: "The Americas",
    description:
      "Placeholder: human beings, enslaved and transported. Its records are testimony, not cargo lists.",
  },
  {
    id: "homeward",
    label: "Homeward passage",
    fromLabel: "The Americas",
    toLabel: "England / Europe",
    description: "Placeholder: colonial staples returned to imperial markets.",
  },
];

export const TRIANGLE_CARGO = [
  {
    id: "cloth-tools",
    label: "Cloth & ironware",
    icon: "🧵",
    leg: "outbound",
    sourceTitle: "Placeholder outbound manifest",
    sourceMeta: "Ship manifest · 1732 · placeholder",
    consequence:
      "Placeholder consequence: English manufactured goods were the currency of the trade's first leg.",
    question: "Placeholder MCQ: why did manufactured goods lead the outbound leg?",
    choices: [
      "Placeholder correct: mercantile policy directed colonial trade through English manufactures",
      "Placeholder distractor A",
      "Placeholder distractor B",
      "Placeholder distractor C",
    ],
    answer: 0,
    citation: "Placeholder citation, shipping records.",
  },
  {
    id: "firearms",
    label: "Firearms & powder",
    icon: "⚙",
    leg: "outbound",
    sourceTitle: "Placeholder trading-post inventory",
    sourceMeta: "Factory inventory · 1729 · placeholder",
    consequence:
      "Placeholder consequence: weapons traded on the African coast fueled the wars that supplied captives.",
    question: "Placeholder MCQ: what did the arms trade change on the African coast?",
    choices: [
      "Placeholder correct answer",
      "Placeholder distractor A",
      "Placeholder distractor B",
      "Placeholder distractor C",
    ],
    answer: 0,
    citation: "Placeholder citation, trading company records.",
  },
  {
    id: "captives",
    label: "Enslaved people",
    icon: "◆",
    leg: "middle",
    sourceTitle: "Placeholder testimony of the Middle Passage",
    sourceMeta: "Survivor account · 18th century · placeholder",
    consequence:
      "Placeholder testimony: a survivor's own words on the passage — this record is a human account, and the Archive preserves it as such.",
    question:
      "Placeholder MCQ: what does survivor testimony prove that a ship's ledger conceals?",
    choices: [
      "Placeholder correct answer",
      "Placeholder distractor A",
      "Placeholder distractor B",
      "Placeholder distractor C",
    ],
    answer: 0,
    citation: "Placeholder citation, published narrative.",
  },
  {
    id: "shackles-record",
    label: "The ship's own log",
    icon: "▤",
    leg: "middle",
    sourceTitle: "Placeholder slave-ship log",
    sourceMeta: "Ship's log · 1735 · placeholder",
    consequence:
      "Placeholder testimony: the log's clinical arithmetic is itself evidence of the trade's inhumanity.",
    question: "Placeholder MCQ: how should a Chronicler read a slave ship's log?",
    choices: [
      "Placeholder correct answer",
      "Placeholder distractor A",
      "Placeholder distractor B",
      "Placeholder distractor C",
    ],
    answer: 0,
    citation: "Placeholder citation, admiralty records.",
  },
  {
    id: "sugar",
    label: "Sugar & molasses",
    icon: "🛢",
    leg: "homeward",
    sourceTitle: "Placeholder plantation invoice",
    sourceMeta: "Invoice · 1730 · placeholder",
    consequence:
      "Placeholder consequence: sugar wealth built ports on both sides of the Atlantic — on enslaved labor.",
    question: "Placeholder MCQ: where did the profits of the sugar trade accumulate?",
    choices: [
      "Placeholder correct answer",
      "Placeholder distractor A",
      "Placeholder distractor B",
      "Placeholder distractor C",
    ],
    answer: 0,
    citation: "Placeholder citation, plantation accounts.",
  },
  {
    id: "tobacco",
    label: "Tobacco hogsheads",
    icon: "▦",
    leg: "homeward",
    sourceTitle: "Placeholder customs record",
    sourceMeta: "Customs entry · 1733 · placeholder",
    consequence:
      "Placeholder consequence: enumerated goods could sail only to English ports — the Navigation Acts in action.",
    question: "Placeholder MCQ: what did the Navigation Acts require of this cargo?",
    choices: [
      "Placeholder correct answer",
      "Placeholder distractor A",
      "Placeholder distractor B",
      "Placeholder distractor C",
    ],
    answer: 0,
    citation: "Placeholder citation, customs house records.",
  },
];

export const REGION_RECORDS = [
  {
    id: "new-england",
    label: "New England",
    summary: "Placeholder: towns, meetinghouses, mixed economy, covenant communities.",
  },
  {
    id: "middle",
    label: "Middle Colonies",
    summary: "Placeholder: grain, ports, and the most diverse population on the seaboard.",
  },
  {
    id: "southern",
    label: "Southern Colonies",
    summary: "Placeholder: staple crops, plantation labor, scattered settlement.",
  },
];

export const REGION_EVIDENCE = [
  {
    id: "town-covenant",
    label: "Town covenant",
    source: "Placeholder town covenant, 1636",
    detail: "Placeholder: a community binds itself to worship and self-govern together.",
    region: "new-england",
  },
  {
    id: "headright-grant",
    label: "Headright grant",
    source: "Placeholder land grant, 1635",
    detail: "Placeholder: fifty acres per passage paid — land policy that rewarded importing labor.",
    region: "southern",
  },
  {
    id: "indenture-contract",
    label: "Indenture contract",
    source: "Placeholder indenture, 1640",
    detail: "Placeholder: seven years' service in exchange for passage across the Atlantic.",
    region: "southern",
  },
  {
    id: "toleration-writ",
    label: "Liberty of conscience writ",
    source: "Placeholder proprietary charter clause, 1682",
    detail: "Placeholder: worship protected to draw settlers of many nations and faiths.",
    region: "middle",
  },
  {
    id: "grain-manifest",
    label: "Flour export manifest",
    source: "Placeholder port manifest, 1741",
    detail: "Placeholder: the breadbasket trade moving through a fast-growing port city.",
    region: "middle",
  },
  {
    id: "school-law",
    label: "Common school law",
    source: "Placeholder colony law, 1647",
    detail: "Placeholder: every town of fifty households must appoint a teacher of reading.",
    region: "new-england",
  },
];

export const UNIT_02_REVIEW = {
  mcq: [
    {
      prompt: "Placeholder Unit 2 MCQ 1: which factor most shaped Chesapeake settlement patterns?",
      choices: [
        "Placeholder correct answer",
        "Placeholder distractor A",
        "Placeholder distractor B",
        "Placeholder distractor C",
      ],
      answer: 0,
      explanation: "Placeholder explanation for question 1.",
    },
    {
      prompt: "Placeholder Unit 2 MCQ 2: what did the Navigation Acts require?",
      choices: [
        "Placeholder correct answer",
        "Placeholder distractor A",
        "Placeholder distractor B",
        "Placeholder distractor C",
      ],
      answer: 0,
      explanation: "Placeholder explanation for question 2.",
    },
    {
      prompt: "Placeholder Unit 2 MCQ 3: how did New England towns differ from southern settlements?",
      choices: [
        "Placeholder correct answer",
        "Placeholder distractor A",
        "Placeholder distractor B",
        "Placeholder distractor C",
      ],
      answer: 0,
      explanation: "Placeholder explanation for question 3.",
    },
    {
      prompt: "Placeholder Unit 2 MCQ 4: what changed as colonies shifted toward enslaved African labor?",
      choices: [
        "Placeholder correct answer",
        "Placeholder distractor A",
        "Placeholder distractor B",
        "Placeholder distractor C",
      ],
      answer: 0,
      explanation: "Placeholder explanation for question 4.",
    },
    {
      prompt: "Placeholder Unit 2 MCQ 5: what does the triangular trade reveal about mercantilism?",
      choices: [
        "Placeholder correct answer",
        "Placeholder distractor A",
        "Placeholder distractor B",
        "Placeholder distractor C",
      ],
      answer: 0,
      explanation: "Placeholder explanation for question 5.",
    },
    {
      prompt: "Placeholder Unit 2 MCQ 6: which development pushed colonies toward greater self-government?",
      choices: [
        "Placeholder correct answer",
        "Placeholder distractor A",
        "Placeholder distractor B",
        "Placeholder distractor C",
      ],
      answer: 0,
      explanation: "Placeholder explanation for question 6.",
    },
  ],
  saq: {
    stimulus:
      "Placeholder Unit 2 SAQ stimulus: an excerpt contrasting a New England town record with a Chesapeake plantation inventory.",
    prompts: [
      "A. Placeholder: briefly describe ONE difference between the two colonial societies shown in the records.",
      "B. Placeholder: explain ONE cause of the difference identified in part A.",
      "C. Placeholder: explain ONE way the transatlantic economy connected both societies despite their differences.",
    ],
    rubric:
      "Placeholder rubric: one point per part — a specific difference, a developed cause, and a developed connection, each grounded in Period 2 evidence.",
  },
};
