// Case 3.01's three activities, keyed by the source id each one opens from.
//
// Philadelphia's slate is C — INTERVIEW, ASSEMBLY, TRACE — fixed for all nine units in
// docs/design/THE-MAP-PROGRAM.md §2. Two of those three are also on Unit 4's slate, which is legal
// and is not the interesting half: what rule 2 actually binds is the *question*, and the right-hand
// column of that table is the binding one. This map's interview asks what a public position is made
// of; Riverbend's asked how one arrangement looks from eight positions inside it, and Richmond's
// will ask what testimony costs when the regime is writing it down. Three interviews, three
// different questions.
//
// Nothing here is gated. Unit 2 gates its audit on its interview (`requiresSourceId` on
// riverbend-letter), so its last mission is always the letter or the ledger and never the charter;
// Philadelphia gates nothing, so **any** of these three can be the one a player finishes on. That is
// why `arcClose` is authored on all three and why the claim itself is a shared const — the arc has
// to mean the same thing whichever door the player leaves by, and the only way to guarantee that is
// to stop writing it three times. Each mission keeps its own `line`, in the voice of whoever is
// standing there. Pinned by tests/unit/activity-content.test.js.
//
// Token format for `requires` is `asked:<npc id>:<question id>`, built by main.js's
// interviewTokens() from an interview's *logged* answers — there is no discrepancy on this map, so
// nothing consumes them here. Every speaker id below is a real NPC id in UNIT3_FIELD_NPCS, which
// tests/unit/field-map-coordinates.test.js and tests/unit/activity-content.test.js both assert.
//
// A note on the cast this content is written into. Philadelphia's six period characters are frozen
// on `legacy-*` placeholder art (see the roster comment in main.js): no Revolutionary-era sheets
// exist, and dressing John Dickinson in Christopher Columbus's 1492 doublet is worse than a
// placeholder. That is an art commission, ranked first in THE-MAP-PROGRAM §6, and it does not block
// any word of this file — the writing is what these people say, not what they are wearing.

// What Philadelphia's three records turn out to be about, said once. See the header.
const COMMON_CAUSE_ARC =
  "Philadelphia's three records are one question asked in three registers: who is permitted to state a position, and what it costs the people who are not. A newspaper essay works by choosing a mask that will be listened to. A speech becomes national by being written down forty years later, by a man who needed it to sound a certain way. And a proclamation raises soldiers out of people whose own claim to liberty nobody in this square has printed a word about. The Revolution's language was public property from the beginning. Access to the press that carried it was not.";

