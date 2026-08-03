// Case 1.01's three activities, keyed by the source id each one opens from.
//
// These replaced the three hand-written activity screens that used to be welded
// one apiece to these same three sources (village-activity, columbus-activity,
// map-jigsaw). Every field here is content: the engines in
// engine/activities/ know none of it. See docs/decision-log/0051.
//
// Rewritten in Phase 69 after the first playtest (docs/decision-log/0052). The
// mechanics were sound and almost nothing said what a player was doing, so this
// pass is framing: a `howItWorks` panel on each, a glossary where a word arrives
// from nowhere, the letter's own text before its claims, and a goal per mission
// that is one number rather than two.
//
// The three are meant to be played in the order the field gate already
// enforces — the village record first, then the camp and the chart table —
// because "What Will Be Useful" audits Columbus's letter against observations
// the player gathered in "The Question Nobody Asked". An observation whose
// `requires` token was never earned shows as a gap in the evidence column
// rather than being handed over, which is the whole point: two students audit
// the same letter with different evidence because they asked different people.
//
// Token format for `requires` is `asked:<npc id>:<question id>` — built by
// main.js's interviewTokens() from the interview's *logged* answers. Hearing
// something is not carrying it.

// ---- M1.A - "The Question Nobody Asked" (INTERVIEW, taino-context) ------------------------------
//
// Four questions, seven speakers, and exactly seven useful answers — one per
// person. Everyone on the island knows one thing worth having and will not
// volunteer it, so the mission is finding which question reaches which person.
// That is also the completion bar: `requires.useful: 7`, one account from each
// of the seven, which replaced a "4 questions / 5 people" pair a player read as
// a contradiction rather than as a goal.
//
// **The grid is deliberately sparse — 21 of 28 cells, three per speaker.** It
// shipped full in Phase 68 and every person had a paragraph for every question,
// which made asking everyone everything the dominant strategy and reading a
// person's position pointless. Each speaker now carries one useful answer, two
// short deflections that mostly name who to ask instead, and one question left
// unauthored so their `fallback` finally fires — those 7 lines were written in
// Phase 68 and, until Phase 71, not one of them could ever be reached.
//
// Three flat answers are load-bearing and were trimmed rather than cut:
// `columbus:grows`, `columbus:decides` and `taino-elder:gold` key the audit's
// three optional observations, which is what still rewards a thorough player.
//
// The child's line is the hook and it already ships as his standing dialogue
// ("Nobody asks me what grows here, and I could tell them"). Until now nothing
// in the game let a player take him up on it.
const QUESTION_NOBODY_ASKED = {
  kind: "interview",
  id: "case-001-interview-what-was-asked",
  title: "The Question Nobody Asked",
  variant: "Ask the Right Question",
  missionQuestion:
    "What did the Spanish party fail to learn about this island, and what does that failure tell you about what they came for?",
  thinkingMove:
    "Reading a record for what it leaves out. An absence in a source is evidence about the person who made it.",
  debrief: {
    speaker: "taino-child",
    line: "You asked me what grows here. Nobody had. I have been standing in the same place the whole time.",
    established:
      "The islanders answer what they are asked, and they are asked almost nothing. Between them they hold a farming system, a way of deciding things, and a trade route that reaches three islands — none of which appears in what the Spanish party will carry home. The gap is not in the island's knowledge. It is in the questions.",
    remains:
      "Whether the Spanish party could have understood these answers if they had asked. Nothing you gathered tells you what either side was able to make of the other, and the exchange at the shore is exactly where that breaks down.",
  },
  openQuestions: [
    "How many people were living on Hispaniola in 1492. You were on one shore for one afternoon, and the estimates historians work from differ by an order of magnitude.",
  ],
  codexFiling: {
    summary:
      "Seven people on one shore held a farming system, a way of deciding things and a three-island trade route. The Spanish account carries none of it, because nobody asked.",
    tags: ["Whose account is this", "What the record leaves out", "Counting people"],
  },
  historicalRecord: {
    documented: [
      "Taíno conuco agriculture: yuca heaped into mounds with maize between and batata beneath, worked ground rather than wild ground.",
      "Taíno political structure — a cacique speaking for a village, with elders consulted — described in the Library of Congress's 1492: An Ongoing Voyage.",
      "Inter-island canoe travel and exchange across the Greater Antilles.",
      "Columbus's 1493 letter, its printing across Europe within months, and the funding of a second voyage on the strength of it.",
    ],
    reconstructed: [
      "All seven people you spoke to. They are composites, built from what the archaeological and documentary record establishes about Taíno village life and about the men on the first voyage — not individuals anyone recorded.",
      "The specific conversations. What they say is consistent with the evidence; that they said it to you is not.",
    ],
    fiction: [
      "Chronotravel, the Chronicle Institute, and a record that can be secured before it is lost.",
    ],
    debated: [
      "The pre-contact population of Hispaniola. Sixteenth-century figures and modern estimates disagree enormously, and the disagreement is itself about which sources historians trust.",
    ],
  },
  intro:
    "Four questions, and everyone on this island will answer only the one you actually put to them. What comes back is not a record of the island. It is a record of what you thought to ask.",
  howItWorks: {
    steps: [
      "You may ask any question to any person. Consider their position.",
      "Most people will send you elsewhere. When someone gives you something worth keeping, press Add to Field Notebook.",
      "Seven people, seven accounts — one from each. That is the whole mission.",
    ],
    note: "What goes in your Field Notebook is what you carry into Columbus's letter at the chart table. A question you never asked is a line of it you have no way to check.",
  },
  briefing: {
    speaker: "taino-child",
    line: "My grandmother says the strangers ask the same question over and over — where the gold is. Nobody asks me what grows here, and I could tell them.",
  },
  terms: [
    {
      term: "cacique",
      definition:
        "The person who speaks for a Taíno village. An office, not a crown — the elders are consulted before a cacique settles anything.",
    },
    {
      term: "conuco",
      definition:
        "A Taíno garden of raised earth mounds. Yuca is planted in the mound, maize between, sweet potato beneath — a system, built by hand, that holds through the dry season.",
    },
  ],
  questions: [
    { id: "gold", label: "Where is the gold?" },
    { id: "grows", label: "What grows here?" },
    { id: "decides", label: "Who decides here?" },
    { id: "trade", label: "What do you trade, and with whom?" },
  ],
  groups: [
    {
      id: "taino",
      label: "The islanders",
      note: "They have lived here for centuries and will answer anything they are actually asked.",
    },
    {
      id: "spanish",
      label: "The Spanish party",
      note: "Ashore for days. Everything they will report to Castile is being decided this week.",
    },
  ],
  speakers: [
    {
      id: "taino-elder",
      name: "Taíno community elder",
      role: "Consulted before the cacique speaks",
      group: "taino",
      fallback: "She waits, and does not fill the silence for you.",
      answers: {
        // Kept because the audit keys an optional observation off it. Trimmed, not cut — see this
        // file's header on which three flat answers are load-bearing.
        gold: {
          text: "We beat it thin and wear it, and give it away when giving is the right thing to do. You asked that one first.",
        },
        grows: { text: "Her hands are in the mounds, not mine. Ask her." },
        decides: {
          text: "A cacique — the one who speaks for the village — speaks for this one, and I am consulted before he does. Nothing is settled here until the people who will have to carry it have said their part.",
          useful: true,
        },
      },
    },
    {
      id: "taino-gardener",
      name: "Taíno gardener",
      role: "Works the conuco — the mounded garden plots",
      group: "taino",
      fallback: "She turns back to the row she was working.",
      answers: {
        gold: { text: "None in this ground. Cassava is in this ground, and that is what we eat." },
        grows: {
          text: "Yuca first — we heap the earth into mounds, a conuco, and it holds through the dry season. Maize between the mounds, batata beneath them, ají and cotton at the edges. None of it arrived here on its own.",
          useful: true,
        },
        trade: {
          text: "Cotton leaves in bales. The canoes are not mine — ask the man who keeps them.",
        },
      },
    },
    {
      id: "taino-fisher",
      name: "Taíno canoe worker",
      role: "Keeps the village canoes",
      group: "taino",
      fallback: "He keeps working the hull and lets the question go past him.",
      answers: {
        gold: { text: "Not in the water. Ask the men who came in the boats." },
        grows: {
          text: "Nothing grows on water. The mounds are up the hill — ask the woman working them.",
        },
        trade: {
          text: "The water is a road. I have carried cassava bread to three islands and come back with cotton, with news, and once with a man who stayed. A stranger looks at empty water and thinks we are alone out here. We are not.",
          useful: true,
        },
      },
    },
    {
      id: "taino-child",
      name: "Taíno child",
      group: "taino",
      fallback: "He looks at you, then at his feet.",
      answers: {
        gold: { text: "That is the question. That is always the question." },
        grows: {
          text: "Cassava, and maize, and the sweet root under the mounds. My grandmother says nobody asks me what grows here and I could tell them. I just did.",
          useful: true,
        },
        decides: {
          text: "The grown ones. My grandmother is over there — she will tell you properly.",
        },
      },
    },
    {
      id: "columbus",
      name: "Christopher Columbus",
      role: "Writing his account at the chart table",
      group: "spanish",
      fallback: "He is already looking past you, at the water.",
      answers: {
        gold: {
          text: "That is the whole matter. I have seen it worn thin at the throat, so there is a source and I will find it. The sovereigns funded one crossing on a promise. They will fund a second on proof.",
          useful: true,
        },
        // Both kept, and both load-bearing: the audit keys an optional observation off each. He is
        // the one speaker who spends both flat slots this way, which is why his fallback fires on
        // trade rather than on something he has an opinion about.
        grows: {
          text: "Cotton, and a root they make bread from. I shall write that the land is fertile and will bear whatever is set in it. That is the part that will be read.",
        },
        decides: {
          text: "They have chiefs, I am told. It has not been a thing I needed to establish.",
        },
      },
    },
    {
      id: "spanish-scribe",
      name: "Spanish scribe",
      role: "Setting down the account for the court",
      group: "spanish",
      fallback: "He waits with the pen up, and writes nothing.",
      answers: {
        gold: {
          text: "I set down what the Admiral says he has seen. Put that one to him.",
        },
        decides: {
          text: "In this account? Castile does. I choose the words, but I choose them for readers who will decide whether there is a second voyage. What will not persuade them does not go in.",
          useful: true,
        },
        trade: {
          text: "Ask the Admiral. He makes the case; I only write it down.",
        },
      },
    },
    {
      id: "spanish-sailor",
      name: "Spanish sailor",
      group: "spanish",
      fallback: "He shrugs and goes back to the boat.",
      answers: {
        gold: { text: "I have seen none of it. I have seen a very great deal of water." },
        decides: { text: "The Admiral decides. That is the beginning and the end of it." },
        trade: {
          text: "We took on water and cassava bread. We gave hawks' bells and glass beads. They seemed pleased, and I could not tell you what they thought they were getting — nor, if I am honest, what we thought we were giving.",
          useful: true,
        },
      },
    },
  ],
  // One account from each of the seven. A single number, and a goal a player can
  // see the end of — see this file's header, and 0052 for why the old pair of
  // numbers was the first thing the playtest tripped over.
  requires: { useful: 7, label: "Islanders' accounts secured" },
  // The island sentence, now that it is content rather than a fact living inside the engine.
  lockedNote:
    "Every person on this island is holding one thing worth writing down. Find the rest before you file.",
  closer: {
    prompt:
      "Your notebook is above, in two panels: what the islanders told you, and what the Spanish party did. Two records of this island will now exist — theirs, and yours. What does the difference between them establish?",
    skillCategory: "Sourcing",
    options: [
      {
        id: "questions",
        text: "That a record holds what its makers thought to ask about",
        correct: true,
        why: "Right, and the two panels are the proof. Nothing was hidden: the gardener answered fully, and so did the child. What the Spanish party is carrying to Castile has no conuco in it, no canoe route, and no cacique — because the questions it was built from never went there. What a record leaves out is usually a record of its own purpose.",
      },
      {
        id: "concealed",
        text: "That the Taíno concealed what they had from the Spanish",
        correct: false,
        why: "Nobody withheld anything. Look again at the islanders' panel — every person answered the question you put to them, and several told you who to ask next. They were asked about gold.",
      },
      {
        id: "unreliable",
        text: "That the Spanish account is unreliable and should be set aside",
        correct: false,
        why: "It is a reliable record of what Spanish sponsors wanted established, which is worth a great deal — the scribe told you as much in his own panel. Discarding it loses that; reading it for purpose keeps it.",
      },
      {
        id: "time",
        text: "That the Spanish had not yet had time to learn about the island",
        correct: false,
        why: "Time was not the constraint. The sailor traded for cassava bread that same week and still could not say what he had been given.",
      },
    ],
  },
};

