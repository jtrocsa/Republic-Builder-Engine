// Unit 3 (Period 3: 1754–1800) quest content, structural mirror of
// unit-02-quests.js, built against Case 7's real CASE_007_SOURCES
// (apps/web/src/content/unit-03-campaign.js).
//
// This file is the explicit gap-closing deliverable for the "Comparison"
// historical-thinking skill: UNIT_03_EVIDENCE_ORGANIZING_QUESTS below tags
// two sources — Prince Hall's 1777 freedom petition and Abigail Adams's 1776
// "remember the ladies" letter — as Comparison, the first real
// Comparison-tagged content in a field-route case's Practice Check surface
// since Unit 2 shipped.
export const UNIT_03_MCQ_QUESTS = [
  {
    id: "case-007-mcq-pontiac-sourcing",
    prompt:
      "Pontiac's 1763 speech survives only as an English translation of a contemporary French-recorded council account — no transcript exists in Pontiac's own language. This fact is most important for what reason?",
    choices: [
      "It means historians must treat the exact wording as filtered through translation and recording by others, not as Pontiac's verbatim words",
      "It means the speech should be dismissed entirely as historical evidence",
      "It proves Pontiac's Rebellion never actually occurred",
      "It shows that Pontiac's speech was written by British colonial officials to justify war",
    ],
    answer: 0,
    explanation:
      "A source's path from an event to the page a Chronicler reads (translation, recording, editorial reprinting) doesn't make it worthless — but it does mean claims resting on its precise wording need to account for how many hands shaped that wording before it survived.",
  },
  {
    id: "case-007-mcq-dunmore-causation",
    prompt:
      "Lord Dunmore's 1775 proclamation offered freedom only to enslaved people held by Patriot enslavers who joined British forces — not to enslaved people generally. What does this narrow scope reveal about Dunmore's purpose?",
    choices: [
      "The offer was a wartime strategy to weaken the rebellion's labor force and build a Loyalist military force, not a general antislavery measure",
      "Dunmore intended to abolish slavery throughout the British Empire",
      "The proclamation was aimed at freeing enslaved people held by Loyalist planters",
      "The proclamation had no connection to the outbreak of the Revolutionary War",
    ],
    answer: 0,
    explanation:
      "By exempting enslaved people held by Loyalists, Dunmore revealed the proclamation's purpose was military and punitive toward rebels, not a principled stand against slavery itself.",
  },
  {
    id: "case-007-mcq-comparison-hall-adams",
    prompt:
      "Prince Hall's 1777 petition for enslaved Black Bostonians' freedom and Abigail Adams's 1776 letter urging expanded legal rights for women both",
    choices: [
      "used the Revolution's natural-rights and no-law-without-consent language to argue for rights the Revolution's leaders had not extended to their own group",
      "were formally adopted into Massachusetts and Continental Congress law within the year they were written",
      "argued that only white male property holders deserved expanded rights under the new nation",
      "were written by the same author under two different names",
    ],
    answer: 0,
    explanation:
      "Both documents borrow the Revolution's own justifying language — natural, unalienable rights and no binding law without consent or representation — to press claims for groups (enslaved Black Americans, women) the Revolution's institutions did not extend those rights to; neither was acted on by the bodies they addressed.",
  },
];

