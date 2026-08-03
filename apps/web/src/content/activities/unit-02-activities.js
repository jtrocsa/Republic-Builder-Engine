// Case 2.01's three activities, keyed by the source id each one opens from.
//
// The second unit to run on the engines from docs/decision-log/0051, and the
// first to be authored onto them from scratch rather than migrated off a welded
// screen. Every field here is content: the engines in engine/activities/ know
// none of it. See docs/decision-log/0053.
//
// The slate is deliberately not Unit 1's. The Caribbean runs INTERVIEW,
// ASSEMBLY and DISCREPANCY; Riverbend runs INTERVIEW, DISCREPANCY and TRACE, so
// the two adjacent units differ by an engine rather than only by their nouns
// (MISSION-ACTIVITY-CATALOG §5 rule 2). This is TRACE's first shipped content
// anywhere — 0051 §5 named Canal Crossroads for that, and the owner moved it
// here, because a wharf account of a staple crop leaving for London is the
// purest chain in the game and it sits on a map a player can already walk.
//
// The three are meant to be played in the order the field gate enforces. The
// charter's interview comes first (riverbend-letter carries requiresSourceId),
// because Frethorne's audit reads its evidence column out of what the interview
// logged. The ledger's trace is deliberately left ungated: it works cold, and
// its first leg lands harder for a player who has already met the field hands.
//
// Token format for `requires` is `asked:<npc id>:<question id>` — built by
// main.js's interviewTokens() from the interview's *logged* answers. Hearing
// something is not carrying it. Every speaker id below is a real NPC id in
// UNIT2_FIELD_NPCS, which tests/unit/field-map-coordinates.test.js asserts.