// ---- M1.B - "Universalis" (ASSEMBLY, waldseemuller-map) ----------------------------------------
//
// The ten-piece jigsaw, kept intact and then extended. The puzzle was already
// the best thing in Case 1.01 and it ended one move too early: you rebuilt the
// sheet and were told what it meant. Now the cartouches are blank, and one of
// the candidates is the word AMERICA, printed on this sheet for the first time
// in history.
//
// The sheet's fragment labels do not render (the board does not set
// `showFragmentLabels`), because a playtest of the labelled version reported
// that the pills read as engraver's jargon and sat on top of the art they were
// meant to help with. They survive as the accessible name of each tile and as
// the vocabulary of the misread list — which on this board names the *slot* the
// piece landed in, since that is the thing glowing red on screen.
//
// The cartouche board `opensAfter` the sheet. Naming three landmasses on a map
// you have not assembled is a guess, and it was being asked as one.
const UNIVERSALIS = {
  kind: "assembly",
  id: "case-001-assembly-universalis",
  title: "Universalis",
  variant: "Reconstruct a Map",
  missionQuestion:
    "What did European geography actually know in 1507, and how can you tell knowledge from inheritance on a single sheet?",
  thinkingMove:
    "Reading a document's physical form. How a thing was made is evidence about what its maker had and did not have.",
  debrief: {
    // No giver on the shore, so the record speaks for itself — missionGiver() falls through to the
    // record plate and the line has to work in that voice.
    line: "The sheet is whole again, and the western coasts still stop where nobody had sailed.",
    established:
      "The map is two kinds of knowledge printed side by side. The east is Ptolemy, inherited and centuries old; the western coasts are new work, drawn from voyages made within the mapmaker's own lifetime, and they end exactly where the reports ended. Reassembled, the sheet shows its own edge of knowledge — which no single fragment could.",
    remains:
      "Why Waldseemüller named the new landmass for Vespucci rather than Columbus. The map states the name; it does not argue for it, and the accompanying text is a separate document making a separate case.",
  },
  openQuestions: [
    "Whether Waldseemüller changed his mind. He dropped the name from his 1513 map without explaining why, and historians have been reading that silence ever since.",
  ],
  codexFiling: {
    summary:
      "Reassembled, the sheet shows its own edge of knowledge: inherited Ptolemy in the east, coasts drawn from living sailors' reports in the west, stopping exactly where the reports stopped.",
    tags: ["Whose account is this", "What the record leaves out", "Written to persuade"],
  },
  historicalRecord: {
    documented: [
      "The 1507 Universalis cosmographia, printed in twelve sheets to be pasted into a wall map roughly 1.3 by 2.4 metres.",
      "It is the first known map to print the name America, applied to the southern landmass.",
      "One assembled copy is known to survive, held by the Library of Congress. The image you reassembled is its scan.",
      "The eastern half follows Ptolemy's inherited geography; the western coasts are drawn from the reports of recent Atlantic voyages.",
    ],
    reconstructed: [
      "The idea that this particular sheet arrived damaged and needed piecing together. The map is real and intact; the puzzle is Chronicle's framing of how you read it.",
    ],
    fiction: [
      "Chronotravel, the Institute, and a record that can be reassembled by a visitor from five centuries later.",
    ],
    debated: [
      "Whether Waldseemüller regretted naming the continent for Vespucci. He removed the name in 1513 and left no statement of why.",
    ],
  },
  intro:
    "Twelve sheets were printed to be pasted into one wall map, and almost none survived that way. Rebuild what is left of this one, then name what it shows — because one of those names had never been printed on any map before.",
  howItWorks: {
    steps: [
      "Click a piece in the tray, then the frame you want it in. Dragging works too.",
      "Read the edges, not the pictures. A straight ruled line is the sheet's outer border; a ragged one is a seam where two copper plates were joined, and a coastline runs straight across it.",
      "Put a piece in the wrong frame and the board tells you what made it look right.",
    ],
    note: "Corners are the cheapest place to start: a piece with a ruled border on two sides has only four possible homes.",
  },
  terms: [
    {
      term: "cartouche",
      definition:
        "The decorated panel a mapmaker prints a name inside. On this sheet three of them were left blank.",
    },
    {
      term: "plate seam",
      definition:
        "The join where two engraved copper plates meet. The sheet was printed in twelve, so the seams are everywhere — and they are not coastlines.",
    },
  ],
  boards: [
    {
      id: "sheet",
      kind: "image",
      label: "The printed sheet",
      note: "Ten fragments of one plate. The outer edge carries a straight border rule; the inner edges are engraver's seams, and they only meet one way.",
      image: "waldseemuller-1507",
      columns: 5,
      rows: 2,
      // The committed scan is 4500x2508. Cutting a 1.794 sheet on a square grid gives ten crops
      // that never line up into a picture, so the board carries the real ratio.
      aspect: 1.794,
      slots: [
        { id: "p1", label: "Upper far left", row: 0, col: 0 },
        { id: "p2", label: "Upper left", row: 0, col: 1 },
        { id: "p3", label: "Upper centre", row: 0, col: 2 },
        { id: "p4", label: "Upper right", row: 0, col: 3 },
        { id: "p5", label: "Upper far right", row: 0, col: 4 },
        { id: "p6", label: "Lower far left", row: 1, col: 0 },
        { id: "p7", label: "Lower left", row: 1, col: 1 },
        { id: "p8", label: "Lower centre", row: 1, col: 2 },
        { id: "p9", label: "Lower right", row: 1, col: 3 },
        { id: "p10", label: "Lower far right", row: 1, col: 4 },
      ],
      fragments: [
        {
          id: "f1",
          label: "Top-left corner",
          belongs: "p1",
          misread:
            "Two straight border rules meeting at a corner can only be a corner of the sheet — and this one's rules run along the top and the left.",
        },
        {
          id: "f2",
          label: "Top edge, second from the left",
          belongs: "p2",
          misread:
            "One ruled edge and no second one, so this is an edge piece rather than a corner. Which edge? The rule is above the engraving.",
        },
        {
          id: "f3",
          label: "Top edge, middle",
          belongs: "p3",
          misread:
            "Ruled border above, plate seam below. A piece with the rule on top belongs on the top row, and this one has open seams on both sides of it.",
        },
        {
          id: "f4",
          label: "Top edge, coastline running off the seam",
          belongs: "p4",
          misread:
            "The line running off this edge is a real shore, not a plate join — follow the ink, not the paper. It has to continue into whatever sits beside it.",
        },
        {
          id: "f5",
          label: "Top-right corner",
          belongs: "p5",
          misread: "Two rules again, and the second one is on the right. That fixes which corner.",
        },
        {
          id: "f6",
          label: "Bottom-left corner",
          belongs: "p6",
          misread:
            "The ruled border is beneath the engraving here, so nothing sits below this piece — and the second rule is on the left.",
        },
        {
          id: "f7",
          label: "Bottom edge, second from the left",
          belongs: "p7",
          misread:
            "Two of these look interchangeable until you notice which way the latitude scale reads.",
        },
        {
          id: "f8",
          label: "Bottom edge, wind head in the margin",
          belongs: "p8",
          misread:
            "The wind heads blow inward from the margin, so a head facing this way belongs at the bottom, not the top.",
        },
        {
          id: "f9",
          label: "Bottom edge, long southern coast",
          belongs: "p9",
          misread:
            "This coast runs almost the full width of the piece, which is why it looks like it could sit anywhere along the lower row. Match where it enters and leaves.",
        },
        {
          id: "f10",
          label: "Bottom-right corner",
          belongs: "p10",
          misread: "The last corner. If three corners are placed, the fourth is not a guess.",
        },
      ],
    },
    {
      id: "cartouches",
      kind: "label",
      label: "The blank cartouches",
      note: "Three panels on the sheet you have just rebuilt were left without a name. Put the word Waldseemüller printed in each — they are all visible on the map above. One of these four words had never appeared on any map before this one.",
      opensAfter: "sheet",
      slots: [
        {
          id: "south",
          label:
            "The long landmass down the western sheets — the one the voyages in your record reached",
        },
        {
          id: "north",
          label:
            "The narrower land above it, drawn thin and hedged because nobody had followed its coast",
        },
        { id: "east", label: "The great landmass filling the eastern sheets, drawn from Ptolemy" },
      ],
      fragments: [
        {
          id: "america",
          label: "AMERICA",
          belongs: "south",
          misread:
            "Waldseemüller printed it here and nowhere else on the sheet — he had named one southern continent, not a hemisphere.",
        },
        {
          id: "terra-incognita",
          label: "TERRA INCOGNITA",
          belongs: "north",
          misread:
            "Latin for unknown land. An unknown coast is drawn thin and hedged, and this is the only part of the sheet drawn that way.",
        },
        {
          id: "india",
          label: "INDIA",
          belongs: "east",
          misread:
            "The eastern sheets are Ptolemy's, barely altered. That is the older knowledge this map kept, and it kept his name for it too.",
        },
        {
          id: "vespucci",
          label: "VESPUCCI",
          belongs: null,
          misread:
            "His account is the reason the southern land is named at all, and his portrait is at the top of this map beside Ptolemy's. But a cartouche takes the name the mapmaker coined, not the man he coined it from.",
        },
      ],
    },
  ],
  closer: {
    prompt:
      "This sheet was printed in 1507. The voyage in your record happened in 1493. What is it evidence of?",
    skillCategory: "Continuity and Change",
    options: [
      {
        id: "knowledge",
        text: "How far European geographic knowledge had moved by 1507",
        correct: true,
        why: "Right. Fourteen years and an ocean separate the voyage from this sheet, and Waldseemüller worked in Saint-Dié from published accounts. It is first-rate evidence of what Europe had concluded — and no evidence at all of what stood on the island in 1493.",
      },
      {
        id: "daily",
        text: "How Taíno communities lived on the islands",
        correct: false,
        why: "There is not one person drawn on it. A map of a coastline is an argument about territory; the people inside the outline are exactly what it does not record.",
      },
      {
        id: "route",
        text: "The route Columbus actually sailed in 1493",
        correct: false,
        why: "No track is drawn and none could be. The mapmaker never crossed the Atlantic and was working from what had been printed in Europe.",
      },
      {
        id: "naming",
        text: "That Columbus named the new lands America",
        correct: false,
        why: "He did not, and he never saw this sheet — he died in 1506, the year before it was printed. The name is Waldseemüller's, taken from Vespucci's account.",
      },
    ],
  },
};

