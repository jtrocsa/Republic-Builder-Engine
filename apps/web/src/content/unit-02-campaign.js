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
      location: "Chesapeake tidewater, Virginia · 1619–1630",
      question:
        "What do a land charter, a servant's letter, and a wharf ledger reveal about who did this settlement's work and who held its power?",
      mechanic: "Field Investigation",
      route: "field",
      summary:
        "Walk a young tobacco settlement on the James River, speak with its people, and secure three records — a company land charter, a servant's letter, and a wharf account — before they are lost.",
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
    type: "Primary source · charter instructions",
    title: "Instructions to Governor George Yeardley",
    creator: "Virginia Company of London",
    date: "1618",
    record: "Company instructions establishing the headright system, Virginia",
    visual: "context",
    activityRoute: null,
    excerpt:
      "The Virginia Company instructed its governor to grant fifty acres of land to every person transported into the colony at his own charge, and fifty acres more for every servant he brought and settled there — a policy meant to draw settlers by tying land ownership to the number of people, free or bound, a planter could bring across the Atlantic.",
    prompt:
      "What did the Virginia Company hope to accomplish by tying land grants to the number of people a planter transported — including servants?",
    feedback:
      "Institute Context: the 1618 instructions to Governor Yeardley created the headright system — fifty acres for every settler transported, and fifty more for every servant brought with him. By rewarding planters for importing labor, the policy directly encouraged the recruitment of indentured servants like the one whose letter follows.",
    citation:
      "Virginia Company of London, “Instructions to Governor George Yeardley,” 1618, in Susan Myra Kingsbury, ed., The Records of the Virginia Company of London, vol. III (Washington, D.C.: Government Printing Office, 1906–1935).",
    externalUrl: "https://www.loc.gov/item/06019229/",
    reconstruction: "founding",
  },
  {
    id: "riverbend-letter",
    type: "Primary source · letter",
    title: "Letter to His Parents from Jamestown",
    creator: "Richard Frethorne",
    date: "1623",
    record: "Personal letter from an indentured servant in Virginia",
    visual: "letter",
    activityRoute: null,
    excerpt:
      "“I have nothing to comfort me, nor is there nothing to be gotten here but sickness and death, except that one had money to lay out in some things for profit … People cry out day and night — Oh, that they were in England without their limbs — and would not care to lose any limb to be in England again, yea, though they beg from door to door.”",
    prompt:
      "What does Frethorne's letter reveal about the conditions of bound labor in Virginia, and how might writing to his parents have shaped what he chose to say?",
    feedback:
      "Institute Context: Richard Frethorne wrote home in 1623 as an indentured servant, describing hunger, sickness, and fear so severe that colonists wished they could trade any limb to return to England. Writing to parents who might intervene on his behalf, he had reason to describe his suffering plainly rather than minimize it — the opposite pull from a report meant for a patron or investor.",
    citation:
      "Richard Frethorne to his father and mother, March 20, 1623, reprinted in Susan Myra Kingsbury, ed., The Records of the Virginia Company of London, vol. IV (Washington, D.C.: Government Printing Office, 1906–1935).",
    externalUrl: "https://www.loc.gov/item/06019229/",
    reconstruction: "labor",
  },
  {
    id: "riverbend-ledger",
    type: "Primary source · account book",
    title: "Wharf Account: Tobacco Shipped, Goods Received",
    creator: "Ship's factor, James River wharf",
    date: "1630",
    record: "Representative cargo account, Chesapeake tobacco trade",
    visual: "context",
    activityRoute: null,
    excerpt:
      "Received of the ship Speedwell: fourteen hogsheads of tobacco, casked and weighed as within noted. Delivered in return: three pieces of Kentish cloth, two dozen iron hoes, six dozen knives, and sundry other English wares, per the planters' order at the landing.",
    prompt:
      "What does this account entry prove about the settlement's place in a wider Atlantic economy?",
    feedback:
      "Institute Context: entries like this one recur throughout early Chesapeake wharf and factor account books — tobacco hogsheads shipped out, English cloth and tools shipped back in return. The pattern shows a settlement whose economy already depended on exporting a single staple crop to pay for manufactured goods it could not make for itself.",
    citation:
      "Representative wharf account entry, modeled on the invoice and cargo-account pattern documented throughout Susan Myra Kingsbury, ed., The Records of the Virginia Company of London (Washington, D.C.: Government Printing Office, 1906–1935); no single verbatim entry is quoted here.",
    externalUrl: "https://www.loc.gov/item/06019229/",
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
