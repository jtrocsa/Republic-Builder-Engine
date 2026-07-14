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
        "What did each leg of the transatlantic trade actually carry, and who bore its human and economic costs?",
      mechanic: "Trade Route Plotter",
      route: "triangle",
      summary:
        "Reconstruct the triangular trade from six real shipping and testimony records — plot each cargo onto the leg of the circuit that carried it, then weigh what each record proves about the system binding Europe, Africa, and the Americas together.",
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
    description:
      "European manufactured goods — cloth, iron tools, and firearms — sailed toward West Africa to be traded for captives and gold.",
  },
  {
    id: "middle",
    label: "The Middle Passage",
    fromLabel: "West Africa",
    toLabel: "The Americas",
    description:
      "Enslaved Africans, forced aboard and shackled below deck, were carried across the Atlantic into bondage in the Americas.",
  },
  {
    id: "homeward",
    label: "Homeward passage",
    fromLabel: "The Americas",
    toLabel: "England / Europe",
    description:
      "Colonial staples produced by enslaved labor — sugar, tobacco, and other cash crops — sailed back to English and European markets.",
  },
];

export const TRIANGLE_CARGO = [
  {
    id: "cloth-tools",
    label: "Cloth & ironware",
    icon: "🧵",
    leg: "outbound",
    sourceTitle: "Outward Cargo Pattern, Gold Coast Trade",
    sourceMeta: "Royal African Company records · aggregate pattern, c. 1730s",
    consequence:
      "Royal African Company invoices for Gold Coast voyages recur with the same short list of outbound goods — Manchester and Kentish cloth, iron and copper bars, and firearms — advanced against captives and gold on the African coast. Manufactured wares, not coin, were the trade's opening currency.",
    question:
      "What does the recurring pattern of manufactured goods — cloth, iron, firearms — in Royal African Company outward cargo records best support?",
    choices: [
      "English manufacturing capacity and mercantile policy structured the outbound leg around exporting finished goods rather than raw materials or coin.",
      "English merchants preferred to carry gold and silver bullion to Africa rather than manufactured goods.",
      "African merchants had no established preferences for particular categories of trade goods.",
      "The outbound leg mainly carried agricultural produce grown in the American colonies.",
    ],
    answer: 0,
    citation:
      "Representative outward cargo pattern documented in Royal African Company records and aggregated voyage data; see Voyages: The Trans-Atlantic Slave Trade Database (voyages.org, Emory University). No single voyage record is quoted verbatim here.",
  },
  {
    id: "firearms",
    label: "Firearms & powder",
    icon: "⚙",
    leg: "outbound",
    sourceTitle: "A New and Accurate Description of the Coast of Guinea",
    sourceMeta: "Willem Bosman, Dutch trader · 1705",
    consequence:
      "Bosman's 1705 account of the Gold Coast trade describes muskets, gunpowder, and shot as a standard part of what European traders offered African merchants alongside cloth and iron — the Dutch, English, and other nations all competing to supply arms in exchange for captives and gold.",
    question:
      "According to Bosman's account, what role did firearms play in the Gold Coast trade of the early 1700s?",
    choices: [
      "European trading nations competed with one another to supply African merchants with muskets and gunpowder as a routine part of the exchange.",
      "European trading companies banned the sale of firearms on the Gold Coast.",
      "African states refused to accept firearms in exchange for goods or captives.",
      "Firearms were traded only after ships reached the Americas, not on the African coast.",
    ],
    answer: 0,
    citation:
      "Willem Bosman, A New and Accurate Description of the Coast of Guinea (London, 1705 English translation), public domain, available via archive.org; paraphrased from Bosman's description of Gold Coast trade goods.",
  },
  {
    id: "captives",
    label: "Enslaved people",
    icon: "◆",
    leg: "middle",
    sourceTitle: "The Interesting Narrative of the Life of Olaudah Equiano",
    sourceMeta: "Olaudah Equiano, Middle Passage survivor · 1789",
    consequence:
      "“The closeness of the place, and the heat of the climate, added to the number in the ship, which was so crowded that each had scarcely room to turn himself, almost suffocated us … This wretched situation was again aggravated by the galling of the chains … and the filth of the necessary tubs, into which the children often fell, and were almost suffocated.”",
    question:
      "What does Equiano's own account of the Middle Passage prove that a ship's cargo ledger cannot?",
    choices: [
      "The direct, first-person suffering and physical conditions endured by enslaved people below deck — evidence a tally of bodies and goods cannot convey.",
      "The exact number of enslaved people who died on every transatlantic voyage.",
      "That enslaved Africans received treatment comparable to paying passengers.",
      "That every Middle Passage voyage followed an identical route and schedule.",
    ],
    answer: 0,
    citation:
      "Olaudah Equiano, The Interesting Narrative of the Life of Olaudah Equiano, or Gustavus Vassa, the African, Written by Himself (London, 1789), chapter 2; public domain.",
  },
  {
    id: "shackles-record",
    label: "The ship's own log",
    icon: "▤",
    leg: "middle",
    sourceTitle: "Description of a Slave Ship (the Brooks)",
    sourceMeta: "Society for Effecting the Abolition of the Slave Trade · 1788",
    consequence:
      "The 1788 broadside diagrams the Liverpool slave ship Brooks with its hold divided into measured compartments, each stamped with rows of human figures laid side by side to show the maximum number — over four hundred — the ship's own owners calculated it could carry below deck.",
    question:
      "What is the primary evidentiary value of the Brooks diagram for a historian studying the Middle Passage?",
    choices: [
      "It documents, in the traders' own measured terms, how enslaved people were spatially packed into a ship's hold to maximize capacity.",
      "It records the personal testimony of enslaved people describing the passage in their own words.",
      "It proves British ships carried fewer enslaved people per voyage than ships of other nations.",
      "It shows that slave ships were designed with the comfort and safety of enslaved people in mind.",
    ],
    answer: 0,
    citation:
      "Description of a Slave Ship (the Brooks), Plymouth: Committee for the Abolition of the Slave Trade / Society for Effecting the Abolition of the Slave Trade, 1788; Library of Congress collections.",
  },
  {
    id: "sugar",
    label: "Sugar & molasses",
    icon: "🛢",
    leg: "homeward",
    sourceTitle: "Plantation Invoice: Sugar and Molasses Shipped to England",
    sourceMeta: "Representative Caribbean plantation account · c. 1730",
    consequence:
      "Caribbean plantation accounts compiled from the period typically list hogsheads of sugar and puncheons of molasses shipped to England or the northern colonies against the planter's account, with the proceeds used to buy more enslaved laborers, provisions, and manufactured goods — sugar wealth circulating back into the labor system that produced it.",
    question:
      "What does the recurring pattern in Caribbean plantation shipping accounts best reveal about the profits of the sugar trade?",
    choices: [
      "Sugar profits were reinvested into purchasing more enslaved labor and supplies, tying the wealth of the trade directly to its own continuation.",
      "Sugar planters shipped their crop directly to West Africa rather than to Europe or the northern colonies.",
      "Sugar was grown primarily by free wage laborers rather than enslaved workers.",
      "Molasses had no commercial value distinct from raw sugar.",
    ],
    answer: 0,
    citation:
      "Modeled on the plantation invoice and cargo-account pattern documented throughout Elizabeth Donnan, ed., Documents Illustrative of the History of the Slave Trade to America, 4 vols. (Washington, D.C.: Carnegie Institution of Washington, 1930–1935); no single verbatim entry is quoted here.",
  },
  {
    id: "tobacco",
    label: "Tobacco hogsheads",
    icon: "▦",
    leg: "homeward",
    sourceTitle: "An Act for the Encouraging and Increasing of Shipping and Navigation",
    sourceMeta: "Navigation Act of 1660, Parliament of England · 12 Cha. II c. 18",
    consequence:
      "“…no sugars, tobacco, cotton-wool, indigo, ginger, fustic, or other dyeing wood, of the growth, production, or manufacture of any English plantations in America, Asia, or Africa, shall be shipped, carried, conveyed, or transported from any of the said English plantations to any land, island, territory, dominion, port, or place whatsoever, other than to such English plantations as do belong to his majesty … or to the kingdom of England, Ireland, or … Wales.”",
    question: "What did this enumerated-commodities clause require colonial tobacco growers to do?",
    choices: [
      "Ship their enumerated crop only to England or other English possessions, rather than selling it directly to foreign markets.",
      "Grow tobacco exclusively for domestic colonial consumption.",
      "Pay a tax to any foreign nation willing to purchase their tobacco directly.",
      "Transport tobacco only aboard foreign-owned ships.",
    ],
    answer: 0,
    citation:
      "An Act for the Encouraging and Increasing of Shipping and Navigation (Navigation Act), 1660, 12 Cha. II c. 18, enumerated-commodities clause; full text via the Avalon Project, Yale Law School.",
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