export const UNIT_03_EVIDENCE_ORGANIZING_QUESTS = [
  {
    id: "case-007-evidence-record-sourcing",
    prompt:
      "Match each Case 7 record to the historical-thinking skill it best demonstrates, then explain what Prince Hall's petition and Abigail Adams's letter reveal when compared to each other.",
    slots: [
      { id: "contextualization", label: "Contextualization" },
      { id: "causation", label: "Causation" },
      { id: "continuity-and-change", label: "Continuity and Change" },
      { id: "sourcing-situation", label: "Sourcing" },
      { id: "comparison", label: "Comparison" },
    ],
    sources: [
      {
        id: "commoncause-pontiac-speech",
        label: "Speech at a Council near Detroit",
        attribution: "Pontiac (Odawa), 1763",
        excerpt:
          "This land, where you live, I have made for you and not for others… The Master of Life has ordered me to drive from your lands those dogs in red clothing who will do you nothing but harm.",
        skillCategory: "Contextualization",
        correctSlotId: "contextualization",
      },
      {
        id: "commoncause-dunmore-proclamation",
        label: "Lord Dunmore's Proclamation",
        attribution: "John Murray, Earl of Dunmore, November 7, 1775",
        excerpt:
          "I do hereby further declare all indentured servants, Negroes, or others, (appertaining to Rebels,) free that are able and willing to bear arms, they joining His Majesty's Troops.",
        skillCategory: "Causation",
        correctSlotId: "causation",
      },
      {
        id: "commoncause-wheatley-poem",
        label: "On the Death of Reverend Mr. George Whitefield",
        attribution: "Phillis Wheatley, 1773 (composed 1770)",
        excerpt: "Take him, ye Africans, he longs for you; / Impartial Saviour is his title due.",
        skillCategory: "Continuity and Change",
        correctSlotId: "continuity-and-change",
      },
      {
        id: "commoncause-henry-speech",
        label: "Give Me Liberty, or Give Me Death",
        attribution:
          "Patrick Henry, reconstructed by William Wirt, 1817 (of a March 23, 1775 speech)",
        excerpt:
          "Is life so dear, or peace so sweet, as to be purchased at the price of chains and slavery? Forbid it, Almighty God! … give me liberty, or give me death!",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
      {
        id: "commoncause-hall-petition",
        label: "Petition for Freedom to the Massachusetts Council and House of Representatives",
        attribution: "Prince Hall et al., January 13, 1777",
        excerpt:
          "Your petitioners apprehend that they have in common with all other men a natural and unalienable right to that freedom which the great Parent of the universe hath bestowed equally on all mankind.",
        skillCategory: "Comparison",
        correctSlotId: "comparison",
      },
      {
        id: "commoncause-adams-letter",
        label: 'Letter to John Adams, "Remember the Ladies"',
        attribution: "Abigail Adams, March 31 – April 5, 1776",
        excerpt:
          "I desire you would Remember the Ladies… Remember all Men would be tyrants if they could… we are determined to foment a Rebellion, and will not hold ourselves bound by any Laws in which we have no voice, or Representation.",
        skillCategory: "Comparison",
        correctSlotId: "comparison",
      },
    ],
    reflectionPrompt:
      "In 3–4 sentences, compare Prince Hall's petition and Abigail Adams's letter: what claim does each make using the Revolution's own language of rights and consent, and how differently was each received by the institutions it addressed?",
    rubric: {
      skillCategories: [
        "Contextualization",
        "Causation",
        "Continuity and Change",
        "Sourcing",
        "Comparison",
      ],
      pointsTotal: 6,
      description:
        "Earn 1 point per record correctly matched to the historical-thinking skill it best demonstrates.",
    },
  },
];

export const UNIT_03_SEQUENCING_QUESTS = [
  {
    id: "case-007-sequencing-frontier-to-founding",
    prompt:
      "Arrange these Case 7 developments in the order that reflects how each one caused or enabled the next — not simply the order the dates occurred in.",
    items: [
      {
        id: "frontier-encroachment-pontiac",
        label:
          "After the Seven Years' War, British forts and settlers push onto lands recently promised to Indigenous nations, and Pontiac calls for resistance at a 1763 council near Detroit",
        position: 0,
      },
      {
        id: "townshend-protest-dickinson",
        label:
          "Parliament's new revenue acts on imported goods draw organized protest, including John Dickinson's 1767 newspaper letters denying Parliament's right to tax colonists for revenue",
        position: 1,
      },
      {
        id: "armed-resistance-henry",
        label:
          "Protest escalates toward open resistance, and Patrick Henry urges the Second Virginia Convention to arm its militia in March 1775",
        position: 2,
      },
      {
        id: "war-exploited-dunmore",
        label:
          "Once war has begun, Virginia's royal governor Lord Dunmore offers freedom to enslaved people who join British forces against their Patriot enslavers, in November 1775",
        position: 3,
      },
      {
        id: "ideals-claimed-hall-adams",
        label:
          "As independence is declared, groups excluded from the Revolution's promises invoke its own natural-rights language for themselves — Abigail Adams for women's legal standing, Prince Hall for enslaved Black Bostonians' freedom",
        position: 4,
      },
    ],
    explanation:
      "Post-war frontier encroachment provoked Pontiac's resistance; escalating parliamentary taxation provoked organized protest like Dickinson's; that protest escalated toward Henry's call to arms; the war Henry helped bring about gave Dunmore a strategic reason to offer enslaved people freedom for joining the Crown; and the Revolution's own declared ideals, once articulated, were then claimed by groups — enslaved Black Americans and women — the Revolution's leaders had not intended to include, completing the chain from frontier grievance to a founding whose promises reached unevenly.",
  },
];

// Investigation Challenge content — gates field access to a source's full
// sourceReader() worksheet (see main.js's sourceEntryScreen()/investigationScreen()).
// Reuses the "hipp" quest type/schema as-is (SourceAnalysisQuestSchema), reframed
// as a pre-reveal "Source Prediction": the Chronicler reasons about Point of view
// and Purpose from the record's wording alone, before Institute Context (a
// separate, later reveal inside sourceReader()) supplies the fuller background.
// Kept in its own array (not merged into UNIT_03_SOURCE_ANALYSIS_QUESTS) so it
// doesn't also surface as a practiceCheckScreen() card — mirrors how
// UNIT_02_ARCHIVE_CHALLENGE_QUESTS stays separate from UNIT_02_EVIDENCE_ORGANIZING_QUESTS.
export const UNIT_03_INVESTIGATION_QUESTS = [
  {
    id: "case-007-investigation-dunmore-proclamation",
    prompt:
      "Before you open the full record, read Lord Dunmore's proclamation and predict its Point of view and Purpose from the wording alone. You'll compare your prediction with Institute Context once the record unlocks.",
    document: {
      text: "I do require every person capable of bearing arms, to resort to his Majesty's STANDARD, or be looked upon as traitors… and I do hereby further declare all indentured servants, Negroes, or others, (appertaining to Rebels,) free that are able and willing to bear arms, they joining His Majesty's Troops as soon as may be, for the more speedily reducing this Colony to a proper sense of their duty, to His Majesty's crown and dignity.",
      attribution:
        "John Murray, Earl of Dunmore, Royal Governor of Virginia, proclamation, November 7, 1775",
    },
    hippPrompts: [
      {
        id: "dunmore-point-of-view",
        dimension: "Point of view",
        argument:
          "Dunmore was Virginia's royal governor, writing from a British warship after Patriot militia had already driven him from the colony's government — a position that shapes whose interests this proclamation serves.",
        options: [
          {
            id: "pov-explained",
            text: "As a royal governor loyal to the Crown who had just been driven from power by Patriot militia, Dunmore writes as an official punishing rebellion and shoring up British military strength — not as someone opposed to slavery itself.",
            correct: true,
          },
          {
            id: "pov-named-only",
            text: "Dunmore was the Royal Governor of Virginia in 1775.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "pov-wrong-neutral",
            text: "Dunmore writes as a neutral outsider with no stake in whether Britain or the colonies win the war.",
            correct: false,
          },
          {
            id: "pov-wrong-abolitionist",
            text: "Dunmore writes as a committed abolitionist seeking to free all enslaved people in Virginia regardless of loyalty.",
            correct: false,
          },
        ],
      },
      {
        id: "dunmore-purpose",
        dimension: "Purpose",
        argument:
          "The proclamation offers freedom only to enslaved people held by Patriot enslavers who are 'able and willing to bear arms' for the King — not to enslaved people generally, and not to any held by Loyalists.",
        options: [
          {
            id: "purpose-explained",
            text: "By limiting the offer to able-bodied men willing to fight and excluding anyone held by Loyalists, Dunmore's purpose was to weaken the rebellion's labor force and build an armed force for the Crown — a wartime military strategy, not an antislavery measure.",
            correct: true,
          },
          {
            id: "purpose-named-only",
            text: "Dunmore issued this proclamation on November 7, 1775.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "purpose-wrong-abolish",
            text: "Dunmore's purpose was to abolish slavery throughout the British Empire.",
            correct: false,
          },
          {
            id: "purpose-wrong-peace",
            text: "Dunmore's purpose was to negotiate a peace settlement with the Continental Congress.",
            correct: false,
          },
        ],
      },
    ],
  },
];

// Second Investigation Challenge content pass (Phase A of the Investigation/
// Archive Challenge plan's catalog-expansion pass) — gates the Dickinson
// letter's sourceReader() worksheet behind a pre-reveal prediction quest,
// proving out the generic mcq quest-type contract as a gating mechanic
// (UNIT_03_INVESTIGATION_QUESTS above already proved out hipp for the
// Dunmore proclamation). Kept in its own array, separate from
// UNIT_03_INVESTIGATION_QUESTS, so main.js's INVESTIGATION_QUESTS_BY_TYPE
// map can key "hipp" and "mcq" investigation content independently without
// the two mixing. Two entries are authored; only the first is wired via
// investigationQuestId (CASE_007_SOURCES), matching how a single object is
// fetched by investigationQuestFor() — the second is kept as a ready second
// question for a future multi-question gate.
export const UNIT_03_INVESTIGATION_MCQ_QUESTS = [
  {
    id: "case-007-investigation-mcq-dickinson-persona",
    prompt:
      "This essay's title, “Letters from a Farmer in Pennsylvania, Letter II,” credits no author by name — John Dickinson, a Philadelphia lawyer and assemblyman, published the series anonymously under the persona of a modest “Farmer.” Before opening the full letter, what should a Chronicler predict this choice signals about Dickinson's intended rhetorical strategy?",
    choices: [
      "A calm, reasonable persona meant to persuade moderate colonists and sympathetic Britons, not just committed radicals",
      "A satirical persona meant to mock rural colonists as too ignorant to understand Parliament's tax policy",
      "A disguise meant to conceal a call for immediate, violent separation from Britain",
      "A neutral persona adopted only to protect Dickinson's law license, with no argumentative purpose",
    ],
    answer: 0,
    explanation:
      "A modest, reasonable “Farmer” persona — rather than Dickinson's own well-known name as a lawyer and assemblyman, or an inflammatory pen name — fits a strategy aimed at winning over moderate, undecided readers rather than preaching only to colonists already committed to resistance.",
  },
  {
    id: "case-007-investigation-mcq-dickinson-strategy",
    prompt:
      "This essay is dated December 10, 1767 and is described as part of a serialized newspaper series opposing the Townshend Revenue Act's new import duties, published in a colonial press that had never fully denied Parliament's authority over colonial trade. Before opening the full letter, what argumentative strategy should a Chronicler predict Dickinson uses against that backdrop?",
    choices: [
      "Concede Parliament's power to regulate colonial trade while denying it may tax colonists to raise revenue — a narrower, more legally defensible line than rejecting Parliament's authority outright",
      "Reject any Parliament authority over the colonies whatsoever, including the power to regulate trade",
      "Argue that the colonies should accept the Townshend duties as a reasonable and necessary trade measure",
      "Call for colonial representatives to be seated in Parliament as the only acceptable resolution",
    ],
    answer: 0,
    explanation:
      "Writing for an audience that had not denied Parliament's trade-regulating power outright, a persuasive strategy would concede that narrower authority while drawing a sharper line against taxation for revenue — which is exactly the distinction Dickinson's Letter II goes on to draw.",
  },
];

// Unit-level bonus Archive Challenge content (Phase C of the
// Investigation/Archive Challenge plan's catalog-expansion pass) — the first
// content in UNIT_03.archiveChallenges[] (a Zod field that existed but had
// never been populated by any unit). Not tied to relocating any single
// case's activity screen; reachable from archiveChallengesScreen()'s new
// bonus section. Reuses Prince Hall's petition and Abigail Adams's letter —
// the same two sources UNIT_03_EVIDENCE_ORGANIZING_QUESTS above already
// tags "Comparison" — but with a freshly authored, distinct 2-slot framing
// (sorted by the *form* of appeal each made, not by historical-thinking
// skill) and a new reflection prompt, rather than duplicating that quest.
export const UNIT_03_ARCHIVE_CHALLENGE_QUESTS = [
  {
    id: "unit-03-archive-appeal-form-comparison",
    prompt:
      "The Archive's record of how Revolutionary rights language reached beyond its intended audience has come loose. Sort each record beneath the form of appeal it made.",
    slots: [
      { id: "public-petition", label: "Formal Petition to a Legislative Body" },
      { id: "private-appeal", label: "Private Appeal Within a Personal Relationship" },
    ],
    sources: [
      {
        id: "hall-petition-appeal-form",
        label: "Petition for Freedom to the Massachusetts Council and House of Representatives",
        attribution: "Prince Hall et al., January 13, 1777",
        excerpt:
          "Your petitioners apprehend that they have in common with all other men a natural and unalienable right to that freedom which the great Parent of the universe hath bestowed equally on all mankind.",
        skillCategory: "Contextualization",
        correctSlotId: "public-petition",
      },
      {
        id: "adams-letter-appeal-form",
        label: 'Letter to John Adams, "Remember the Ladies"',
        attribution: "Abigail Adams, March 31 – April 5, 1776",
        excerpt:
          "I desire you would Remember the Ladies… Remember all Men would be tyrants if they could… we are determined to foment a Rebellion, and will not hold ourselves bound by any Laws in which we have no voice, or Representation.",
        skillCategory: "Sourcing",
        correctSlotId: "private-appeal",
      },
    ],
    reflectionPrompt:
      "In 2–3 sentences, explain how the form each appeal took — a formal petition to a legislature versus a private letter to a husband — shaped what its author could say, and how each was likely received by its audience.",
    rubric: {
      skillCategories: ["Contextualization", "Sourcing"],
      pointsTotal: 2,
      description: "Earn 1 point per record correctly matched to the form of appeal it made.",
    },
  },
];

export const UNIT_03_SOURCE_ANALYSIS_QUESTS = [
  {
    id: "case-007-hipp-henry-speech",
    prompt:
      "Analyze Patrick Henry's 1775 speech using HIPP reasoning. For each dimension below, choose the option that explains how or why it shapes the speech's argument — not the option that merely names the correct answer.",
    document: {
      text: "It is in vain, sir, to extenuate the matter. Gentlemen may cry, Peace, Peace — but there is no peace. The war is actually begun! The next gale that sweeps from the north will bring to our ears the clash of resounding arms! Our brethren are already in the field! Why stand we here idle? What is it that gentlemen wish? What would they have? Is life so dear, or peace so sweet, as to be purchased at the price of chains and slavery? Forbid it, Almighty God! I know not what course others may take; but as for me, give me liberty, or give me death!",
      attribution:
        "Patrick Henry, speech to the Second Virginia Convention, Richmond, Virginia, March 23, 1775 (as reconstructed by biographer William Wirt, 1817)",
    },
    hippPrompts: [
      {
        id: "henry-historical-situation",
        dimension: "Historical situation",
        argument:
          "No transcript of Henry's speech was made in 1775; this wording was reconstructed more than forty years later by William Wirt from the recollections of elderly witnesses, which shapes how much weight the speech's precise phrasing can bear as evidence of Henry's exact words.",
        options: [
          {
            id: "situation-explained",
            text: "Because this text was reconstructed decades after 1775 from witnesses' memories rather than transcribed at the time, historians can trust the speech's broader argument and impact but should be cautious about treating any single phrase as Henry's exact, verbatim wording.",
            correct: true,
          },
          {
            id: "situation-named-only",
            text: "This speech was reconstructed by William Wirt in his 1817 biography of Patrick Henry.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "situation-wrong-fabricated",
            text: "Because Wirt reconstructed the speech in 1817, historians know it is entirely fabricated and reflects no real event.",
            correct: false,
          },
          {
            id: "situation-wrong-stenographer",
            text: "The speech was recorded word-for-word by a court stenographer present at the Second Virginia Convention in 1775.",
            correct: false,
          },
        ],
      },
      {
        id: "henry-purpose",
        dimension: "Purpose",
        argument:
          "Henry's purpose was to move a divided Convention to authorize arming Virginia's militia by arguing that war had already begun and that inaction was itself a choice for 'chains and slavery.'",
        options: [
          {
            id: "purpose-explained",
            text: "By declaring that war was already underway and framing continued inaction as choosing 'chains and slavery,' Henry aimed to push wavering delegates past debate and toward voting to arm Virginia's militia immediately.",
            correct: true,
          },
          {
            id: "purpose-named-only",
            text: "Patrick Henry delivered this speech to the Second Virginia Convention.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "purpose-wrong-reconciliation",
            text: "Henry's purpose was to negotiate a peaceful reconciliation between Virginia and King George III.",
            correct: false,
          },
          {
            id: "purpose-wrong-apology",
            text: "The speech was intended to persuade the Convention to send a delegation apologizing to Parliament.",
            correct: false,
          },
        ],
      },
    ],
  },
];