// ---- M2.A — "By Whose Head" (INTERVIEW, riverbend-charter) --------------------------------------
//
// The 1618 instructions to Governor Yeardley grant fifty acres for every person
// transported into Virginia at the transporter's own charge, and fifty more for
// every servant he brings and settles. That is the headright, and the whole
// mission is one consequence of how it is worded: land is granted by the head,
// and the head need not be your own.
//
// Four questions, eight speakers, exactly eight useful answers — one per person,
// which is also the completion bar (`requires.useful`, per 0052 §3: one number,
// not two). The eight are spread across all four questions so none of them is
// dead, and two people are useful on the same question on purpose: `owed`, put
// to the two men working adjacent fields, comes back as a term and as a silence.
//
// **The grid is deliberately sparse — 24 of 32 cells, three per speaker.** It
// shipped full in Phase 70, at an average of 31 words per non-useful answer,
// which made asking everyone everything the dominant strategy and reading a
// person's position pointless. Each speaker now carries one useful answer, two
// short deflections that mostly name who to ask instead, and one question left
// unauthored so their `fallback` fires. Three flat answers are load-bearing and
// were trimmed rather than cut — `indentured-servant:passage`, `wharf-clerk:land`
// and `settlement-burgess:owed` key the audit's three optional observations.
//
// The Angolan man's answer must stay unresolved. The August 1619 arrivals off
// the White Lion were traded at Point Comfort for provisions and the muster
// rolls list them without a term — neither the chattel slavery Virginia would
// codify decades later nor the termed indenture the Englishman beside him holds.
// main.js's NPC table already makes that call in his ambient line and says why.
// This mission does not resolve it either, because the record does not.
const BY_WHOSE_HEAD = {
  kind: "interview",
  id: "case-004-interview-by-whose-head",
  title: "By Whose Head",
  variant: "Whose Account Do You File?",
  missionQuestion:
    "The charter grants fifty acres a head. Whose heads, and whose acres — and who does the grant not count at all?",
  thinkingMove:
    "Comparing accounts of one arrangement from the positions of the people inside it. Where a person stands changes what the same rule looks like.",
  debrief: {
    speaker: "wharf-clerk",
    line: "You have it. The fifty acres follow the man who paid the freight, and I write both facts in the same hand at the same moment. Nobody in eleven years has asked me to write it any other way.",
    established:
      "The headright follows the payer, not the passenger. Everyone you asked confirms the same rule from a different position: the servant whose crossing earned land he will never see, the burgess whose seat in the Assembly was bought with eleven other men's passages, the clerk who enters both facts in one line. The system is not hidden. It is written down, in public, by people who can each describe their own part of it.",
    remains:
      "What the law said the Angolan man's status was in 1630. He is counting down to nothing anybody has named, and that is exactly what the surviving record shows — not a category, but the absence of one.",
  },
  openQuestions: [
    "Whether the Africans landed at Point Comfort in 1619 were held as servants or as slaves. The Virginia statutes that define hereditary slavery come decades later, and historians read the intervening years differently.",
    "How Tsenacommacah's own leadership understood the English land grants. Nothing you gathered records a Powhatan account of the patents themselves.",
  ],
  historicalRecord: {
    documented: [
      "The headright system: fifty acres granted for every person transported, to whoever paid the passage. Set out in the Virginia Company's 1618 Instructions to Governor George Yeardley.",
      "The 1619 General Assembly, the first representative assembly in English America, and the property qualification behind a seat in it.",
      "The arrival of some twenty Angolans at Point Comfort in 1619, and the Kingdom of Ndongo and port of Luanda they were taken from.",
      "Tsenacommacah — the Powhatan paramount chiefdom of roughly thirty towns, with its own fields, weirs and paths, whose corn carried the English settlement through early winters.",
      "Women's role in Powhatan agriculture and in decisions about what corn could be spared.",
    ],
    reconstructed: [
      "All sixteen people at Riverbend. They are composites drawn from what the records establish about Chesapeake settlement in these years, not individuals anyone named.",
      "Riverbend itself, as a settlement. The place is a composite of the Virginia tidewater; the arrangements inside it are not invented.",
    ],
    fiction: [
      "Chronotravel, the Chronicle Institute, and a record that can be secured in the field.",
    ],
    debated: [
      "The legal and social status of the 1619 Angolans and their children. This is one of the most actively argued questions in early American history, and the surviving documents genuinely do not settle it.",
    ],
  },
  intro:
    "The charter grants fifty acres for every person brought across the Atlantic. It does not say the acres go to the person. Everyone standing on this ground is an answer to that sentence — put the question to them and see which one they are.",
  howItWorks: {
    steps: [
      "You may ask any question to any person. Consider their position.",
      "Most people will send you elsewhere. When someone gives you something worth keeping, press Add to Field Notebook.",
      "Eight people, eight accounts — one from each. That is the whole mission.",
    ],
    note: "What goes in your Field Notebook is what you carry into Richard Frethorne's letter at the field edge. A question you never asked is a line of it you have no way to check.",
  },
  briefing: {
    speaker: "settlement-minister",
    line: "The Company's instructions are plain enough, and I read them aloud twice a year. Fifty acres a head. Read it once more and tell me whose head, and whose acres — I have never had a satisfying answer out of anyone who was not standing in a field.",
  },
  terms: [
    {
      term: "headright",
      definition:
        "Fifty acres of Virginia land, granted to whoever paid a person's passage across the Atlantic — and fifty more for every servant that person brought and settled. The grant follows the payer, not the passenger.",
    },
    {
      term: "indenture",
      definition:
        "A contract of bound service for a fixed term, usually four to seven years, exchanged for passage. At its end the servant is owed freedom dues — commonly corn and a suit of clothes — and is free.",
    },
    {
      term: "muster",
      definition:
        "The colony's periodic headcount of who is living where, and under whom. It is the record the settlement keeps of itself, and it counts people the way the people counting them think of them.",
    },
    {
      term: "Tsenacommacah",
      definition:
        "The Powhatan name for this country — some thirty towns under a paramount chief, with fields, weirs and trade routes long predating the settlement. It is not a word the Company's instructions use.",
    },
  ],
  questions: [
    { id: "passage", label: "Who paid to bring you here, and what did it cost you?" },
    { id: "land", label: "What land do you hold, and by what right?" },
    { id: "voice", label: "Who speaks for you when this settlement decides something?" },
    { id: "owed", label: "What do you owe, and when does it end?" },
  ],
  groups: [
    {
      id: "settlement",
      label: "The settlement's own people",
      note: "Everyone the muster counts, in the order the muster would count them.",
    },
    {
      id: "tsenacommacah",
      label: "The country the settlement stands in",
      note: "Two people out of some thirty towns. That the panel is short is a fact about the record, not about the country.",
    },
  ],
  speakers: [
    {
      id: "settlement-minister",
      name: "Settlement minister",
      role: "Keeps the Company's instructions and reads them aloud",
      group: "settlement",
      fallback: "He waits, with one hand flat on the book, and does not help you.",
      answers: {
        passage: {
          text: "The Company's, and I am not the interesting case. Ask a man who came over owing for it.",
        },
        land: {
          text: "Fifty acres to every person transported into this colony at his own charge, and fifty more for every servant he brings and settles here. That is the sentence. Read it slowly: the grant follows the man who paid the passage, not the man who made the crossing. The land is counted out by the head, and the head need not be your own.",
          useful: true,
        },
        voice: {
          text: "The Assembly speaks for the settlement. Whether it speaks for you depends on who you are — go and ask them.",
        },
      },
    },
    {
      id: "settlement-burgess",
      name: "Elected burgess",
      role: "Sits in the Assembly for this settlement",
      group: "settlement",
      fallback: "He nods pleasantly and offers you nothing at all.",
      answers: {
        land: {
          text: "Eight hundred acres along the creek. Ask the clerk how a man gets eight hundred out of a grant of fifty.",
        },
        voice: {
          text: "I do, and I will tell you exactly how I came to. A man may stand for burgess if he is a freeman holding ground. I hold ground because I paid the passage of eleven people, and the charter gave me fifty acres for each of them. Count it however you like: my seat in that Assembly was bought with eleven other men's crossings, and every one of them is still working.",
          useful: true,
        },
        // Load-bearing: the audit keys an optional observation off it. Trimmed, not cut.
        owed: {
          text: "Quitrent to the Company. It is not a debt that takes years off a man's life. Ask someone whose does.",
        },
      },
    },
    {
      id: "wharf-clerk",
      name: "Wharf clerk",
      role: "Enters every arrival and every cask at the landing",
      group: "settlement",
      fallback: "He turns the book a little away from you and goes on ruling lines.",
      answers: {
        passage: {
          text: "I enter every soul that comes off a ship at this landing. Name, ship, date, and who paid the freight — all four on one line, because the fourth is the one the patent office wants. The man who paid is the man the fifty acres go to, and I write both facts in the same hand at the same moment. Nobody in eleven years has asked me to write it any other way.",
          useful: true,
        },
        // Load-bearing: the audit keys an optional observation off it. Trimmed, not cut.
        land: {
          text: "None. I hold a stool and a book. The men whose acres I write down never come to the landing — it is their servants I see.",
        },
        owed: {
          text: "My wages, when the factor remembers them. If you want the casks, that is a different record and it is here at the wharf.",
        },
      },
    },
    {
      id: "indentured-servant",
      name: "Indentured field servant",
      role: "Four years into seven",
      group: "settlement",
      fallback: "He straightens, looks at the row, and bends back to it.",
      answers: {
        // Load-bearing: the audit keys an optional observation off it. Trimmed, not cut.
        passage: {
          text: "A man in Bristol paid it and sold the paper on before I ever saw Virginia. I have never met the one who holds it now.",
        },
        voice: {
          text: "Nobody. A servant does not vote and does not sit. The man who owns my years does both.",
        },
        owed: {
          text: "Seven years, and I am four into them. At the end there are freedom dues — corn, and a suit of clothes, and I am my own man. Here is the part nobody says out loud: the fifty acres my crossing earned were granted the week I landed. They were never mine. They went to whoever held the paper, and my seven years are what he paid for them.",
          useful: true,
        },
      },
    },
    {
      id: "angolan-laborer",
      name: "Angolan man of the settlement",
      role: "Works the north plot",
      group: "settlement",
      fallback: "He looks at you for a long moment and says nothing.",
      answers: {
        passage: {
          text: "Nobody paid for me. Taken from Ndongo, put aboard at Luanda, taken off a second ship at Point Comfort and traded here for victuals. That is not a passage. Ask the clerk what line he wrote me on.",
        },
        voice: {
          text: "No one has ever put that question to me before. I will not invent an answer for you.",
        },
        owed: {
          text: "The Englishman in the next field owes seven years and can tell you the date they end. I was traded here for provisions and set to this ground, and no one has told me a number. I am not counting down to anything that anybody has named. Write that down as it stands — do not tidy it.",
          useful: true,
        },
      },
    },
    {
      id: "settlement-goodwife",
      name: "Goodwife of the settlement",
      role: "Brews, washes, tends and buries",
      group: "settlement",
      fallback: "She wipes her hands and waits for a better question.",
      answers: {
        land: {
          text: "His, all of it — including the fifty my own crossing earned. Widows come into ground here more often than wives do.",
        },
        voice: {
          text: "Not one soul. I do not vote and I do not sit, and when this settlement decides a thing it decides it in a room I have never been in. Count who does the washing, the brewing, the tending and the burying — the muster counts me among my husband's people, not as one of my own, and the record books forget us in exactly that order. The settlement would starve inside a season without us and it would still not write us down.",
          useful: true,
        },
        owed: {
          text: "Everything a wife owes, and nothing that runs out in years. The ones counting down are in the fields.",
        },
      },
    },
    {
      id: "powhatan-man",
      name: "Powhatan man of Tsenacommacah",
      role: "Carries corn and news between the towns",
      group: "tsenacommacah",
      fallback: "He waits for you to say something worth answering.",
      answers: {
        land: {
          text: "By the same right your king holds England. This country has a name — Tsenacommacah — and some thirty towns in it under one paramount chief, with fields, weirs and paths between them that were old before your palisade. Your paper grants fifty acres of it to a man in London who has never seen this river. The paper does not mention us. That is not an oversight; a document that mentioned us would have to explain itself.",
          useful: true,
        },
        voice: {
          text: "In your settlement? No one, and I do not want one. Ask the woman by the upper fields.",
        },
        owed: {
          text: "Nothing to you. Our chief and your governor have made agreements and broken them from both sides.",
        },
      },
    },
    {
      id: "powhatan-woman",
      name: "Powhatan woman of Tsenacommacah",
      role: "Grows the corn and decides what may be spared",
      group: "tsenacommacah",
      fallback: "She goes on with her work and lets the silence stand.",
      answers: {
        passage: {
          text: "I was born up this river. It is your people the ships bring, and they arrive hungry.",
        },
        land: {
          text: "The towns and the chief are his to tell you about, not mine. He is down by the river.",
        },
        voice: {
          text: "Among us, the women who grow the corn decide what may be spared from it. That is not a small say; it is the say that matters in a hard winter. Your settlement ate through its first winters on corn out of our fields, and it was women who decided that corn could be spared. Now your paper calls the same ground empty and grants it away by the head. Both of those cannot be true, and only one of them is written down.",
          useful: true,
        },
      },
    },
  ],
  // One account from each of the eight — a single number, and one that also
  // guarantees Frethorne's audit a full evidence column however the player got
  // here (0052 §3).
  requires: { useful: 8, label: "Accounts secured" },
  lockedNote:
    "Everyone here is holding one thing worth writing down. Find the rest before you file.",
  closer: {
    prompt:
      "Your notebook is above, in two panels: the settlement's own people, and the country it stands in. The charter grants fifty acres a head. Reading what you actually collected — whose heads, and whose acres?",
    skillCategory: "Causation",
    options: [
      {
        id: "by-the-head",
        text: "The people transported were the measure of the grant, and the person who paid their passage was its recipient",
        correct: true,
        why: "Right, and the clerk showed you the mechanism in one line of his own book: the name of the arrival and the name of the payer written in the same hand at the same moment, with the fifty acres following the second one. The servant's crossing earned acres the week he landed and none of them were his. The goodwife's went into her husband's name. The burgess's seat rests on eleven crossings that are all still being worked off. A system that counts people to measure land will produce a society sorted by who did the counting.",
      },
      {
        id: "earned",
        text: "Land went to the people who cleared and worked it",
        correct: false,
        why: "Two of the men you talked to are working ground right now and hold none of it. The one man you met with eight hundred acres told you he got them out of other people's passages, and he was not embarrassed about it — it is simply how the grant is worded.",
      },
      {
        id: "empty",
        text: "The Company was granting land that no one held or used",
        correct: false,
        why: "The second panel of your own notebook is the answer to that. Thirty towns, a paramount chief, fields whose corn fed this settlement through its first winters, and a decision about what could be spared made by the women who grew it. The charter's silence about all of it is a fact about the charter.",
      },
      {
        id: "equal",
        text: "Every settler received fifty acres on arrival",
        correct: false,
        why: "Read the minister's sentence again: fifty acres to every person transported at his own charge. Almost nobody in the rows paid their own charge, which is exactly why they are in the rows.",
      },
    ],
  },
};