// ---- M1.C - "What Will Be Useful" (DISCREPANCY, columbus-letter) --------------------------------
//
// Named from his own line at the chart table: "I must write what will be useful
// to the sovereigns." That sentence is the answer key to this whole audit, and
// a player who logged his answer about gold is carrying it.
//
// The claims are drawn from the 1493 letter to Rafael Sánchez. The verdicts are
// deliberately not all "contradicted": one claim is straightforwardly true, and
// one cannot be settled either way, because an audit that finds everything
// false teaches a student to distrust documents rather than read them.
//
// The observation column is in two halves. Seven entries key off the seven
// useful answers the interview now *requires*, so an audit reached by the normal
// route is always workable. Three more key off flat answers nobody has to ask
// for — which is what keeps the engine's cause-and-effect real: a thorough
// player audits this letter holding three things a hurried one does not.
const WHAT_WILL_BE_USEFUL = {
  kind: "discrepancy",
  id: "case-001-discrepancy-what-will-be-useful",
  title: "What Will Be Useful",
  variant: "Public Claim vs. What You Observed",
  missionQuestion:
    "What is Columbus's letter good evidence of — the islands it describes, or the voyage it was written to fund?",
  thinkingMove:
    "Sourcing. Asking who made a record, for whom, and to what end, before asking whether it is true.",
  debrief: {
    speaker: "columbus",
    line: "You have your reading and I have mine. Mine is the one that goes to Castile, and mine is the one that gets a second crossing.",
    established:
      "The letter is a reliable record of what its author needed established, and an unreliable record of the island. Every line that fails does so in the same direction — toward a place worth returning to, with people worth setting to work. He told you the reason himself: a first crossing was funded on a promise, and a second will be funded on proof.",
    remains:
      "What the Taíno believed was happening at the taking of possession. The ceremony was held in Castilian in front of people with no way to know what was being claimed, and the record preserves only silence. Silence is not agreement, and nothing here can tell you which it was.",
  },
  openQuestions: [
    "Which surviving version of this letter is closest to what Columbus wrote. It circulated in several printings and translations within a year, and the wording differs between them.",
  ],
  codexFiling: {
    summary:
      "Every line the island fails to bear out fails in the same direction — toward a place worth returning to, with people worth setting to work. The letter is reliable evidence of what its author needed funded.",
    tags: [
      "Whose account is this",
      "Written to persuade",
      "Who pays for the voyage",
      "Who does the work",
    ],
    seeAlso: ["case-001-interview-what-was-asked"],
  },
  historicalRecord: {
    documented: [
      "The 1493 letter reporting on the first voyage, printed and reprinted across Europe within months of his return.",
      "Rafael Sánchez as treasurer to Ferdinand and Isabella — the letter is addressed to the man who handles the money.",
      "The funding of a second, far larger voyage in 1493.",
      "The gold of the Caribbean islands was worn as ornament and traded, not mined at the scale the letter implies.",
    ],
    reconstructed: [
      "Columbus at a chart table on the shore, answering questions. The letter is real; the scene in which you interrogate its author is not.",
      "The Spanish sailor and scribe, and what they tell you about how the account was assembled.",
    ],
    fiction: [
      "Chronotravel, and a Chronicler standing on the beach while the letter is being drafted.",
    ],
    debated: [
      "Whether Columbus believed his own claims about the gold, or knew he was overstating them. The evidence supports the pattern; his private conviction is not recoverable.",
    ],
  },
  intro:
    "The letter goes to Castile whatever you do. What you decide is what the record says it is evidence of — and for each line the island does not bear out, why the two differ.",
  howItWorks: {
    steps: [
      "Read the letter first. All of it — the claims below are lines lifted out of it.",
      "For each line, say what your evidence does to it: supports it, complicates it, contradicts it, or is not enough to settle it. One line is simply true and one you have no way to judge; saying so is part of the work.",
      "Land on contradicted and a second question opens: why does it differ? A man can be mistaken, and a man can be writing for someone.",
    ],
    note: "The right-hand column holds only what you added to your Field Notebook. Where it says you did not gather something, that is a line of this letter you have no way to check.",
  },
  briefing: {
    speaker: "columbus",
    line: "Write what you like. I am writing what will be useful, and mine is the copy that goes to Castile.",
  },
  terms: [
    {
      term: "cacique",
      definition:
        "The person who speaks for a Taíno village — an office, with elders consulted before anything is settled.",
    },
    {
      term: "conuco",
      definition:
        "A Taíno garden of raised earth mounds: yuca in the mound, maize between, sweet potato beneath. Worked ground, not wild ground.",
    },
    {
      term: "their Highnesses / the sovereigns",
      definition:
        "Ferdinand and Isabella of Castile and Aragon, who paid for this voyage and will decide whether there is another.",
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
    label: "Letter Reporting on the First Voyage",
    attribution: "Christopher Columbus to Rafael Sánchez, 1493",
    context:
      "Columbus is at the chart table on the shore you have just walked, writing the account he will carry back across the Atlantic. Rafael Sánchez is treasurer to Ferdinand and Isabella — the man who handles the money. The letter was printed and reprinted across Europe within months of his return, and it is the reason a second voyage was funded. He told you himself what he is doing: he must write what will be useful to the sovereigns.",
    text: [
      "“Hispaniola is a marvel. The lands are most fertile beyond comparison, and will bear whatever is set in them; there are many spices, and great mines of gold and of other metals.",
      "The people of this island, and of all the others I have found, go naked as they were born, and are so ingenuous and free with all they have, that no one would believe it without seeing it. Of anything they possess, if it be asked of them, they never say no; on the contrary, they invite the person to accept it.",
      "They are not slow or unskilled, but of very acute intelligence, and well fitted to be ruled and to be set to work — to sow, to build towns, and to be taught to go clothed and adopt our customs.",
      "In the first island which I found I took possession for their Highnesses, and no one offered any opposition. To it I gave the name San Salvador.”",
    ],
  },
  verdictPrompt:
    "For each line, decide what the evidence you gathered on the island actually does to it.",
  verdicts: [
    { id: "supported", label: "Supported by the evidence" },
    { id: "complicated", label: "Complicated by the evidence" },
    { id: "contradicted", label: "Contradicted by the evidence" },
    { id: "cannot-tell", label: "Not enough evidence" },
  ],
  gapRequiredFor: "contradicted",
  // The labels carry their own meaning now. These used to be "An error" and "A design" with a
  // `note` gloss apiece, and the renderer has never printed a note — two authored sentences that
  // no player could reach. The three additions are the rest of the reasons a record can differ
  // from what you saw, and they are why the second question is no longer a coin flip.
  gapKinds: [
    { id: "error", label: "Mistake" },
    { id: "design", label: "Deliberate framing" },
    { id: "incomplete", label: "Incomplete information" },
    { id: "perspective", label: "Different perspective" },
    { id: "undetermined", label: "Not enough evidence to determine why" },
  ],
  gapPrompt: "Why does the letter differ from what you gathered?",
  lockedNote: "Settle every line of the letter before you file.",
  claims: [
    {
      id: "fertile",
      text: "The lands are most fertile beyond comparison, and will bear whatever is set in them.",
      verdict: "supported",
      gap: null,
      why: "The conuco is the evidence for it — mounded yuca, maize between, batata beneath. He is right. What he does not write is that the fertility he is describing is the result of somebody's work.",
    },
    {
      id: "ingenuous",
      text: "They are so ingenuous and free with all they have, that no one would believe it without seeing it.",
      verdict: "contradicted",
      gap: "error",
      why: "His own sailor describes a trade: bells and glass given, water and cassava bread taken, and no way to say what either side thought it was getting. Reciprocal exchange read as free giving is a misreading, not a fabrication — he did not invent the scene, he misunderstood it.",
    },
    {
      id: "mines",
      text: "There are great mines of gold and of other metals.",
      verdict: "contradicted",
      gap: "design",
      why: "He had seen gold worn thin at the throat and no mine whatever, and he told you why the word is there: one crossing was funded on a promise, and a second has to be funded on proof.",
    },
    {
      id: "governed",
      text: "They are well fitted to be ruled and to be set to work.",
      verdict: "contradicted",
      gap: "design",
      why: "You were told who decides here by the person who is consulted before the cacique speaks. A society with its own leadership is not waiting to be governed — but a report that says it is has already settled what the second voyage is for.",
    },
    {
      id: "possession",
      text: "I took possession for their Highnesses, and no one offered any opposition.",
      verdict: "cannot-tell",
      gap: null,
      why: "Nothing you saw contradicts it, and nothing you saw could confirm what it implies. A ceremony held in Castilian, in front of people with no way to know what was being claimed, records silence. Silence is not agreement, and this record cannot tell you which it was.",
    },
  ],
  observed: [
    {
      id: "anchorage",
      text: "The anchorage is deep and the ships are riding easily in it.",
      requires: null,
    },
    {
      id: "conuco",
      text: "Yuca heaped into mounds, maize between them, batata beneath, ají and cotton at the edges. Worked ground, not wild ground.",
      from: "Taíno gardener",
      requires: "asked:taino-gardener:grows",
    },
    {
      id: "cacique",
      text: "A cacique speaks for the village, and the elder is consulted before he speaks.",
      from: "Taíno community elder",
      requires: "asked:taino-elder:decides",
    },
    {
      id: "canoe",
      text: "Cassava bread carried out to three islands; cotton, news and once a man who stayed carried back.",
      from: "Taíno canoe worker",
      requires: "asked:taino-fisher:trade",
    },
    {
      id: "common",
      text: "Even a child can name the crops and how they are planted. This is ordinary knowledge here, not a secret anybody is keeping.",
      from: "Taíno child",
      requires: "asked:taino-child:grows",
    },
    {
      id: "exchange",
      text: "Hawks' bells and glass given, water and cassava bread taken — and no way to say what either side thought it was getting.",
      from: "Spanish sailor",
      requires: "asked:spanish-sailor:trade",
    },
    {
      id: "proof",
      text: "One crossing was funded on a promise. A second will be funded on proof.",
      from: "Christopher Columbus",
      requires: "asked:columbus:gold",
    },
    {
      id: "court",
      text: "What will not persuade readers in Castile does not go into the account.",
      from: "Spanish scribe",
      requires: "asked:spanish-scribe:decides",
    },
    // The three below key off flat answers nobody is required to ask for. A
    // thorough player carries them into the audit; a hurried one does not, and
    // the column says so.
    {
      id: "fertile-intent",
      text: "He intends to write that the land is fertile and will bear whatever is set in it — and knows that is the part that will be read.",
      from: "Christopher Columbus",
      requires: "asked:columbus:grows",
    },
    {
      id: "chiefs",
      text: "“They have chiefs, I am told. It has not been a thing I needed to establish.”",
      from: "Christopher Columbus",
      requires: "asked:columbus:decides",
    },
    {
      id: "given-away",
      text: "Gold is beaten thin and worn, and given away when giving it away is the right thing to do.",
      from: "Taíno community elder",
      requires: "asked:taino-elder:gold",
    },
  ],
  closer: {
    prompt: "Your reading goes into the record. What should it say this letter is evidence of?",
    skillCategory: "Sourcing",
    options: [
      {
        id: "purpose",
        text: "What Spanish sponsors needed established about these islands",
        correct: true,
        why: "Right. Every gap you marked as design points the same direction, and he gave you the reason himself at the chart table. The letter is excellent evidence — of its own purpose.",
      },
      {
        id: "conditions",
        text: "Conditions in the Caribbean in 1493",
        correct: false,
        why: "It is evidence of some of them, and you marked one line supported. But two of five gaps were choices, and a record that has been shaped for a reader cannot be read straight for the thing it describes.",
      },
      {
        id: "useless",
        text: "Nothing — it is too partial to use",
        correct: false,
        why: "Throwing out a shaped source throws out the shape, and the shape is the part that tells you what its makers wanted. A historian reads it for purpose rather than past it.",
      },
      {
        id: "lying",
        text: "That Columbus deliberately lied about everything he saw",
        correct: false,
        why: "You marked one line supported and one you could not settle either way. A design is not a lie, and collapsing the two loses the distinction this whole audit was for.",
      },
    ],
  },
};

export const UNIT_01_ACTIVITIES = {
  "taino-context": QUESTION_NOBODY_ASKED,
  "waldseemuller-map": UNIVERSALIS,
  "columbus-letter": WHAT_WILL_BE_USEFUL,
};