// ---- M3.A — "A Public Position" (INTERVIEW, commoncause-dickinson-letter) ------------------------
//
// Dickinson's Letter II is the record, and the mission is one consequence of how he chose to publish
// it. He was a wealthy Philadelphia lawyer with a Delaware estate, and he signed himself "A Farmer"
// — not to deceive anyone in particular, but because in 1767 a farmer's opinion travelled where a
// lawyer's was argued with. That is a real fact about how colonial argument worked, and it is the
// question this interview puts to five other people: what does it take to have a position that
// anybody hears?
//
// Six speakers, four questions, exactly six useful answers — one per person, which is also the
// completion bar (0052 §3: one number, not two). The grid is sparse on purpose: three answers per
// speaker out of four questions, so every one of them has a question that fires their `fallback`.
// That is the rule Phase 71 established after both shipped interviews had full grids, which made
// asking everyone everything strictly dominant and left all fifteen fallback lines unreachable.
//
// The two panels are the argument. Four people's positions are a matter of public record — printed,
// cried aloud, mustered, or entered in a ledger. Two are not, and the split is not that they have
// nothing to say. The free tradesman pays the same duty on the same paper and glass as any subscriber
// to the non-importation agreement. The farmwife performs the boycott: homespun is a political act
// carried out almost entirely by women, resolved on by men who did not spin. Neither is asked.
const A_PUBLIC_POSITION = {
  kind: "interview",
  id: "case-007-interview-a-public-position",
  title: "A Public Position",
  variant: "Whose Account Do You File?",
  missionQuestion:
    "Six people in one square, and only some of them have a position anybody wrote down. What is a public position actually made of here — and what does it cost to be without one?",
  thinkingMove:
    "Separating what a person argues from what they are permitted to argue. A position stated in public is evidence of two things at once, and only one of them is the argument.",
  briefing: {
    speaker: "john-dickinson",
    line: "You have the second Letter there. Before you read it as an argument, read it as a choice: I am a lawyer with an estate, and I signed it Farmer. Walk this square and ask who else here has a position that has ever been printed, cried, or entered anywhere. Then come back and tell me what you think the signature is doing.",
  },
  debrief: {
    speaker: "free-tradesman",
    line: "You came back to me last, which I notice. Most people who come through this square with questions do not come to this end of it at all.",
    established:
      "A public position in Philadelphia is a position plus a way of being heard, and the two are not distributed together. Dickinson had to choose a mask that would travel. The merchant's interest is entered in a ledger and shouted down in the coffee house. The crier has never once been paid to read out a grievance from below. And the two people you found with the clearest stake in the outcome — a freeman who pays the same duties as every subscriber, and a household performing the boycott that the resolves only signed — are not in anybody's record of what this town thinks.",
    remains:
      "What either of them would have said in public, because neither was ever asked in public and no document records it. You have their account because a Chronicler stood in front of them. The archive does not.",
  },
  openQuestions: [
    "How far Dickinson's persona actually worked. The Letters were reprinted in nearly every colonial newspaper, which shows reach; whether a reader in 1768 believed the author was a farmer, or understood the signature as a convention, is not something the reprints record.",
    "Whether the free Black artisans of Philadelphia organised around the non-importation agreements. Philadelphia had a substantial free Black population by the 1760s and the committees' surviving subscription lists are not a record of who supported the boycott — only of who was asked to sign.",
  ],
  arcClose: {
    speaker: "free-tradesman",
    line: "A letter, a speech and a proclamation, and every one of them had to get past somebody before it reached you.",
    established: COMMON_CAUSE_ARC,
  },
  codexFiling: {
    summary:
      "A public position is an argument plus a way of being heard, and the two are not handed out together. A lawyer signs himself Farmer to travel; a freeman who pays the same duties is on nobody's subscription list.",
    tags: ["Whose account is this", "Who is permitted to speak", "Written to persuade"],
    // Backwards, to Riverbend: that interview established who the record counts. This one establishes
    // who the record lets speak. Same mechanism, one generation and one colony apart.
    seeAlso: ["case-004-interview-by-whose-head"],
  },
  historicalRecord: {
    documented: [
      "John Dickinson's Letters from a Farmer in Pennsylvania, twelve essays published serially from December 1767, opposing the Townshend duties while conceding Parliament's authority to regulate colonial trade.",
      "Dickinson's actual position: a Philadelphia lawyer of substantial means with an estate in Delaware, writing under an assumed rural persona.",
      "The reprinting of the Letters in nearly every colonial newspaper, which made them the most widely circulated statement of the colonial case before Common Sense.",
      "The non-importation agreements and the domestic manufacture — spinning, weaving, dyeing — that made them possible, work performed overwhelmingly by women and organised in some towns as public spinning meetings.",
      "The Townshend Revenue Act of 1767 and its duties on imported paper, glass, lead, painters' colours and tea.",
      "Philadelphia's free Black community, established and growing through the 1760s, and the artisan trades open to it.",
    ],
    reconstructed: [
      "Five of the six people you spoke to. Dickinson is documented and stood in this city; the crier, the recruiter, the merchant, the tradesman and the farmwife are composites drawn from what the records establish about Philadelphia in these years, not individuals anyone named.",
      "The square itself, as a single walkable place. Philadelphia's statehouse, wharves, print shops and market did not sit inside one block.",
    ],
    fiction: ["Chronotravel, the Chronicle Institute, and a record secured in the field."],
    debated: [
      "How much of the colonial resistance was principle and how much was interest. Historians have argued this since the 1910s and the same documents support both readings, which is why the closer refuses to make you pick one.",
    ],
  },
  intro:
    "Dickinson wrote twelve letters, signed them Farmer, and became the most-read voice in the colonies. He was neither a farmer nor unknown. Put four questions to this square and find out what it takes to be heard in it.",
  howItWorks: {
    steps: [
      "You may ask any question to any person. Consider their position — and whether anyone has ever recorded it.",
      "Most people will send you elsewhere. When someone gives you something worth keeping, press Add to Field Notebook.",
      "Six people, six accounts — one from each. That is the whole mission.",
    ],
    note: "Two of these six have no public position at all. That is not them having nothing to say, and finding out the difference is the point of asking them.",
  },
  terms: [
    {
      term: "the Townshend duties",
      definition:
        "Taxes laid by Parliament in 1767 on paper, glass, lead, painters' colours and tea imported into the colonies, intended to raise revenue for colonial governors' and judges' salaries — which is precisely the part Dickinson objects to.",
    },
    {
      term: "non-importation",
      definition:
        "A signed agreement among merchants and townspeople to buy nothing imported from Britain until a duty is repealed. It works only if the household can make at home what it stops buying.",
    },
    {
      term: "homespun",
      definition:
        "Cloth spun and woven at home rather than imported. Wearing it was a public political statement; making it was months of labour, performed almost entirely by women.",
    },
    {
      term: "persona",
      definition:
        "The character an author writes as, distinct from who they are. Not a lie in eighteenth-century print culture but a convention — and a choice about which readers will listen.",
    },
  ],
  questions: [
    { id: "stand", label: "What is your position on the duties, and where have you stated it?" },
    { id: "cost", label: "What does this dispute actually cost you?" },
    { id: "heard", label: "Whose voice carries in this square, and whose does not?" },
    { id: "next", label: "What should happen next, and who should do it?" },
  ],
  groups: [
    {
      id: "stated",
      label: "Positions that are a matter of record",
      note: "Printed, cried aloud, mustered, or entered in a ledger. Somebody kept these.",
    },
    {
      id: "unasked",
      label: "Positions nobody wrote down",
      note: "Not people with nothing to say. People no committee has put a question to.",
    },
  ],
  speakers: [
    {
      id: "john-dickinson",
      name: "John Dickinson",
      role: "Writes as 'A Farmer' and publishes in this city's newspapers",
      group: "stated",
      fallback: "He turns back to the proof sheet on the case and lets the question go by.",
      answers: {
        stand: {
          text: "In print, twelve times over, and you will find the whole of it in the Chronicle and reprinted from Boston to Charleston. Here is the distinction and I want it read exactly: Parliament unquestionably may regulate the trade of the whole empire, and I say so in the same paragraph. What it may not do is lay a duty on us for the raising of revenue, without our consent. Now — I am a lawyer with an estate, and I signed it Farmer. A farmer may be listened to where a lawyer is only argued with. Judge the argument on its merits and judge the signature separately, because they are two different pieces of evidence.",
          useful: true,
          lead: "He publishes in this square, and so does everybody else. Find out who else has ever been printed, cried or entered.",
        },
        cost: {
          text: "Less than it costs most people here, which is a thing I am aware of. Ask the man on the quay with a warehouse full of goods.",
        },
        heard: {
          text: "The press carries whoever can pay the printer or interest him. That is a shorter list than this square supposes. Ask the crier — he keeps it.",
        },
      },
    },
    {
      id: "town-crier",
      name: "Town crier",
      role: "Reads the notices aloud in this square",
      group: "stated",
      fallback: "He shifts his bell to the other hand and waits for the hour.",
      answers: {
        stand: {
          text: "I have none, and a man who cries the news had better not. I read what is handed me. What I think of it is my own affair and worth nothing.",
        },
        heard: {
          text: "I keep the list, so I will tell you what is on it. The committee's resolves, the Assembly's proclamations, a merchant's advertisement, a sale, a runaway. Every one of those is either an authority or a man with a shilling. In eleven years nobody has ever handed me a grievance from below and asked me to cry it — not a servant's, not a labourer's, not a woman's. It is not forbidden. It is simply that the paper never comes, because the people it would come from have never been given to understand that they might write one.",
          useful: true,
        },
        next: {
          text: "Whatever the committee resolves, I expect, and I shall read it out on the hour. Ask the man on the green what he thinks should happen.",
        },
      },
    },
    {
      id: "militia-recruiter",
      name: "Militia recruiter",
      role: "Musters the county company on the green",
      group: "stated",
      fallback: "He looks past you at the green and counts something under his breath.",
      answers: {
        stand: {
          text: "Mine is on the muster roll, which is a plainer statement than anything in a newspaper. Read the names on it and you have the town's mind.",
        },
        heard: {
          text: "A man who drills is heard. That is most of why they come. Ask the Farmer why he thought a plough would be listened to.",
        },
        next: {
          text: "Arm, and be seen to arm, and here is the part the essayists have not reckoned with. So long as this is an argument about what Parliament may lawfully do, we are asking a question and somebody in London is answering it. The day a colony votes to put its counties in a posture of defence, the question stops being what may lawfully be done and becomes who will be obeyed — and that is not a question a pamphlet settles. Virginia is nearly there. We will not be far behind, and after that nobody unmakes it by repealing a duty on glass.",
          useful: true,
        },
      },
    },
    {
      id: "loyalist-merchant",
      name: "Loyalist merchant",
      role: "Keeps a warehouse on the quay",
      group: "stated",
      fallback: "He folds the paper he is holding and does not open it again.",
      answers: {
        stand: {
          text: "That the Crown's ships call at this port and I should like them to go on calling. I am told daily that this is not a position. It is written in my ledger twice a week.",
        },
        cost: {
          text: "Everything I have, and I want the shape of it understood, because I am not what the broadsides say I am. I am not a courtier. My credit runs through two London houses and my warehouse is full of goods bought on it, and non-importation does not mean I sell less — it means I sell nothing while the interest runs. My windows were put in last month. And I will say the rest of it: the men who agreed the boycott are the same men who hold my paper, so I am to be ruined by my creditors in the name of my liberty. Write that down as I said it.",
          useful: true,
        },
        next: {
          text: "Repeal, and an end to committees deciding what a man may buy. You will not hear that said aloud in this square any more, which is itself worth your noticing.",
        },
      },
    },
    {
      id: "free-tradesman",
      name: "Free Black tradesman",
      role: "Keeps a trade in this city and reads every broadside in the square",
      group: "unasked",
      fallback: "He goes on with the work in his hands and lets the question sit.",
      answers: {
        cost: {
          text: "The same duty on the same paper and the same glass as any man who signed. There is no rate for me and a rate for them.",
        },
        heard: {
          text: "Let me answer that carefully, because you are the first to ask it. I read every word posted in this square. I pay the duties the subscribers are refusing. When the committee took the non-importation agreement round for signatures it went to the merchants, and then to the master craftsmen, and it did not come to me — not refused, you understand. Not brought. And I hear the same men who will not be taxed without their consent speak of chains and of slavery, and use those words as figures of speech, in a city where the thing itself is for sale a street away. They are not lying. They have simply never once been obliged to hear their own sentence read back.",
          useful: true,
          lead: "He has never been brought a subscription list. Find out what happens to a printed word between the press and the people it does not reach.",
        },
        next: {
          text: "I will not tell a stranger in the street what I think should be done. Ask me what is done to me and I will answer that all day.",
        },
      },
    },
    {
      id: "farmwife",
      name: "Farmwife",
      role: "Keeps the household while her husband drills",
      group: "unasked",
      fallback: "She sets down what she is carrying, looks at you, and picks it up again.",
      answers: {
        cost: {
          text: "You are asking the right person and I doubt you know it. The town resolved to import nothing. Very well — then somebody makes it here, and that somebody is me and every woman on this lane. Flax to be broken and hackled, wool to be carded and spun and dyed and woven, and a shift that took a shilling and an afternoon at the shop now takes a month. I do not begrudge it. I will wear homespun and be glad to. What I notice is that the resolve was signed at the coffee house by men who have never dressed a distaff, and that the whole of it is performed by people whose names are on no agreement at all.",
          useful: true,
        },
        heard: {
          text: "My husband's, when he is here. Mine, over a hedge. That is the honest answer and I will not dress it.",
        },
        next: {
          text: "Whatever they draft, let it remember the women who kept the house together while they drafted it. I have small hope of it and I say it anyway.",
        },
      },
    },
  ],
  requires: { useful: 6, label: "Accounts secured" },
  lockedNote:
    "Everyone in this square is holding one thing worth writing down, including the two nobody has asked. Find the rest before you file.",
  closer: {
    prompt:
      "Your notebook is above, in two panels: positions that are a matter of record, and positions nobody wrote down. Reading what you actually collected — what is a public position in this square made of?",
    skillCategory: "Contextualization",
    options: [
      {
        id: "permitted",
        text: "An argument, plus a way of being heard — and the second one is not distributed the way the first is",
        correct: true,
        why: "Right, and every person you asked is a different demonstration of it. Dickinson has the argument and still had to borrow a plough to carry it. The merchant's position is entered twice a week in a ledger and shouted down in the coffee house on the same day. The crier keeps the actual list of what gets said aloud in this square and told you exactly who is on it. And the two people with the clearest stake in the outcome — a man paying the very duties the subscribers refuse, and a household performing the boycott the resolves only signed — are in nobody's record of what this town thinks. That is not a conspiracy. It is what happens when the means of being heard is a printer, a bell, and a subscription list somebody has to bring you.",
      },
      {
        id: "principle",
        text: "A disagreement about constitutional principle, argued on its merits",
        correct: false,
        why: "The principle is real and Dickinson means it — he concedes Parliament's authority over trade in the same essay in which he denies its right to tax, which is not what a man inventing a cover story does. But you also collected a merchant whose credit runs through London houses, a household doing the labour a boycott creates, and a crier who has never in eleven years been handed a grievance from below. A principle argued only by the people who can afford to argue it is still a principle, and it is not the whole of what you found.",
      },
      {
        id: "interest",
        text: "Self-interest, dressed up as principle",
        correct: false,
        why: "That is the cynical reading and your own evidence refuses it as firmly as it refuses the innocent one. Dickinson hands his opponents half the argument on purpose. The recruiter told you plainly that arming ends the constitutional question rather than winning it, which is not a man deceiving himself about what he is doing. Interest and principle are both here, in the same people, at the same time — and telling them apart case by case is the work, not a verdict you deliver once.",
      },
      {
        id: "unanimous",
        text: "A town that had substantially made up its mind",
        correct: false,
        why: "You spoke to six people and got six positions, one of which has had its windows broken for being held. The merchant is not a rare exception — he is the reason committees existed, and the reason non-importation had to be enforced by neighbours rather than assumed. Unanimity in 1767 is something the surviving broadsides assert, not something the square you just walked contains.",
      },
    ],
  },
};