// ---- M2.B — "Nothing to be Gotten" (DISCREPANCY, riverbend-letter) ------------------------------
//
// Richard Frethorne's letter of March 20, 1623 is the most-anthologized document
// in Period 2 and it is almost always taught as a window onto "conditions in
// Virginia." This audit is built to complicate that in the one way the evidence
// actually supports: not by doubting him, but by establishing that he is a
// truthful witness to a position rather than to a place.
//
// So the gap kinds are deliberately not Unit 1's error/design. When what he says
// is contradicted by what the player gathered, the useful question is whether he
// was wrong, or whether he was right about his own corner of a settlement that
// was never one condition. That distinction is the historian's real move on a
// single-witness source, and it is the reason to run a second DISCREPANCY at
// all rather than repeating the Columbus audit with new nouns.
//
// The verdicts are not all "contradicted": two claims are straightforwardly
// supported and one cannot be settled either way, because an audit that finds
// everything false teaches a student to distrust documents rather than read
// them.
//
// Eight observations key off the eight useful answers the interview *requires*,
// so an audit reached by the normal route is always workable. Three more key off
// flat answers nobody has to ask for, which is what keeps the engine's cause and
// effect real: a thorough player audits this letter holding three things a
// hurried one does not.
const NOTHING_TO_BE_GOTTEN = {
  kind: "discrepancy",
  id: "case-004-discrepancy-nothing-to-be-gotten",
  title: "Nothing to be Gotten",
  variant: "One Account Against What You Gathered",
  missionQuestion:
    "Richard Frethorne is telling the truth as he can see it. What can his letter actually establish, and where does his position stop his sight?",
  thinkingMove:
    "Qualification. Deciding what a truthful account is truthful about, instead of grading it true or false.",
  debrief: {
    speaker: "indentured-servant",
    line: "Half the settlement would tell you he lays it on thick. You read it against what you were told out here, and you came back with something better than whether he was right.",
    established:
      "Frethorne is an excellent witness to his own condition and a poor one to the settlement's causes. The hunger, the sickness and the fear are exactly as he reports them. What he cannot see from where he stands is that the country is not what is killing him — people have fed themselves well on this river for generations — and that the arrangement doing it is the one he is standing inside.",
    remains:
      "The numbers. He writes thirty-two against three thousand and was in no position to have counted either; neither were you. What the line establishes is a settlement's state of mind ten weeks after the attack, which is worth having, and it is not arithmetic.",
  },
  openQuestions: [
    "Whether Frethorne survived. The letter is his last known trace, and the Virginia Company records that preserve it do not follow him.",
  ],
  historicalRecord: {
    documented: [
      "Richard Frethorne's letter to his parents, March 20, 1623, preserved because the Virginia Company kept it and reprinted in Kingsbury's Records of the Virginia Company.",
      "Martin's Hundred, a settlement on the James below Jamestown, and the coordinated Powhatan attack of March 1622 that killed roughly a third of the colony's English population.",
      "The diet, disease and mortality of early Chesapeake servants, including brackish water at the wrong end of the tide.",
      "The labor regime that put available hands into tobacco rather than food.",
      "Powhatan agriculture on the James, and the corn from those fields that sustained the English through early winters.",
    ],
    reconstructed: [
      "The Riverbend settlement you walked, and the people who told you what to check the letter against.",
      "Frethorne himself is documented; the surroundings you audit him from are composite.",
    ],
    fiction: ["Chronotravel, and a Chronicler holding the letter within weeks of its writing."],
    debated: [
      "How representative Frethorne's experience was. His letter is the most anthologized servant account of the period, and historians disagree about how far one desperate voice should stand for a labor system.",
    ],
  },
  intro:
    "Frethorne is not lying to you. He is nineteen, he is sick, he is frightened, and he is writing to the two people in the world who might be able to get him out. Every one of those facts is a reason to read him closely rather than a reason to doubt him.",
  howItWorks: {
    steps: [
      "Read the letter first. All of it — the lines below are lifted straight out of it.",
      "For each line, say what your evidence does to it: supports it, complicates it, contradicts it, or is not enough to settle it. He is not wrong about everything: two your evidence backs, and one you have no way to judge.",
      "Land on contradicted and a second question opens: why does it differ? He can be mistaken, and he can be exactly right about his own corner of a settlement that is not one condition.",
    ],
    note: "The right-hand column holds only what you added to your Field Notebook. Where it says you did not gather something, that is a line of this letter you have no way to check.",
  },
  briefing: {
    speaker: "indentured-servant",
    line: "There is a letter going home from a lad at Martin's Hundred, and half the settlement would tell you he lays it on thick. I would not. Read it against what you have been told out here and see who is right.",
  },
  terms: [
    {
      term: "loblollie",
      definition:
        "Water gruel — boiled meal, thin. Frethorne names it because it is nearly the whole of what he has eaten since he came off the ship.",
    },
    {
      term: "to redeem",
      definition:
        "To buy out the remainder of someone's indenture. It is what Frethorne is asking his parents to do, and it is the purpose the whole letter is bent toward.",
    },
    {
      term: "headright",
      definition:
        "Fifty acres granted for every person transported — to whoever paid the passage. Frethorne's crossing earned somebody fifty acres. It was not Frethorne.",
    },
    {
      term: "Complicated by the evidence",
      definition:
        "The line is not wrong, and it is not the whole of it. What you gathered adds something the line leaves out.",
    },
    {
      term: "Not enough evidence",
      definition:
        "Nothing you gathered settles it either way. This is a finding, not a failure — say so rather than guessing.",
    },
  ],
  record: {
    label: "Letter to His Parents from Martin's Hundred",
    attribution: "Richard Frethorne to his father and mother, March 20, 1623",
    context:
      "Frethorne is an indentured servant at Martin's Hundred, a settlement on the James a few miles below Jamestown, and he has been in Virginia about three months. Ten weeks before he landed, a coordinated Powhatan attack killed roughly a third of the colony's English population, Martin's Hundred among the hardest hit. He is writing to his father and mother in England — the only people who could buy out the rest of his term — and he says plainly what he wants: that they redeem him, or failing that send provisions. The letter survives because the Virginia Company kept it. Everything in it is aimed at two readers who love him and might be able to act.",
    text: [
      "“Loving and kind father and mother, my most humble duty remembered to you… This is to let you understand that I your child am in a most heavy case by reason of the nature of the country, is such that it causeth much sickness, as the scurvy and the bloody flux and diverse other diseases, which maketh the body very poor and weak.",
      "And when we are sick there is nothing to comfort us; for since I came out of the ship I never ate anything but peas, and loblollie (that is water gruel). As for deer or venison I never saw any since I came into this land. There is indeed some fowl, but we are not allowed to go and get it, but must work hard both early and late for a mess of water gruel and a mouthful of bread and beef.",
      "A mouthful of bread for a penny loaf must serve for four men which is most pitiful… people cry out day and night — Oh that they were in England without their limbs — and would not care to lose any limb to be in England again, yea, though they beg from door to door.",
      "We are but 32 to fight against 3000 if they should come… there is nothing to be gotten here but sickness and death, except that one had money to lay out in some things for profit. But I have nothing at all — no, not a shirt to my back but two rags, nor clothes but one poor suit… if you love me you will redeem me suddenly, for which I do entreat and beg.”",
    ],
  },
  verdictPrompt:
    "For each line, decide what the evidence you gathered at Riverbend actually does to it.",
  verdicts: [
    { id: "supported", label: "Supported by the evidence" },
    { id: "complicated", label: "Complicated by the evidence" },
    { id: "contradicted", label: "Contradicted by the evidence" },
    { id: "cannot-tell", label: "Not enough evidence" },
  ],
  gapRequiredFor: "contradicted",
  // Same five reasons as Case 1.01's audit, so a student who learned them at the chart table is
  // not relearning a vocabulary at the wharf. The two Riverbend already used keep their ids —
  // "He was wrong" was Mistake all along, and "True where he stands" was Different perspective.
  gapKinds: [
    { id: "he-was-wrong", label: "Mistake" },
    { id: "not-one-place", label: "Different perspective" },
    { id: "design", label: "Deliberate framing" },
    { id: "incomplete", label: "Incomplete information" },
    { id: "undetermined", label: "Not enough evidence to determine why" },
  ],
  gapPrompt: "Why does the letter differ from what you gathered?",
  lockedNote: "Settle every line of the letter before you file.",
  claims: [
    {
      id: "sickness-country",
      text: "I am in a most heavy case by reason of the nature of the country, is such that it causeth much sickness.",
      verdict: "contradicted",
      gap: "he-was-wrong",
      why: "The sickness is real and his account of it is exact. The cause is not the country. People have fed themselves well on this river for generations — you were told about thirty towns, their fields and their weirs, and about the corn out of those fields that carried this settlement through its first winters. What kills the English here is brackish water at the wrong end of the tide, a diet of gruel, and a labor regime that puts every hand into tobacco instead of food. He blames the place because he can see the place. He cannot see the arrangement he is standing inside.",
    },
    {
      id: "nothing-gotten",
      text: "There is nothing to be gotten here but sickness and death, except that one had money to lay out in some things for profit.",
      verdict: "contradicted",
      gap: "not-one-place",
      why: "He names his own exception in the same breath — except that one had money — and that clause is the whole settlement. A great deal is being gotten at Riverbend. The clerk enters casks that pay. A burgess up the creek holds eight hundred acres he got out of eleven other men's crossings. Frethorne is telling the exact truth about a servant with no capital, and it is not the truth about the colony. This is the difference between a false statement and a true statement about one position.",
    },
    {
      id: "gruel",
      text: "Since I came out of the ship I never ate anything but peas, and loblollie… we must work hard both early and late for a mess of water gruel and a mouthful of bread and beef.",
      verdict: "supported",
      gap: null,
      why: "Everything you gathered points the same way. Tobacco takes the good ground and the good hands because tobacco is what pays; the food comes out of a kitchen garden worked by whoever is left over, and out of the women's brewing and tending that the muster does not count as work at all. His plate is what that priority looks like from underneath.",
    },
    {
      id: "limbs",
      text: "People cry out day and night — Oh that they were in England without their limbs — and would not care to lose any limb to be in England again.",
      verdict: "supported",
      gap: null,
      why: "Extravagant as it sounds, your own evidence carries it. A man four years into seven can tell you the date his term ends and what he will be owed at the end of it, and still be counting. Another, traded off a ship at Point Comfort for provisions, has never been given a date at all. Frethorne is describing what it feels like to be inside that, and nothing you collected suggests he is overstating it.",
    },
    {
      id: "thirty-two",
      text: "We are but 32 to fight against 3000 if they should come.",
      verdict: "cannot-tell",
      gap: null,
      why: "He is reporting a fear, and a pair of numbers he was in no position to have counted. Neither are you: nothing you gathered establishes the strength of Tsenacommacah, and the two people from it you spoke to were not asked and would not have been counting for you. What the letter does establish is that ten weeks after the attack an English servant on the James believed he was thirty-two men against three thousand — which is a fact about the settlement's state of mind, and evidence of that rather than of the arithmetic.",
    },
  ],
  observed: [
    {
      id: "river",
      text: "Everything at Riverbend moves by water — the hogsheads out, the ships in, and the food when the ships are late.",
      requires: null,
    },
    {
      id: "headright",
      text: "Fifty acres to every person transported at his own charge, and fifty more for every servant he brings. The grant follows the payer, not the passenger.",
      from: "Settlement minister",
      requires: "asked:settlement-minister:land",
    },
    {
      id: "seat",
      text: "A burgess holds some eight hundred acres and sits in the Assembly because of it. He got them by paying eleven people's passages, and all eleven are still working.",
      from: "Elected burgess",
      requires: "asked:settlement-burgess:voice",
    },
    {
      id: "entry",
      text: "Every arrival is entered with the name of whoever paid the freight, in the same hand and the same moment, and the fifty acres follow that name.",
      from: "Wharf clerk",
      requires: "asked:wharf-clerk:passage",
    },
    {
      id: "seven-years",
      text: "Four years into seven, with freedom dues at the end. The fifty acres his own crossing earned were granted the week he landed, to the man who held the paper.",
      from: "Indentured field servant",
      requires: "asked:indentured-servant:owed",
    },
    {
      id: "no-term",
      text: "Taken from Ndongo, put aboard at Luanda, traded off a second ship at Point Comfort for victuals. The Englishman in the next field can name the date his term ends. Nobody has given this man a number at all.",
      from: "Angolan man of the settlement",
      requires: "asked:angolan-laborer:owed",
    },
    {
      id: "goodwife",
      text: "The acres earned by her own crossing sit in her husband's name at the top of the patent. She does not vote and does not sit, and the muster counts her among his people. The settlement would starve inside a season without the work she does.",
      from: "Goodwife of the settlement",
      requires: "asked:settlement-goodwife:voice",
    },
    {
      id: "tsenacommacah",
      text: "Some thirty towns under one paramount chief, with fields, weirs and paths between them older than the palisade. The Company's paper does not mention any of it.",
      from: "Powhatan man of Tsenacommacah",
      requires: "asked:powhatan-man:land",
    },
    {
      id: "corn",
      text: "The corn this settlement ate through its first winters grew in Powhatan fields, and the women who grew it decided it could be spared.",
      from: "Powhatan woman of Tsenacommacah",
      requires: "asked:powhatan-woman:voice",
    },
    // The three below key off flat answers nobody is required to ask for. A
    // thorough player carries them into the audit; a hurried one does not, and
    // the column says so.
    {
      id: "sold-on",
      text: "“A man in Bristol paid it and sold the paper on before I ever saw Virginia. I have never met the one who holds it now.”",
      from: "Indentured field servant",
      requires: "asked:indentured-servant:passage",
    },
    {
      id: "no-stool",
      text: "The clerk who writes down everyone's acres holds none himself, and mostly never sees the men whose names he is entering — only their servants.",
      from: "Wharf clerk",
      requires: "asked:wharf-clerk:land",
    },
    {
      id: "quitrent",
      text: "What a landholder owes is a quitrent the Assembly petitions about every session. It is not a debt that takes years off a man's life.",
      from: "Elected burgess",
      requires: "asked:settlement-burgess:owed",
    },
  ],
  closer: {
    prompt: "Your reading goes into the record. What should it say this letter is evidence of?",
    skillCategory: "Sourcing",
    options: [
      {
        id: "position",
        text: "What one position inside the settlement cost the person occupying it",
        correct: true,
        why: "Right, and it is a stronger claim than the one this letter usually gets made to carry. Two of his lines your evidence backed outright; one you could not settle; and where you contradicted him, you had to decide each time whether he was mistaken or simply standing somewhere the rest of the settlement was not. A truthful witness to a position is exactly what a historian wants, provided the position is named.",
      },
      {
        id: "conditions",
        text: "Conditions in Virginia in 1623",
        correct: false,
        why: "That is the reading this letter usually gets, and your own evidence complicates it. He wrote the exception into his own sentence — except that one had money — and you found the people it describes: a burgess with eight hundred acres, a clerk entering casks that pay. Virginia in 1623 was several conditions at once, and he was in one of them.",
      },
      {
        id: "exaggeration",
        text: "That Frethorne overstated his suffering to get his parents to act",
        correct: false,
        why: "You marked two of his lines supported by your own independent evidence, and you had no grounds to doubt a third. Having a purpose is not the same as inflating, and collapsing the two throws away the distinction the gap question was for. The letter's purpose shapes what he chooses to describe — not, on this evidence, whether it was true.",
      },
      {
        id: "unusable",
        text: "Nothing — a letter home is too personal to be evidence",
        correct: false,
        why: "It is the best evidence in this unit for what an indenture actually cost the person serving it, and no official record would ever have preserved that. A private letter is not a weaker source than a ledger; it is a source about different things.",
      },
    ],
  },
};

