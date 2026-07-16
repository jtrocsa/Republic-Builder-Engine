// First real content built against the generic MCQ and history
// evidence-organizing quest-type contracts (apps/web/src/quest-types/).
// Source-grounded practice tied to Case 4's real CASE_004_SOURCES
// (apps/web/src/content/unit-02-campaign.js) — supplements the existing
// end-of-unit UNIT_02_REVIEW.mcq, it does not replace it.
export const UNIT_02_MCQ_QUESTS = [
  {
    id: "case-004-mcq-charter-sourcing",
    prompt:
      "The 1618 instructions to Governor Yeardley establishing the headright system are best understood as evidence of what kind of Virginia Company goal?",
    choices: [
      "A deliberate policy to recruit settlers and labor by tying land grants to the number of people transported",
      "A religious charter establishing a colonial church hierarchy",
      "A military order directing an assault on a neighboring Powhatan town",
      "A royal decree ending indentured servitude in the colony",
    ],
    answer: 0,
    explanation:
      "The headright system offered fifty acres per person transported — including servants — turning labor recruitment directly into a land-grant strategy, not a religious, military, or abolition measure.",
  },
  {
    id: "case-004-mcq-frethorne-audience",
    prompt:
      "Richard Frethorne's 1623 letter was addressed to his parents rather than to a Virginia Company official. How does this most directly shape the letter as a source?",
    choices: [
      "Writing to parents who might send help, Frethorne had reason to describe his suffering candidly rather than downplay it for an investor's benefit",
      "Because it was addressed to family, the letter contains no information useful to historians",
      "Frethorne wrote to his parents because Virginia Company officials required all servant correspondence to pass through family review",
      "The letter was composed for eventual publication as promotional literature for the colony",
    ],
    answer: 0,
    explanation:
      "A private letter home to parents gave Frethorne a different incentive than official colonial reporting to investors — he had every reason to be candid about hunger, sickness, and fear rather than promote the colony.",
  },
  {
    id: "case-004-mcq-ledger-sourcing",
    prompt:
      "A wharf account recording tobacco hogsheads shipped out and English cloth and tools received in return is most useful to historians as evidence of what?",
    choices: [
      "The settlement's dependence on exporting a single staple crop to pay for manufactured goods",
      "The daily religious practices of the settlement's residents",
      "The colony's formal system of representative government",
      "The personal relationships between servants and planters",
    ],
    answer: 0,
    explanation:
      "Cargo and invoice entries like this one document economic exchange — tobacco for manufactured goods — not religious practice, governance, or personal relationships.",
  },
];