// ---- M3.B — "The Words as They Reached You" (ASSEMBLY, commoncause-henry-speech) -----------------
//
// The most quoted seven words in American history, and there is no contemporary text of them. That
// is not a scandal and the mission takes some care not to play it as one: Henry demonstrably moved
// the Second Virginia Convention to arm its militia, the vote is in the Convention's own journal,
// and the witnesses agreed about what he argued. What nobody has is a transcript, because nobody in
// St. John's Church was taking one.
//
// Two label boards rather than an image board, and the reason is the subject. Unit 1's assembly cut
// a real scanned sheet into ten tiles because the Waldseemüller map's *physical form* was the
// evidence. Here the evidence is a chain of custody, which has no picture — and inventing one would
// be the exact error the mission is about.
//
// The sharpest fragment on either board is `shorthand`, a distractor that belongs nowhere: "a
// shorthand transcript taken in the church and preserved in the Convention's papers." Every player
// reaches for it, because a speech this famous feels as though it must have been written down
// somewhere. It never was. A distractor that is the thing you most want to exist is worth more than
// three that are merely wrong.
//
// Board two is gated behind board one (`opensAfter`), for the reason the schema comment gives: what
// each phrase can carry is a question you cannot answer until you know how the phrase got here.
const THE_WORDS_AS_THEY_REACHED_YOU = {
  kind: "assembly",
  id: "case-007-assembly-the-words-as-they-reached-you",
  title: "The Words as They Reached You",
  variant: "Reconstruct a Provenance",
  missionQuestion:
    "Everyone can recite this speech and no one wrote it down. How did these words get from a church in Richmond to the sheet in your hand — and what can each part of it actually bear?",
  thinkingMove:
    "Reconstructing a chain of custody. What a document can prove depends on how it reached you, and that is a separate question from whether you believe it.",
  briefing: {
    speaker: "town-crier",
    line: "That is the Virginia speech, printed and posted, and I have cried it twice this month to men who could already say it back to me. Somebody handed me the sheet. I never asked who wrote it down in the church, and now that you put it to me I do not believe anybody told me that anyone had.",
  },
  debrief: {
    speaker: "town-crier",
    line: "So I have been crying a biographer at them. Well. They believed it before I read it and they will believe it after, and I am not sure that is the whole of a lie.",
    established:
      "The speech reached you through four stages and only the first two are eyewitness. A convention voted to arm after Henry spoke — that is in the journal, and it is beyond dispute. Elderly witnesses forty years later agreed about what he had argued. William Wirt then wrote out a continuous oration from those recollections, in the classical style he had been trained on, and the country learned it from him. Every stage is ordinary and none of it is fraud. What the sheet cannot do is tell you what was said in the room.",
    remains:
      "Which words are Henry's. Not some of them — any of them. The witnesses were interviewed by one man, decades on, after the famous phrase had already begun to circulate, and there is no test that separates a memory from a memory of a story about the memory.",
  },
  openQuestions: [
    "Whether the closing phrase was Henry's at all. St. George Tucker's recollection is the closest thing to a source and it survives only as Wirt reworked it; the original Tucker letter Wirt drew on is lost.",
    "How much of the Revolution's remembered oratory has the same shape. The generation that wrote the founding down was the generation that needed it to have sounded a particular way, and this speech is the clearest case rather than the only one.",
  ],
  // Philadelphia's one anomaly, and a map gets exactly one (Phase 77, decision log `0060`). Archival
  // rather than fantastical, on the Riverbend model: an annotated broadside is the most ordinary
  // object in an eighteenth-century square, and every innocent explanation is available. What does
  // not fit is the direction the corrections run. It is deliberately the same hand as the wharf
  // book's, and it is not resolved here or anywhere yet.
  anomaly: {
    noticed:
      "Somebody has been through this broadside in pencil. The marks are collation — a word struck, a phrase inserted, a clause moved — and every one of them pulls the text toward the wording that will be printed in 1817. The corrections are older than the edition they correct toward, and the letters are ruled the way the altered figure in the Riverbend wharf book was ruled.",
    note: "An antiquarian collating one printing against a better one is the most ordinary thing that can happen to a broadside, and it accounts for every mark on this sheet except their direction. You cannot correct a text toward an edition that has not been made. File the record as it stands and flag the page. Do not annotate it yourself — whatever else is true, a second hand in this margin is now evidence.",
  },
  arcClose: {
    speaker: "town-crier",
    line: "A letter signed Farmer, a speech nobody took down, and a proclamation off a warship. I have cried two of the three and I did not write any of them.",
    established: COMMON_CAUSE_ARC,
  },
  codexFiling: {
    summary:
      "No contemporary text of the speech exists. A convention's vote is documented, the witnesses' account of the argument is credible, and the famous wording is William Wirt's reconstruction of 1817 — three different grades of evidence on one sheet.",
    tags: ["Whose account is this", "How a text travels", "What the record leaves out"],
    // Both missions read a document's own making as the evidence. The map showed its edge of
    // knowledge in its physical form; this sheet shows its edge of knowledge in its transmission.
    seeAlso: ["case-001-assembly-universalis"],
  },
  historicalRecord: {
    documented: [
      "The Second Virginia Convention met at St. John's Church, Richmond, in March 1775 and adopted resolutions putting the colony into a posture of defence, by a narrow vote, after Henry spoke.",
      "No contemporary transcript, shorthand record or newspaper text of the speech exists. The Convention kept a journal of motions and votes, not of debate.",
      "William Wirt's Sketches of the Life and Character of Patrick Henry (1817) is the first appearance of the speech in the wording now universally quoted.",
      "Wirt assembled that wording decades after the fact from the recollections of elderly witnesses, including St. George Tucker, and from his own sense of what the occasion required.",
      "The near-universal reprinting of Wirt's version in nineteenth-century school readers and elocution manuals, which is how the phrase became a national possession.",
      "Colonial newspapers rarely printed legislative speeches verbatim; the Virginia Gazette reported the Convention's action, not its oratory.",
    ],
    reconstructed: [
      "The broadside you are holding. Printed texts of the speech circulated widely after 1817; a Philadelphia broadside dated to the 1770s is Chronicle's framing device for putting the transmission problem in a player's hands.",
      "The pencil collation described in the record flag.",
    ],
    fiction: [
      "Chronotravel, the Institute, and a Chronicler reading a sheet whose text will not be written for another forty-two years.",
    ],
    debated: [
      "How much of Wirt's text descends from anything Henry said. Historians range from treating the substance as broadly reliable to treating the whole oration as Wirt's composition on a documented occasion, and the surviving evidence does not close the question.",
    ],
  },
  intro:
    "Seven words that every schoolchild in this country will be able to recite, and not one person wrote them down at the time. Rebuild how they reached this sheet, then say what each part of it can actually bear.",
  howItWorks: {
    steps: [
      "Click a piece in the tray, then the stage you think it belongs to. Dragging works too.",
      "Two of the pieces belong nowhere. Both are things you would expect to exist, and the board will tell you why they do not.",
      "Finish the chain and a second board opens: what each part of this speech can actually be used to prove.",
    ],
    note: "Start from the end you can verify. One stage of this chain is in a public journal with a vote recorded in it; work outward from that.",
  },
  terms: [
    {
      term: "provenance",
      definition:
        "The documented history of how a source got from its origin to your hands. A source with no provenance is not necessarily false — it is a source whose reliability you have no way to test.",
    },
    {
      term: "collation",
      definition:
        "Comparing one printing of a text against another and marking the differences. Ordinary editorial work, and a normal thing to find in a margin.",
    },
    {
      term: "the Second Virginia Convention",
      definition:
        "An extralegal assembly of Virginia's leading men, meeting in March 1775 because the royal governor had dissolved the lawful House of Burgesses. It voted to arm the colony's counties.",
    },
    {
      term: "elocution manual",
      definition:
        "A schoolbook of passages for recitation. Nineteenth-century American ones carried Wirt's version of this speech more than almost any other text, which is how the wording became fixed.",
    },
  ],
  boards: [
    {
      id: "chain",
      kind: "label",
      label: "How these words reached this sheet",
      note: "Four stages, in order, from the church to the broadside. Two of the pieces in the tray belong to no stage at all — decide which, and be ready to say why you expected them.",
      slots: [
        {
          id: "spoken",
          label: "March 1775: what is documented to have happened in the church",
        },
        {
          id: "remembered",
          label: "The forty-two years between the speech and any text of it",
        },
        {
          id: "written",
          label: "1817: how the wording on this sheet was actually produced",
        },
        {
          id: "printed",
          label: "After 1817: how one man's wording became everybody's",
        },
      ],
      fragments: [
        {
          // Every label on both boards is kept to roughly a dozen words. A fragment renders as a
          // pill in a tray of five, and a sentence in that space is a wall of type nobody reads —
          // the argument goes in `misread`, which has a paragraph to make it in.
          id: "convention",
          label: "The Convention votes to arm Virginia's counties, narrowly, after he speaks",
          belongs: "spoken",
          hints: [
            "One stage of this chain is recorded in a public document that survives. Which stage has a vote in it?",
            "This is the only thing about the occasion that is not in dispute — and notice that it is about what the speech did, not what it said.",
          ],
          misread:
            "The Convention kept a journal of its motions and its votes, and this is in it. Everything beyond the effect of the speech is somebody's recollection; the effect itself is a public record, which is why it is the firmest ground on the board.",
        },
        {
          id: "tucker",
          label: "St. George Tucker and other elderly witnesses recall it for a biographer",
          belongs: "remembered",
          hints: [
            "Between the speech and the first text of it, the only place the words exist is inside people.",
            "Ask who was collecting, and when. A recollection is evidence about the moment it was given as well as the moment it describes.",
          ],
          misread:
            "This is the whole of the eyewitness stage, and it is worth reading carefully rather than dismissing. These men were in the room. They were also very old, they were interviewed by one man who wanted a particular kind of book, and the famous phrase had been in circulation for years before anyone wrote their memories down.",
        },
        {
          id: "wirt",
          label: "William Wirt writes a continuous oration out of those recollections",
          belongs: "written",
          hints: [
            "Somebody had to turn a set of recollections into a speech with a beginning, a middle and an ending.",
            "The stage you want is the one where a text first exists — not where it was remembered, and not where it was spread.",
          ],
          misread:
            "This is where the sentence you can recite was actually made. Wirt was a lawyer and a stylist working in 1817 on a life of a hero, and the oration he produced has the shape of the classical models he had been trained on rather than the shape of remembered speech. That is not fraud. It is what a biography was for in 1817, and he never claimed to be quoting a transcript.",
        },
        {
          id: "schoolbook",
          label: "Reprinted in schoolbooks until the wording is national property",
          belongs: "printed",
          hints: [
            "How did a passage from one 1817 biography become something every schoolchild could say?",
            "This stage is the reason the question is hard. By the time anyone thought to check, the phrase had been recited too many times to sound like anyone's composition.",
          ],
          misread:
            "This is the stage that makes the wording feel self-evidently authentic. A phrase recited by millions of schoolchildren stops sounding like a sentence someone wrote and starts sounding like something that was simply always there, which is precisely why the earlier stages are so easy to skip past.",
        },
        {
          id: "shorthand",
          label: "A shorthand transcript taken in the church",
          belongs: null,
          hints: [
            "Before you place this, ask what it would look like if it existed. Where would it be, and who would have cited it?",
            "This is the piece everyone reaches for. That is worth pausing on rather than hurrying past.",
          ],
          misread:
            "There is no such transcript, and there never was one. The Convention recorded its motions and votes, not its debates, and no contemporary text of this speech exists in any form. This is the piece every player reaches for, because a speech this famous feels as though it must have been written down somewhere by somebody. The feeling is the thing to notice: fame is not provenance, and the more certain you are that a record must exist, the more worth checking it is.",
        },
        {
          id: "gazette",
          label: "Printed in full in the Virginia Gazette the following week",
          belongs: null,
          hints: [
            "The newspapers of 1775 did report the Convention. Ask what they reported about it.",
            "Colonial papers printed resolutions, proceedings and letters. A speech, word for word, from a room with no reporter in it?",
          ],
          misread:
            "The Gazette reported what the Convention had resolved, which is the part that mattered to its readers and the part anybody could obtain. Colonial newspapers rarely printed a legislative speech verbatim, and there was no reporter in St. John's Church to have produced one. A newspaper is an excellent record of what an assembly decided and a poor one of how it was persuaded.",
        },
      ],
    },
    {
      id: "bear",
      kind: "label",
      label: "What each part of it can carry",
      note: "The chain is rebuilt. Now sort the three claims a person might make from this sheet by what your reconstruction will actually support. Two of the pieces are overcorrections — the mistake made by someone who has just learned there is no transcript.",
      opensAfter: "chain",
      slots: [
        { id: "effect", label: "Documented — the sheet's evidence is as good as it gets" },
        { id: "substance", label: "Credible — the witnesses agreed, and they were in the room" },
        { id: "wording", label: "Unsupported — only Wirt's page can vouch for this" },
      ],
      fragments: [
        {
          id: "armed",
          label: "That a convention voted to arm Virginia after hearing him",
          belongs: "effect",
          hints: [
            "Which of these three claims has a document behind it that nobody made from memory?",
            "The vote is written in the Convention's journal. Nothing on this board is on firmer ground than that.",
          ],
          misread:
            "This is the firmest claim on the sheet and it is worth noticing that it is about consequence rather than content. A historian who cannot quote a word of the speech can still establish exactly what it accomplished, from a record made at the time by people with no interest in the wording.",
        },
        {
          id: "war-begun",
          label: "That he argued the war had begun and petitioning was finished",
          belongs: "substance",
          hints: [
            "Several men who were there agreed about this, decades later, and it also matches what the Convention then did.",
            "This is stronger than the wording and weaker than the vote. There is a slot for exactly that.",
          ],
          misread:
            "The substance is the middle grade of evidence and the one students most often collapse into one of the other two. The witnesses agreed on what he argued, and the Convention's action is consistent with it — that is real corroboration and it is not a transcript. Credible is a verdict, not a hedge.",
        },
        {
          id: "exact",
          label: "The exact closing words, in the order everyone can recite them",
          belongs: "wording",
          hints: [
            "Trace this one back through the chain you just built. Where does it first exist as text?",
            "It first appears on a page written in 1817. That is not nothing, and it is not a quotation.",
          ],
          misread:
            "This is the part of the sheet everyone came for and the part it can least support. The phrase first exists in Wirt's 1817 page. Whether it descends from something Henry said, from a witness's paraphrase, or from Wirt's ear for a closing line is exactly what the evidence cannot settle — and a Chronicler who quotes it without saying so has passed a reconstruction off as a record.",
        },
        {
          id: "invented",
          label: "That Henry said nothing of the kind, and Wirt invented it",
          belongs: null,
          hints: [
            "You have just placed something documented about this occasion. Does this claim survive it?",
            "There is a difference between an unrecorded speech and an invented one, and the whole mission is that difference.",
          ],
          misread:
            "This is the overcorrection, and it is the more damaging of the two errors because it feels like rigour. The occasion is documented, the vote is in the journal, and the witnesses were real men who were really in the room. Discovering that a text is a reconstruction is a reason to grade it carefully, not a licence to throw the event away with it.",
        },
        {
          id: "verbatim",
          label: "That it is verbatim — several witnesses remembered it independently",
          belongs: null,
          hints: [
            "Independently. Test that word against the chain you built — who interviewed them, and when?",
            "Forty-two years, one interviewer, and a phrase already in circulation. What survives of the independence?",
          ],
          misread:
            "Independent recollection would be powerful evidence, which is why this is the most tempting piece on the board. It is also the thing forty-two years and a single interviewer destroy. The witnesses were sought out by one man, long after the phrase had begun circulating, and were asked to confirm a version rather than to produce one from nothing. Corroboration requires sources that did not pass through the same hands.",
        },
      ],
    },
  ],
  closer: {
    prompt:
      "The chain is rebuilt and the claims are graded. Your reading goes into the record — what is this sheet evidence of?",
    skillCategory: "Sourcing",
    options: [
      {
        id: "reconstruction",
        text: "A documented occasion, and what a later generation needed it to have sounded like",
        correct: true,
        why: "Right, and it holds both halves without flinching from either. The occasion is real and its consequence is in a public journal. The wording is a reconstruction made forty-two years afterwards by a man writing a hero's life in the style he had been trained on, and the country learned it from him and then from schoolbooks quoting him. That combination is not a scandal and it is not a footnote — it is one of the most common shapes a founding document takes, and it is the reason a historian asks how a source reached them before asking whether they believe it.",
      },
      {
        id: "verbatim",
        text: "What Patrick Henry said in St. John's Church on March 23, 1775",
        correct: false,
        why: "You placed the piece that says there is no transcript, and you were right to place it nowhere. There is no contemporary text of this speech in any form. What you have is a chain that begins with a vote, passes through the memories of old men, and arrives at a biographer's page — and a chain like that can establish a great deal, but never the words.",
      },
      {
        id: "fabrication",
        text: "A fabrication, and evidence that the Revolution's oratory cannot be trusted",
        correct: false,
        why: "This is the overcorrection you already declined once on the second board. The Convention met, Henry spoke, the vote carried, and the witnesses were real. Learning that a text is a reconstruction tells you how to use it; it does not entitle you to throw away the occasion it reconstructs, and a Chronicler who does that has replaced one uncritical reading with another.",
      },
      {
        id: "oratory",
        text: "How colonial assemblies conducted debate",
        correct: false,
        why: "It is close to worthless for that, and for an instructive reason. This is one speech, reconstructed in the style of 1817 by a man who was not there, on an occasion so exceptional that a convention was meeting outside the law. Almost nothing about the sheet is typical — including its survival, which happened because the speaker became famous rather than because the record-keeping was good.",
      },
    ],
  },
};