// ---- M2.C — "One Hogshead" (TRACE, riverbend-ledger) --------------------------------------------
//
// The first content ever authored against the TRACE engine. The chain is one
// cask of tobacco from the rows to London and back again as trade goods, which
// is Unit 2's central question — geography, labor and the transatlantic economy
// — reduced to a thing a player can follow with their finger.
//
// The mission turns on its first leg, and on one permanent distractor.
//
// Leg 1 keys to `not-established`. A wharf account opens at the landing with
// fourteen hogsheads already casked; it does not record whose hands cured and
// pressed the leaf. The player *knows* whose hands, because they interviewed
// them two records ago — and knowing it from the field is not the same as
// establishing it from this page. `labor-cost` sits in the palette on every
// single leg and is never once the answer, which makes it the sharpest
// distractor in the game: true history, false sourcing. It only lands because
// the player has already met the people it is true about.
//
// That is MISSION-ACTIVITY-CATALOG §2 as a mechanic rather than as a rule in a
// document. A Chronicler changes the record, never the event — and the first
// thing that discipline demands is knowing which of the two you are holding.
const ONE_HOGSHEAD = {
  kind: "trace",
  id: "case-004-trace-one-hogshead",
  title: "One Hogshead",
  variant: "Commodity Chain",
  missionQuestion:
    "Follow one cask from the field to London and back. What does this account establish about who profited — and where does it stop being able to tell you?",
  thinkingMove:
    "Telling what you know from what your source shows. Being right about the world is not the same as being right about the evidence.",
  debrief: {
    speaker: "wharf-clerk",
    line: "Two entries, and only one of them is mine to vouch for. You worked out which. Most people who read my book read it for the part it does not say.",
    established:
      "The account is good evidence of a system and poor evidence of the people in it. It establishes duty taken before the planter sees anything, proceeds returned as credit rather than coin, and a return cargo chosen in London a season ahead — a one-crop economy at the far end of a long credit line, legible in a single entry. That is how Chesapeake planters became chronically indebted to English merchants without anything illegal happening.",
    remains:
      "Who made the cask. You know, because you stood in the fields and asked them. The page does not: it opens at the landing with fourteen hogsheads already casked and weighed, and a record that begins where the labor ends cannot establish who did it.",
  },
  openQuestions: [
    "What this particular cask sold for. The account records the consignment, not the London price, and the planter would not learn it for months either.",
  ],
  historicalRecord: {
    documented: [
      "The consignment system: Chesapeake tobacco shipped to a London merchant to be sold on the planter's behalf, paid out months later minus charges, with the planter carrying the risk.",
      "English tobacco duties, which grew into one of the Crown's most dependable revenues across the seventeenth century.",
      "The chronic indebtedness of Chesapeake planters to English merchant houses that this arrangement produced.",
      "The hogshead itself — cured, stemmed, pressed leaf, marked with the planter's mark before it left the landing.",
    ],
    reconstructed: [
      "The wharf account you are reading. It is a composite entry modeled on the invoice and cargo-account pattern documented throughout the period's records, not a transcription of any single surviving page — its own citation says so.",
      "The Speedwell's voyage, and the specific quantities of cloth, hoes and knives returned.",
    ],
    fiction: ["Chronotravel, and a Chronicler auditing a wharf book in 1630."],
    debated: [
      "How much of a planter's debt was structural and how much was consumption. Historians read the same merchant accounts and weigh the two differently.",
    ],
  },
  intro:
    "Fourteen casks of tobacco left this landing and three pieces of Kentish cloth, two dozen iron hoes and six dozen knives came back. Follow one cask the whole way and enter what the account actually supports at each step — and what it does not.",
  howItWorks: {
    steps: [
      "The cask moves in four legs, in order. Each says what changes and whose hands it passes through.",
      "For every leg, choose the one entry this wharf account supports. A leg stays open until you have it right.",
      "One choice means the account does not show this. It is a real answer and it is correct at least once.",
    ],
    note: "Something you know from walking this settlement is not the same as something this page supports. Enter what the page supports, then file.",
  },
  briefing: {
    speaker: "wharf-clerk",
    line: "Every cask is entered twice — once for the company, once for the customs man. Follow one out and back and tell me which of the two entries my book is actually good for.",
  },
  terms: [
    {
      term: "hogshead",
      definition:
        "A large cask. A Chesapeake tobacco hogshead of this period held several hundredweight of cured, stemmed and pressed leaf, marked with the planter's own mark before it left the landing.",
    },
    {
      term: "factor",
      definition:
        "An agent who handles a merchant's business at the far end of a trade — here, the man at the Virginia landing who receives casks on a London merchant's account.",
    },
    {
      term: "consignment",
      definition:
        "Shipping goods to a merchant to be sold on the owner's behalf, rather than selling them outright at home. The owner is paid whatever the merchant gets, months later, minus charges — and carries the risk the whole way.",
    },
    {
      term: "duty",
      definition:
        "A tax collected on goods entering England. Tobacco duties grew into one of the Crown's most dependable revenues, which is why a colonial cask is weighed and entered so carefully before it sails.",
    },
  ],
  subject: {
    label: "One hogshead of Riverbend tobacco, 1630",
    note: "Entry in the wharf account: received of the ship Speedwell, fourteen hogsheads of tobacco, casked and weighed as within noted.",
  },
  nodes: [
    { id: "rows", label: "The tobacco rows" },
    { id: "landing", label: "The Riverbend landing" },
    { id: "speedwell", label: "Aboard the Speedwell" },
    { id: "london", label: "London: customs house and warehouse" },
    { id: "return", label: "Back at the landing, next season" },
  ],
  effects: [
    {
      id: "not-established",
      label: "Not shown by this account",
      note: "The record does not reach this far.",
    },
    { id: "crown-revenue", label: "The Crown takes its share in duty" },
    { id: "planter-credit", label: "Value comes back as credit, not coin" },
    { id: "merchant-control", label: "London chooses what comes back" },
    { id: "labor-cost", label: "The cost of it falls on bound labor" },
  ],
  legs: [
    {
      id: "curing",
      from: "rows",
      to: "landing",
      label: "Cut leaf becomes a marked cask",
      transforms:
        "Leaf is cut, hung and cured through the autumn, stemmed, pressed into a cask and marked with the planter's mark.",
      actor: "The hands that worked the rows — whoever they were.",
      effect: "not-established",
      why: "You know whose hands these were, because you stood in the fields and asked them: a servant four years into seven, a man from Ndongo who has never been given a number, a woman working the kitchen garden the settlement eats from when the ships are late. The account does not say so. It opens at the landing with fourteen hogsheads already casked and weighed, and a record that begins where the labor ends cannot be used to establish who did it. You can prove this from the settlement. You cannot prove it from this page — and knowing which of the two you are holding is the whole of the job.",
    },
    {
      id: "entering",
      from: "landing",
      to: "speedwell",
      label: "The cask is weighed and entered twice",
      transforms:
        "The hogshead is weighed, its mark and weight noted, and entered twice — once to the planter's account, once against the customs the cargo will owe on landing in England.",
      actor: "The wharf clerk and the ship's factor.",
      effect: "crown-revenue",
      why: "The clerk told you what the doubled entry is for: once for the company, once for the customs man. Tobacco paid duty on entering England, and across the seventeenth century those duties became one of the Crown's most dependable revenues — which is precisely why a cask on a Virginia riverbank is weighed this carefully before it sails. The format of a record is evidence of what the record was for.",
    },
    {
      id: "crossing",
      from: "speedwell",
      to: "london",
      label: "The cask becomes a consignment",
      transforms:
        "Duty is paid on landing, the merchant sells at whatever the London market gives that season, and the planter is credited on the merchant's books for the proceeds less freight, duty and commission.",
      actor: "The ship's master, the customs officer, and the London merchant.",
      effect: "planter-credit",
      why: "The planter never touches coin. He is credited — and the figure he is credited at was set in London, months after the leaf left his hands, in a market he cannot see and did not sell into. That is the consignment system, and it is the mechanism behind one of the most durable facts of the colonial Chesapeake: planters ran chronically in debt to English merchants, in good years as well as bad.",
    },
    {
      id: "returning",
      from: "london",
      to: "return",
      label: "The credit comes back as cargo",
      transforms:
        "The credit is spent on English wares — three pieces of Kentish cloth, two dozen iron hoes, six dozen knives — and shipped back to the landing as goods the planter ordered sight unseen and a season in advance.",
      actor: "The London merchant, buying on the planter's behalf.",
      effect: "merchant-control",
      why: "Look at what actually came back. Cloth, hoes, knives — the tools and textiles a settlement that puts every hand into one crop cannot make for itself. The blacksmith will tell you the Company sent gold-refiners the first year and the settlement had no second hoe. A colony that exports one staple and imports its tools does not choose what arrives; the man holding the credit at the other end chooses, and he is choosing a year ahead.",
    },
  ],
  closer: {
    prompt:
      "Four legs entered. Your reading goes into the record — what is a wharf account like this one evidence of?",
    skillCategory: "Economic Systems",
    options: [
      {
        id: "dependence",
        text: "A settlement exporting one staple and receiving, in return, goods chosen for it on credit it could not spend anywhere else",
        correct: true,
        why: "Right, and every leg you logged points to it. Duty is taken before the planter sees anything; the proceeds arrive as a figure on someone else's books; and what comes back was chosen in London a season ahead. Nothing here is theft and nothing here is illegal — it is simply what a one-crop economy at the far end of a long credit line looks like from the wharf where it is written down.",
      },
      {
        id: "labor",
        text: "That the settlement's wealth was produced by bound labor",
        correct: false,
        why: "It was. You met them. But you entered the first leg as not shown by this account for exactly this reason: it opens at the landing with the casks already made, and it never names a single pair of hands. Reading a true fact out of a record that does not contain it is the most comfortable mistake in this discipline, because you are right about the world and wrong about the evidence — and a Chronicler is answerable for the record.",
      },
      {
        id: "prosperity",
        text: "That tobacco was making Riverbend prosperous",
        correct: false,
        why: "Fourteen casks out and cloth, hoes and knives back is activity, not profit. You logged what the planter actually received: credit, set months later, at a price he had no part in. The Chesapeake's chronic indebtedness to English merchants was produced by exactly this arrangement, and it is legible in this one entry.",
      },
      {
        id: "crown",
        text: "That the Crown controlled the Atlantic trade",
        correct: false,
        why: "The Crown takes duty — that is one leg of four, and you logged it. The decisions that actually shaped what came back to this landing were a merchant's, made on his own books for his own account. Revenue and control are not the same lever.",
      },
    ],
  },
};

export const UNIT_02_ACTIVITIES = {
  "riverbend-charter": BY_WHOSE_HEAD,
  "riverbend-letter": NOTHING_TO_BE_GOTTEN,
  "riverbend-ledger": ONE_HOGSHEAD,
};