export const UNIT_02_EVIDENCE_ORGANIZING_QUESTS = [
  {
    id: "case-004-evidence-record-sourcing",
    prompt:
      "Match each Case 4 record to the historical-thinking skill it best demonstrates, then explain how the three records together trace a chain from land policy to labor to trade.",
    slots: [
      { id: "causation", label: "Causation" },
      { id: "sourcing-situation", label: "Sourcing" },
      { id: "continuity-and-change", label: "Continuity and Change" },
    ],
    sources: [
      {
        id: "riverbend-charter",
        label: "Instructions to Governor George Yeardley",
        attribution: "Virginia Company of London, 1618",
        excerpt:
          "The Virginia Company instructed its governor to grant fifty acres of land to every person transported into the colony at his own charge, and fifty acres more for every servant he brought and settled there.",
        skillCategory: "Causation",
        correctSlotId: "causation",
      },
      {
        id: "riverbend-letter",
        label: "Letter to His Parents from Jamestown",
        attribution: "Richard Frethorne, 1623",
        excerpt:
          "“I have nothing to comfort me, nor is there nothing to be gotten here but sickness and death, except that one had money to lay out in some things for profit.”",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
      {
        id: "riverbend-ledger",
        label: "Wharf Account: Tobacco Shipped, Goods Received",
        attribution: "Ship's factor, James River wharf, 1630 (representative entry)",
        excerpt:
          "Received of the ship Speedwell: fourteen hogsheads of tobacco. Delivered in return: cloth, iron hoes, knives, and sundry English wares.",
        skillCategory: "Continuity and Change",
        correctSlotId: "continuity-and-change",
      },
    ],
    reflectionPrompt:
      "In 2–3 sentences, explain how the headright charter's land policy, Frethorne's letter, and the wharf ledger together trace a causal chain from land policy to bound labor to an export economy.",
    rubric: {
      skillCategories: ["Causation", "Sourcing", "Continuity and Change"],
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
// 4's real CASE_004_SOURCES (also in apps/web/src/content/unit-02-campaign.js).
export const UNIT_02_SEQUENCING_QUESTS = [
  {
    id: "case-004-sequencing-headright-to-trade",
    prompt:
      "Arrange these Case 4 developments in the order that reflects how each one caused or enabled the next — not simply the order the dates occurred in.",
    items: [
      {
        id: "headright-enables-recruitment",
        label:
          "The 1618 instructions to Governor Yeardley grant fifty acres per person transported, giving planters a direct incentive to import indentured servants",
        position: 0,
      },
      {
        id: "frethorne-lived-reality",
        label:
          "Recruited under that incentive, Richard Frethorne's 1623 letter describes the hunger, sickness, and fear indentured servants actually faced in Virginia",
        position: 1,
      },
      {
        id: "wharf-ledger-export-economy",
        label:
          "The labor that servants like Frethorne performed produces the hogsheads of tobacco recorded leaving the wharf in exchange for English cloth and tools",
        position: 2,
      },
    ],
    explanation:
      "The headright system's land-per-person incentive is what drove planters to recruit bound labor in the first place; Frethorne's letter shows the human reality of the labor that incentive produced; and the labor performed by servants like Frethorne is precisely what filled the hogsheads recorded leaving the wharf in the ledger — completing the chain from land policy to lived labor to export economy.",
  },
];

// Archive Challenge content — migrates the "Region Builder" drag-and-drop activity
// (previously regionsScreen()/REGION_EVIDENCE/REGION_RECORDS in unit-02-campaign.js)
// onto the generic evidence-organizing quest-type contract, so Case 6 ("Charter &
// Compact") can be played from the Institute Archive Terminal via renderQuest/
// gradeQuest instead of a bespoke screen. Record text duplicated from
// REGION_EVIDENCE rather than imported, matching how UNIT_02_EVIDENCE_ORGANIZING_QUESTS
// above already duplicates CASE_004_SOURCES excerpts instead of importing them.
export const UNIT_02_ARCHIVE_CHALLENGE_QUESTS = [
  {
    id: "case-006-archive-region-display",
    prompt:
      "The Archive's display of the colonial regions is damaged. Return each founding record to the society it built, then defend one comparison in your reflection.",
    slots: [
      { id: "new-england", label: "New England" },
      { id: "middle", label: "Middle Colonies" },
      { id: "southern", label: "Southern Colonies" },
    ],
    sources: [
      {
        id: "town-covenant",
        label: "Town covenant",
        attribution: "The Dedham Covenant",
        excerpt:
          "“We whose names are hereunto subscribed do, in the fear and reverence of our Almighty God, mutually and severally promise amongst ourselves and each to other, to profess and practice one truth … and receive only such unto us as be such as may be probably of one heart with us.”",
        skillCategory: "Comparison",
        correctSlotId: "new-england",
      },
      {
        id: "headright-grant",
        label: "Headright grant",
        attribution: "Virginia headright land patent, Library of Virginia Land Office Patents",
        excerpt:
          "A named patentee is granted fifty acres per head for the transportation of listed persons, free or bound, into the colony — land in the Chesapeake distributed by how much labor a planter could import.",
        skillCategory: "Comparison",
        correctSlotId: "southern",
      },
      {
        id: "indenture-contract",
        label: "Indenture contract",
        attribution: "Representative Chesapeake indenture agreement, 17th century",
        excerpt:
          "A servant bound himself to a master's service for four to seven years in exchange for passage across the Atlantic, with food, lodging, and \"freedom dues\" promised at the term's end.",
        skillCategory: "Comparison",
        correctSlotId: "southern",
      },
      {
        id: "toleration-writ",
        label: "Liberty of conscience writ",
        attribution:
          "William Penn, Frame of Government of Pennsylvania, Laws Agreed Upon in England",
        excerpt:
          "“All persons living in this province … shall in no ways be molested or prejudiced for their religious persuasion or practice in matters of faith and worship.”",
        skillCategory: "Comparison",
        correctSlotId: "middle",
      },
      {
        id: "grain-manifest",
        label: "Flour export manifest",
        attribution: "Representative flour-export shipping notice, Pennsylvania Gazette",
        excerpt:
          "A Philadelphia-built brig clearing port laden with several hundred barrels of superfine flour bound for the West Indies — the breadbasket grain trade that fed Philadelphia's growth into the busiest port in British North America.",
        skillCategory: "Comparison",
        correctSlotId: "middle",
      },
      {
        id: "school-law",
        label: "Common school law",
        attribution: "Massachusetts Bay, \"The Old Deluder Satan Act\" (1647)",
        excerpt:
          "“Every township in this jurisdiction, after the Lord hath increased them to the number of fifty householders, shall then forthwith appoint one within their town to teach all such children as shall resort to him to write and read.”",
        skillCategory: "Comparison",
        correctSlotId: "new-england",
      },
    ],
    reflectionPrompt: "Which difference between two regions does your evidence best prove?",
    rubric: {
      skillCategories: ["Comparison"],
      pointsTotal: 6,
      description: "Earn 1 point per founding record correctly returned to the region it built.",
    },
  },
  // Second Archive Challenge (Phase B of the Investigation/Archive Challenge
  // plan's catalog-expansion pass), proving the evidence-organizing quest
  // type against a second case rather than only the case-006 pilot above.
  // Reuses Case 5's real TRIANGLE_LEGS/TRIANGLE_CARGO content (also in
  // apps/web/src/content/unit-02-campaign.js) — record labels/excerpts
  // duplicated from TRIANGLE_CARGO rather than imported, matching the
  // duplication convention the case-006 quest above already established.
  // triangleScreen()/the "triangle" route stays the case's primary
  // Navigation Table experience — this is a parallel, additional way to
  // engage the same content, not a replacement.
  {
    id: "case-005-archive-triangle-cargo",
    prompt:
      "The Archive's chart of the transatlantic circuit has come loose. Return each cargo record to the leg of the crossing that carried it, then defend your reasoning in the reflection.",
    slots: [
      { id: "outbound", label: "Outbound passage — England/Europe to West Africa" },
      { id: "middle", label: "The Middle Passage — West Africa to the Americas" },
      { id: "homeward", label: "Homeward passage — the Americas to England/Europe" },
    ],
    sources: [
      {
        id: "cloth-tools",
        label: "Cloth & ironware",
        attribution: "Royal African Company records · aggregate pattern, c. 1730s",
        excerpt:
          "Royal African Company invoices for Gold Coast voyages recur with the same short list of outbound goods — Manchester and Kentish cloth, iron and copper bars, and firearms — advanced against captives and gold on the African coast. Manufactured wares, not coin, were the trade's opening currency.",
        skillCategory: "Causation",
        correctSlotId: "outbound",
      },
      {
        id: "firearms",
        label: "Firearms & powder",
        attribution: "Willem Bosman, Dutch trader · 1705",
        excerpt:
          "Bosman's 1705 account of the Gold Coast trade describes muskets, gunpowder, and shot as a standard part of what European traders offered African merchants alongside cloth and iron — the Dutch, English, and other nations all competing to supply arms in exchange for captives and gold.",
        skillCategory: "Contextualization",
        correctSlotId: "outbound",
      },
      {
        id: "captives",
        label: "Enslaved people",
        attribution: "Olaudah Equiano, Middle Passage survivor · 1789",
        excerpt:
          "“The closeness of the place, and the heat of the climate, added to the number in the ship, which was so crowded that each had scarcely room to turn himself, almost suffocated us … This wretched situation was again aggravated by the galling of the chains … and the filth of the necessary tubs, into which the children often fell, and were almost suffocated.”",
        skillCategory: "Sourcing",
        correctSlotId: "middle",
      },
      {
        id: "shackles-record",
        label: "The ship's own log",
        attribution: "Society for Effecting the Abolition of the Slave Trade · 1788",
        excerpt:
          "The 1788 broadside diagrams the Liverpool slave ship Brooks with its hold divided into measured compartments, each stamped with rows of human figures laid side by side to show the maximum number — over four hundred — the ship's own owners calculated it could carry below deck.",
        skillCategory: "Comparison",
        correctSlotId: "middle",
      },
      {
        id: "sugar",
        label: "Sugar & molasses",
        attribution: "Representative Caribbean plantation account · c. 1730",
        excerpt:
          "Caribbean plantation accounts compiled from the period typically list hogsheads of sugar and puncheons of molasses shipped to England or the northern colonies against the planter's account, with the proceeds used to buy more enslaved laborers, provisions, and manufactured goods — sugar wealth circulating back into the labor system that produced it.",
        skillCategory: "Continuity and Change",
        correctSlotId: "homeward",
      },
      {
        id: "tobacco",
        label: "Tobacco hogsheads",
        attribution: "Navigation Act of 1660, Parliament of England · 12 Cha. II c. 18",
        excerpt:
          "“…no sugars, tobacco, cotton-wool, indigo, ginger, fustic, or other dyeing wood, of the growth, production, or manufacture of any English plantations in America, Asia, or Africa, shall be shipped, carried, conveyed, or transported from any of the said English plantations to any land, island, territory, dominion, port, or place whatsoever, other than to such English plantations as do belong to his majesty … or to the kingdom of England, Ireland, or … Wales.”",
        skillCategory: "Causation",
        correctSlotId: "homeward",
      },
    ],
    reflectionPrompt:
      "In 2–3 sentences, explain how one leg's cargo directly depended on or enabled what another leg of the circuit carried.",
    rubric: {
      skillCategories: ["Causation", "Contextualization", "Sourcing", "Comparison", "Continuity and Change"],
      pointsTotal: 6,
      description:
        "Earn 1 point per cargo record correctly returned to the leg of the triangular trade that carried it.",
    },
  },
];

// Investigation Challenge content (Phase A of the Investigation/Archive
// Challenge plan's catalog-expansion pass) — gates the wharf-ledger source's
// sourceReader() worksheet behind a pre-reveal prediction quest, the same
// mechanic UNIT_03_INVESTIGATION_QUESTS pioneered for case-007's Dunmore
// proclamation, proving out the history evidence-organizing quest-type
// contract as a gating mechanic instead of hipp. Framed as sorting
// *predicted* trade-category entries (not the actual riverbend-ledger
// excerpt, which stays behind the gate) into the categories a 1630s
// Chesapeake wharf account would plausibly contain, before the record
// unlocks — distinct from UNIT_02_EVIDENCE_ORGANIZING_QUESTS above, which
// sorts riverbend-ledger's real excerpt (post-reveal) by historical-thinking
// skill, not by trade category. The evidence items below are representative
// entries in the same spirit as riverbend-ledger's own excerpt (see its
// citation: "no single verbatim entry is quoted here"), modeled on the
// invoice/cargo-account pattern documented throughout Kingsbury's Records of
// the Virginia Company of London.
export const UNIT_02_INVESTIGATION_EVIDENCE_QUESTS = [
  {
    id: "case-004-investigation-evidence-riverbend-ledger",
    prompt:
      "Before you open the full wharf account, predict what kinds of entries a 1630s James River wharf ledger would contain. Sort each representative entry below into the trade category it belongs to.",
    slots: [
      { id: "exports", label: "Exports: staple crop shipped out" },
      { id: "imports", label: "Imports: manufactured goods received" },
      { id: "record-keeping", label: "Shipping and measurement record-keeping" },
    ],
    sources: [
      {
        id: "riverbend-ledger-predict-tobacco",
        label: "Tobacco Hogsheads Outbound",
        attribution: "Representative wharf ledger entry, James River, c. 1630",
        excerpt:
          "Fourteen hogsheads of tobacco, laded aboard the Speedwell for shipment to England.",
        skillCategory: "Contextualization",
        correctSlotId: "exports",
      },
      {
        id: "riverbend-ledger-predict-tobacco-parcel",
        label: "Additional Planters' Tobacco Consigned",
        attribution: "Representative wharf ledger entry, James River, c. 1630",
        excerpt:
          "A further parcel of hogsheads, consigned by neighboring planters, added to the same outbound shipment.",
        skillCategory: "Contextualization",
        correctSlotId: "exports",
      },
      {
        id: "riverbend-ledger-predict-cloth",
        label: "Kentish Cloth Received",
        attribution: "Representative wharf ledger entry, James River, c. 1630",
        excerpt: "Three pieces of Kentish cloth delivered to the planters' order at the landing.",
        skillCategory: "Contextualization",
        correctSlotId: "imports",
      },
      {
        id: "riverbend-ledger-predict-tools",
        label: "Iron Hoes and Knives Received",
        attribution: "Representative wharf ledger entry, James River, c. 1630",
        excerpt:
          "Two dozen iron hoes and six dozen knives, delivered in return for the tobacco shipped.",
        skillCategory: "Contextualization",
        correctSlotId: "imports",
      },
      {
        id: "riverbend-ledger-predict-tally",
        label: "Cask Weight Tally",
        attribution: "Representative wharf ledger entry, James River, c. 1630",
        excerpt:
          "Fourteen hogsheads, casked and weighed as within noted, entered against the ship Speedwell's account.",
        skillCategory: "Contextualization",
        correctSlotId: "record-keeping",
      },
    ],
    reflectionPrompt:
      "Before opening the full wharf account, predict in 2–3 sentences: what does sorting these entries into exports, imports, and record-keeping suggest about what kind of economy this 1630s Chesapeake settlement already depended on?",
    rubric: {
      skillCategories: ["Contextualization"],
      pointsTotal: 5,
      description: "Earn 1 point per entry correctly sorted into the trade category it represents.",
    },
  },
];

// Unit-level bonus Archive Challenge content (Phase C of the
// Investigation/Archive Challenge plan's catalog-expansion pass) — the first
// content in UNIT_02.archiveChallenges[] (a Zod field that existed but had
// never been populated by any unit). Not tied to relocating any single
// case's activity screen; reachable from archiveChallengesScreen()'s new
// bonus section. Kept in its own array (not merged into UNIT_02_MCQ_QUESTS)
// so it doesn't also surface as a practiceCheckScreen() card. A
// "strongest-evidence" framing: each prompt poses a real historical claim
// about Unit 2's content, and the choices are real excerpts already present
// elsewhere in this file (CASE_004_SOURCES, TRIANGLE_CARGO) — only one of
// which is the strongest direct support for the claim, the others being
// plausible but less direct.
export const UNIT_02_ARCHIVE_STRONGEST_EVIDENCE_QUESTS = [
  {
    id: "unit-02-archive-strongest-evidence-coerced-labor",
    prompt:
      "Historians argue that coerced and enslaved labor were central to building wealth in England's Atlantic colonies during this period. Which record below is the strongest direct evidence for that claim?",
    choices: [
      "The wharf account recording fourteen hogsheads of tobacco shipped from Riverbend in exchange for English cloth, hoes, and knives (1630) — shows the settlement's export economy, but not who performed the labor or how they were bound to it.",
      "Richard Frethorne's 1623 letter describing hunger, sickness, and despair as an indentured servant in Virginia — powerful evidence of what bound labor felt like, but it documents one servant's suffering, not how that labor built colonial wealth.",
      "Caribbean plantation accounts recording sugar and molasses shipped to England, with the proceeds spent on purchasing more enslaved laborers, provisions, and manufactured goods (c. 1730) — direct evidence that enslaved labor's profits were reinvested to expand the very labor system that produced them.",
      "Olaudah Equiano's 1789 account of the crowded, suffocating conditions of the Middle Passage — powerful evidence of the human cost of the slave trade, but focused on the voyage itself rather than how that labor went on to build colonial wealth.",
    ],
    answer: 2,
    explanation:
      "The plantation accounts are the strongest direct evidence because they show the actual mechanism connecting coerced labor to colonial wealth: profits from enslaved-produced sugar were spent on buying more enslaved laborers, expanding the very system that generated the wealth. Frethorne's letter and Equiano's account are powerful, closer-to-the-ground evidence of what bound and enslaved labor felt like, but neither directly shows wealth being built and reinvested; the wharf ledger shows an export economy but says nothing about who performed the labor or under what conditions.",
  },
  {
    id: "unit-02-archive-strongest-evidence-mercantile-policy",
    prompt:
      "Historians argue that English mercantile policy — not just market demand — determined where colonial staple crops could legally be sold. Which record below is the strongest direct evidence for that claim?",
    choices: [
      "The Navigation Act of 1660's enumerated-commodities clause, requiring that colonial tobacco, sugar, and other listed goods be shipped only to England or other English possessions, not sold directly to foreign markets.",
      "The wharf account recording tobacco hogsheads shipped out of Riverbend in exchange for English cloth and tools (1630) — shows a trading pattern, but not the legal requirement compelling it.",
      "Willem Bosman's 1705 account describing European nations competing to trade cloth, iron, and firearms for captives and gold on the Gold Coast — evidence about the outbound leg of the trade, not about restrictions on colonial exports.",
      "Royal African Company invoices showing outbound cargo of cloth, iron, and firearms bound for West Africa (c. 1730s) — evidence of what England exported, not of legal restrictions on what the colonies could sell and where.",
    ],
    answer: 0,
    explanation:
      "The Navigation Act's enumerated-commodities clause is the strongest direct evidence because it is the actual legal text requiring colonial tobacco and other listed goods to be shipped only to England or English possessions — a policy, not merely a market pattern. The wharf ledger shows a trading pattern consistent with that policy but doesn't reveal the legal requirement behind it, and the Bosman and Royal African Company records document the outbound leg of the trade to Africa, unrelated to restrictions on colonial exports.",
  },
];

export const UNIT_02_SOURCE_ANALYSIS_QUESTS = [
  {
    id: "case-004-hipp-frethorne-letter",
    prompt:
      "Analyze Richard Frethorne's 1623 letter using HIPP reasoning. For each dimension below, choose the option that explains how or why it shapes the letter's argument — not the option that merely names the correct answer.",
    document: {
      text:
        "Loving and kind father and mother, my most humble duty remembered to you, hoping in God of your good health. This is to let you understand that I your child am in a most heavy case by reason of the country, which causeth much sickness, as the scurvy and the bloody flux, and diverse other diseases. And I have nothing to comfort me, nor is there nothing to be gotten here but sickness and death, except that one had money to lay out in some things for profit. But I have nothing at all — no, not a shirt to my back but two rags, nor no clothes but one poor suit. People cry out day and night — Oh, that they were in England without their limbs — and would not care to lose any limb to be in England again, yea, though they beg from door to door. I have nothing to eat but a mouthful of bread and beef, a mouthful of bread must serve four men a day. I pray you to remember my love to all my friends and kindred. I humbly desire you to send me some cheese and butter and anything else you think fitting for me, for you cannot imagine the misery that I endure in this miserable kind of life. If you love me, you will not forget me, but if you forget me, then I am like never to see England again.",
      attribution: "Richard Frethorne, letter to his father and mother, March 20, 1623",
    },
    hippPrompts: [
      {
        id: "frethorne-audience",
        dimension: "Intended audience",
        argument:
          "Frethorne addressed his parents directly, the people most likely to intervene on his behalf by sending food, money, or influence toward his release — this shapes what he chooses to reveal.",
        options: [
          {
            id: "audience-explained",
            text:
              "Because his parents were the people most able to send him money, food, or help toward securing his release, Frethorne describes his hunger and suffering in stark, unflattering detail rather than reassuring them that all is well.",
            correct: true,
          },
          {
            id: "audience-named-only",
            text: "Richard Frethorne addressed the letter to his father and mother in England.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "audience-wrong-investor",
            text:
              "Frethorne wrote to a Virginia Company investor who needed reassurance that the colony was profitable.",
            correct: false,
          },
          {
            id: "audience-wrong-king",
            text: "The letter was addressed to King James I to request a royal pardon.",
            correct: false,
          },
        ],
      },
      {
        id: "frethorne-purpose",
        dimension: "Purpose",
        argument:
          "Frethorne's purpose was to move his parents to act — sending money, food, or help ending his servitude — which is why he foregrounds suffering rather than any opportunity Virginia offered.",
        options: [
          {
            id: "purpose-explained",
            text:
              "By emphasizing hunger, sickness, and fear rather than any opportunity Virginia offered, Frethorne builds the case that his parents must act — sending food, money, or help ending his indenture — or he may not survive to see them again.",
            correct: true,
          },
          {
            id: "purpose-named-only",
            text: "Frethorne wrote the letter to describe conditions in Virginia to his parents.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "purpose-wrong-recruit",
            text:
              "Frethorne's purpose was to recruit his parents to join him as fellow indentured servants in Virginia.",
            correct: false,
          },
          {
            id: "purpose-wrong-resign",
            text: "The letter's purpose was to formally resign his indenture contract to the Virginia Company.",
            correct: false,
          },
        ],
      },
    ],
  },
];