// ---- M3.C — "Freedom on Conditions" (TRACE, commoncause-dunmore-proclamation) --------------------
//
// Riverbend traced a commodity and asked what a wharf book could establish about the people who made
// it. This traces an *order* and asks a different question: what can a piece of paper actually cause,
// and who does the causing?
//
// The chain turns on its third leg. Dunmore signed a document; what happened next was performed by
// people acting on rumour, at enormous personal risk, ahead of any guarantee — and the proclamation
// records none of it, because a proclamation records what its author declared. The support axis is
// where a student says so.
//
// `emancipation-policy` is the standing distractor and is the answer to no leg. It is the intuitive
// reading — Britain has decided to free the slaves — and the proclamation's own wording refuses it in
// two places: the offer runs only to those "appertaining to Rebels," and only to those "able and
// willing to bear arms." Enslaved people held by Loyalists are exempted entirely. A student who
// reaches for it has read the fact of the offer and not the shape of it, which is exactly the error
// worth surfacing on a document this famous.
const FREEDOM_ON_CONDITIONS = {
  kind: "trace",
  id: "case-007-trace-freedom-on-conditions",
  title: "Freedom on Conditions",
  variant: "Follow an Order",
  missionQuestion:
    "Dunmore signed one page aboard a warship, and thousands of people moved. Follow what it set in motion, and at each step ask the harder question — is this page what caused it?",
  thinkingMove:
    "Telling an order apart from its effects. A document can be the occasion of something without being its cause, and the people who acted are not always the people who are written down.",
  briefing: {
    speaker: "liaison",
    line: "This one came off a ship and went further than the man who wrote it could reach. Follow it the whole way and keep the two questions apart in your head: what happened at each step, and whether this page is what made it happen. They are not the same question and the second is the harder one. I will be here.",
  },
  debrief: {
    speaker: "liaison",
    line: "Good. You had the third leg right and most people do not — they read a name at the bottom of a page and hand it the whole event.",
    established:
      "The proclamation is excellent evidence of a wartime calculation and poor evidence of what followed from it. It establishes what Dunmore declared, on what conditions, and to whom: only those held by rebels, and only those able and willing to bear arms. What it cannot establish is the crossing itself. Thousands of people moved toward British lines over the course of the war on rumour, at appalling risk, in advance of any guarantee — and the page records the offer, not one of them.",
    remains:
      "How many, and who. There is no register of the people who acted on this. British forces kept some lists late in the war, incomplete and made for other purposes; the crossings themselves were made by people the record had no reason to count and every reason not to.",
  },
  openQuestions: [
    "What the people who crossed believed they were being offered. The proclamation's conditions were narrow; what reached the quarters was word of mouth, and no account survives of how far the conditions travelled with the news.",
    "How much the proclamation changed the minds of wavering Virginia slaveholders, as against confirming a fear they already held. Both readings fit the surviving correspondence, and historians weigh them differently.",
  ],
  arcClose: {
    speaker: "liaison",
    line: "Three records, and the people who actually moved on this one are in none of them. Note that. It will keep coming up.",
    established: COMMON_CAUSE_ARC,
  },
  codexFiling: {
    summary:
      "A martial-law proclamation offering freedom only to those held by rebels and able to bear arms. Excellent evidence of a wartime calculation; no evidence at all of the thousands who acted on rumour of it.",
    tags: [
      "Written to persuade",
      "Who is permitted to speak",
      "How a text travels",
      "Who does the work",
    ],
    seeAlso: ["case-004-trace-one-hogshead"],
  },
  historicalRecord: {
    documented: [
      "Lord Dunmore's proclamation of November 7, 1775, issued under martial law from aboard ship after Patriot militia had driven him from Virginia's government.",
      "Its exact conditions: freedom offered to indentured servants and enslaved people belonging to rebels, who were able and willing to bear arms for the King. Those held by Loyalists were exempted.",
      "Its printing in the Pennsylvania Journal and Weekly Advertiser on December 6, 1775, and its wide reprinting after.",
      "The Ethiopian Regiment, raised from those who reached British lines, and the sashes reading 'Liberty to Slaves' its soldiers are recorded wearing.",
      "The Virginia Convention's answering proclamation of December 1775, offering pardon to those who returned within ten days and death to those who did not.",
      "The catastrophic mortality from smallpox and camp fever among those who reached Dunmore's forces.",
      "The radicalising effect on wavering Virginia slaveholders, recorded across their own correspondence in the winter of 1775–76.",
    ],
    reconstructed: [
      "The wharf dispatch table this record sits on, and a Chronicler reading the Pennsylvania printing within days of it appearing.",
      "The four legs as discrete stages. The proclamation, its printing, its spread by word of mouth and its answer overlapped in reality and are separated here to be examined.",
    ],
    fiction: ["Chronotravel, the Institute, and a record secured in the field."],
    debated: [
      "How many people reached British lines in response, and over what period. Estimates vary widely and rest on fragmentary British returns compiled for other purposes.",
      "Whether the proclamation is best read as a military expedient or as one step in a longer British movement toward emancipation. The wording supports the first reading; the later Philipsburg Proclamation of 1779 complicates it.",
    ],
  },
  intro:
    "One page, signed on a ship by a governor who no longer governed anything. It raised a regiment, hardened the men it was meant to frighten, and moved thousands of people who never saw it. Follow it, and say at each step what the page can actually account for.",
  howItWorks: {
    steps: [
      "The order moves in four legs, in order. Each says what changes and whose hands it passes through.",
      "Every leg asks you twice: what happens here, and how far this page carries it. The second question only opens once the first is right.",
      "Then keep three of the four entries in your Field Notebook. Three is all you get, so keep the ones your conclusion will rest on.",
    ],
    note: "One of the answers offered is never right on any leg. Read the proclamation's conditions closely enough to work out which, because the conditions are where its purpose is legible.",
  },
  notebook: {
    capacity: 3,
    prompt:
      "Four legs entered, three slots. The one you leave out is not a mistake — it is the part of this event the page cannot speak to.",
    emptyNote: "Enter a leg correctly and it becomes available to keep.",
  },
  terms: [
    {
      term: "martial law",
      definition:
        "Military rule replacing civil government. Dunmore declares it in the same document, which is what he believes gives him the authority to do the rest of it.",
    },
    {
      term: "appertaining to Rebels",
      definition:
        "Belonging to those in arms against the King. The single most important phrase in the proclamation: it makes the offer conditional on who claims you, not on what you are.",
    },
    {
      term: "the Ethiopian Regiment",
      definition:
        "The unit raised from those who reached Dunmore's forces. Contemporaries record its soldiers wearing sashes lettered 'Liberty to Slaves'.",
    },
    {
      term: "proclamation",
      definition:
        "A public declaration by an executive authority. It records what was declared. It is not, by itself, evidence that anything was done about it.",
    },
  ],
  subject: {
    label: "Lord Dunmore's Proclamation, November 7, 1775",
    note: "Issued under martial law aboard ship off Norfolk; printed in Philadelphia four weeks later.",
  },
  nodes: [
    { id: "ship", label: "Aboard the William, off Norfolk" },
    { id: "press", label: "A Philadelphia printing office" },
    { id: "quarters", label: "The quarters, by word of mouth" },
    { id: "lines", label: "British lines, and the regiment raised there" },
    { id: "convention", label: "The Virginia Convention's answer" },
  ],
  // What happens on a leg — a question about the world, answered from everything the player knows.
  //
  // `emancipation-policy` is the standing distractor and the answer to nothing. See the header: the
  // proclamation's two conditions refuse it in its own words, and a student who picks it has read
  // that an offer was made without reading what the offer was.
  effects: [
    { id: "military-manpower", label: "It is meant to raise soldiers and break a labour force" },
    { id: "printed-reach", label: "Print carries it further and faster than its author intended" },
    {
      id: "people-act",
      label: "People act on it themselves, at their own risk, ahead of any guarantee",
    },
    { id: "harden-owners", label: "It pushes wavering slaveholders toward independence" },
    { id: "emancipation-policy", label: "Britain has decided to end slavery in the colonies" },
  ],
  // How far this page carries the answer just given — a question about the record rather than the
  // world. All three levels are live in the chain below, which is the design rule: an axis where one
  // level is the answer everywhere is a formality, and one where a level is the answer exactly once
  // is the odd-one-out puzzle this replaced (Phase 76, decision log 0059).
  supportLevels: [
    { id: "established", label: "The proclamation states it" },
    { id: "inferred", label: "Reasonable from the proclamation, not stated" },
    { id: "not-shown", label: "Not shown by this proclamation" },
  ],
  supportPrompt: "And how far does the page itself actually carry that?",
  legs: [
    {
      id: "signing",
      from: "ship",
      to: "press",
      label: "A governor with no government declares martial law",
      transforms:
        "Driven from Williamsburg by Patriot militia, Dunmore declares martial law from a warship and, in the same document, offers freedom to indentured servants and enslaved people belonging to rebels who are able and willing to bear arms for the King.",
      actor: "Dunmore, and the naval officers around him.",
      effect: "military-manpower",
      support: "established",
      why: "The page says so in its own conditions, and the conditions are the argument. The offer runs only to those 'appertaining to Rebels' — a Loyalist's enslaved people are exempted by name — and only to those 'able and willing to bear arms'. Read together, those two clauses describe a man who needs soldiers and who would like his enemies' fields to stop being worked. That is a military measure written as a proclamation, and it does not require you to guess at his motives: he wrote them into the eligibility rules.",
    },
    {
      id: "printing",
      from: "press",
      to: "quarters",
      label: "The text is set in type and travels beyond its author",
      transforms:
        "Four weeks after signing, the proclamation is set and printed in Philadelphia — by Patriot printers, for Patriot readers, as an outrage to be circulated — and from there is reprinted the length of the seaboard.",
      actor: "Printers who are on the other side of the argument.",
      effect: "printed-reach",
      support: "inferred",
      why: "This is the one leg where the mechanism is not on the page at all and the page is still good evidence of it. A proclamation issued from a ship reaches almost nobody; this one reached everybody, because the people it most alarmed printed it themselves to prove what they were up against. You can read that off the object — a Philadelphia imprint of a Virginia order, in a Patriot paper — without a line of the text stating it. That is a sound inference, and calling it stated would be exactly the error the second question exists to catch.",
    },
    {
      id: "crossing",
      from: "quarters",
      to: "lines",
      label: "People move, on rumour, ahead of any guarantee",
      transforms:
        "Word of the offer spreads by mouth into the quarters, in versions the conditions may not have survived. Over the following months people leave at appalling risk — men, and also women and children the offer never mentioned — and those who reach the lines are formed into a regiment whose soldiers are recorded wearing sashes lettered 'Liberty to Slaves'. Many die of smallpox and camp fever within the year.",
      actor: "The people who decided to go, each one for themselves.",
      effect: "people-act",
      support: "not-shown",
      why: "Both halves, and they point opposite ways. The crossings are the largest thing in this whole chain and the page contains not one of them. It is a declaration of an offer; it has no register, no names, no numbers, and no way of knowing whether the conditions it set were ever what reached the quarters. What is documented elsewhere is that people went — including women and children, for whom the proclamation made no provision at all, which tells you they were acting on their own reading of the moment rather than on its terms. You can establish this from other evidence. You cannot establish it from this page, and a Chronicler who lets one document take credit for what thousands of people did has written the wrong history politely.",
    },
    {
      id: "answering",
      from: "lines",
      to: "convention",
      label: "The colony answers, and the argument moves",
      transforms:
        "The Virginia Convention answers with a proclamation of its own — pardon to those who return within ten days, death to those who do not — and slaveholders who had been arguing about duties on glass begin writing to one another about independence.",
      actor: "The Virginia Convention, and the men reading their own post.",
      effect: "harden-owners",
      support: "not-shown",
      why: "The effect is real and heavily documented in the correspondence of that winter, and none of the documentation is here. This page is dated November and knows nothing about December; a document cannot report its own consequences. The chain's last leg is the clearest case of a rule that runs through all four — establishing what happened is one job, and establishing that this particular piece of paper is your evidence for it is a different one.",
    },
  ],
  closer: {
    prompt:
      "Four legs entered. Your reading goes into the record — what is a proclamation like this one evidence of?",
    skillCategory: "Causation",
    options: [
      {
        id: "calculation",
        text: "A wartime calculation, stated in its own conditions — and not evidence of what anyone did about it",
        correct: true,
        // The two legs where the page is the evidence. Deliberately not the two where it is not: a
        // conclusion about what a record can carry has to be kept out of the legs it cannot carry.
        requiresEvidence: ["signing", "printing"],
        unsupportedNote:
          "This is the reading the page will bear, and right now you are not carrying it. The signing and the printing are where this argument lives — they are the two legs the document itself accounts for. Go back and keep the entries your conclusion actually rests on.",
        why: "Right, and the conditions are what prove it without any guessing at motive. Only those held by rebels; only those able and willing to bear arms; Loyalists' claims untouched. A man freeing people would not have written those clauses, and a man raising a regiment and breaking an enemy's labour force would write exactly them. Everything after the printing — the crossings, the regiment, the hardening of the men it frightened — is real, is documented elsewhere, and is not on this page.",
      },
      {
        id: "emancipation",
        text: "The beginning of British emancipation in the colonies",
        correct: false,
        why: "You declined that answer on all four legs, and the document is why. It exempts every enslaved person held by a Loyalist, which is not something an emancipation measure does. Britain's relationship to slavery in this war is a real and complicated question — the Philipsburg Proclamation four years later is a genuinely different document — but reading this page as the start of it means reading past its two conditions to the headline.",
      },
      {
        id: "liberation",
        text: "That the British freed thousands of enslaved Virginians",
        correct: false,
        why: "Thousands of people freed themselves, which is not the same sentence and is the more accurate one. You logged the third leg as something this page does not show, and that was the right call twice over: the page has no record of the crossings, and the crossings were not something done to those people. They went, on rumour, ahead of any guarantee, and many of them died of it. Attributing that to the man who signed the paper takes it away from them.",
      },
      {
        id: "hypocrisy",
        text: "That Patriot claims to liberty were hypocritical",
        correct: false,
        why: "You can build that argument, and this is not the document to build it on. What the page supports is a British military calculation; what supports the other claim is the free tradesman in the square, the Hall petition on the statehouse table, and the men who read this proclamation and moved toward independence because of what it threatened. Use the evidence that carries the claim — a strong argument on a weak source is still a weak argument.",
      },
    ],
  },
};

export const UNIT_03_ACTIVITIES = {
  "commoncause-dickinson-letter": A_PUBLIC_POSITION,
  "commoncause-henry-speech": THE_WORDS_AS_THEY_REACHED_YOU,
  "commoncause-dunmore-proclamation": FREEDOM_ON_CONDITIONS,
};
