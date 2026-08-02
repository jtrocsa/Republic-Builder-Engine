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
// Four questions, seven speakers, twenty-eight answers, and exactly seven of
// them useful — one per person. Everyone on the island knows one thing worth
// having and will not volunteer it, so the mission is finding which question
// reaches which person. That is also the completion bar: `requires.useful: 7`,
// one account from each of the seven, which replaced a "4 questions / 5 people"
// pair a player read as a contradiction rather than as a goal.
//
// The other twenty-one answers are not filler and are not punishments. Each one
// either sends you to the person who does know, or declines in that speaker's
// own voice — because the lesson is that a flat answer is a real answer, and
// that the Spanish account is short for reasons that have nothing to do with
// anybody hiding anything.
//
// The child's line is the hook and it already ships as his standing dialogue
// ("Nobody asks me what grows here, and I could tell them"). Until now nothing
// in the game let a player take him up on it.
const QUESTION_NOBODY_ASKED = {
  kind: "interview",
  id: "case-001-interview-what-was-asked",
  title: "The Question Nobody Asked",
  intro:
    "Four questions, and everyone on this island will answer only the one you actually put to them. What comes back is not a record of the island. It is a record of what you thought to ask.",
  howItWorks: {
    steps: [
      "Walk up to anyone on the island and put any of the four questions to them. There are no wrong people to ask.",
      "Most answers will be short. That is not a dead end — a person who cannot help you will usually tell you who can.",
      "Every one of the seven people here knows one thing worth writing down, and only one question reaches it. Find theirs.",
      "When an answer is worth keeping, press Log this response. Only logged answers go in your notebook.",
      "Come back here whenever you like — the Mission Tracker on the map opens this notebook from anywhere.",
    ],
    note: "What you log is what you will be holding when you audit Columbus's letter at the chart table. A question you never asked is a line of that letter you will have no way to check.",
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
        gold: {
          text: "The yellow metal? We beat it thin and wear it. It is given away when giving it away is the right thing to do. You are not the first to ask that before asking anything else.",
        },
        grows: {
          text: "Ask the woman working the mounds. Her hands are in it; I only say when the planting begins.",
        },
        decides: {
          text: "A cacique — the one who speaks for the village — speaks for this one, and I am consulted before he does. Nothing is settled here until the people who will have to carry it have said their part.",
          useful: true,
        },
        trade: {
          text: "Canoes go out, canoes come back. Ask the man who keeps them; he has been where they go and I have not.",
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
        gold: {
          text: "There is none in this ground. There is cassava in this ground, and that is what we eat when the rains stop.",
        },
        grows: {
          text: "Yuca first — we heap the earth into mounds, a conuco, and it holds through the dry season. Maize between the mounds, batata beneath them, ají and cotton at the edges. None of it arrived here on its own.",
          useful: true,
        },
        decides: {
          text: "For the planting, I do. For the village, the cacique — and the elder before him. Put that one to her.",
        },
        trade: {
          text: "Cotton, mostly. It leaves in bales and comes back as something else, and the canoes are not mine. Ask the man who keeps them.",
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
        gold: {
          text: "Not in the water. Ask the men who came in the boats — it is the only thing they say.",
        },
        grows: {
          text: "On the water? Nothing. Fish, turtle, conch — those are taken, not grown. The growing is up in the mounds; ask the woman working them.",
        },
        decides: {
          text: "The sea decides more than any man does. After that, the cacique, and the elder speaks to him first.",
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
          text: "The grown ones. And my grandmother, mostly — she is over there and she will tell you properly.",
        },
        trade: {
          text: "I am not old enough to go out in the big canoe yet. He is — the one working on the hull.",
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
        grows: {
          text: "Cotton, and a root they make their bread from, and trees I have no name for. I shall write that the land is fertile and will bear whatever is set in it. That much is true, and it is the part that will be read.",
        },
        decides: {
          text: "They have chiefs, I am told. It has not been a thing I needed to establish.",
        },
        trade: {
          text: "Among themselves, in canoes. It is not trade as a merchant would understand the word, and I have not enquired further.",
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
          text: "I set down what the Admiral tells me he has seen. I have not seen it myself. Put that one to him.",
        },
        grows: {
          text: "Cotton I can name and price. The rest goes down as fruits of many kinds — a court does not read further than that.",
        },
        decides: {
          text: "In this account? Castile does. I choose the words, but I choose them for readers who will decide whether there is a second voyage. What will not persuade them does not go in.",
          useful: true,
        },
        trade: {
          text: "Ask the Admiral. He is the one making the case, and I only write it down.",
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
        grows: {
          text: "Enough to eat, which is more than we had at sea. What it is and how it got there I could not tell you.",
        },
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
  intro:
    "Twelve sheets were printed to be pasted into one wall map, and almost none survived that way. Rebuild what is left of this one, then name what it shows — because one of those names had never been printed on any map before.",
  howItWorks: {
    steps: [
      "Click a piece in the tray, then click the frame you want it in. You can drag instead if you prefer.",
      "Read the edges, not the pictures. A straight ruled line is the outer border of the printed sheet, so it can only sit on the outside.",
      "A ragged edge is a plate seam, where two copper plates were joined. Coastlines run straight across a seam, so a shore that continues is two pieces that belong side by side.",
      "Corners first — a piece with a ruled border on two sides has only four possible homes, and each one is different.",
      "Put a piece in the wrong frame and the board will tell you what made it look right. That is worth more than getting it first time.",
    ],
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
  intro:
    "The letter goes to Castile whatever you do. What you decide is what the record says it is evidence of — and for each line that does not survive the island, whether it failed by mistake or by choice.",
  howItWorks: {
    steps: [
      "Read the letter first. All of it — the claims below are lines lifted out of it.",
      "For each line, look across at what you gathered on the island, then say whether your own observations support it, contradict it, or cannot settle it either way.",
      "Nothing you saw contradicts every line. One of these is simply true, and one you have no way to judge — saying so is part of the work.",
      "When you land on contradicted, a second question opens: was it an error, or a design? A man can be wrong, and a man can be writing for someone.",
    ],
    note: "The right-hand column holds only what you actually logged in your notebook. Where it says you did not gather something, that is a line of this letter you have no way to check.",
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
    "For each line: does what you gathered on the island support it, contradict it, or leave you unable to tell?",
  verdicts: [
    { id: "supported", label: "Supported" },
    { id: "contradicted", label: "Contradicted" },
    { id: "cannot-tell", label: "Cannot tell" },
  ],
  gapRequiredFor: "contradicted",
  gapKinds: [
    { id: "error", label: "An error", note: "He got it wrong." },
    { id: "design", label: "A design", note: "It is written this way on purpose." },
  ],
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
