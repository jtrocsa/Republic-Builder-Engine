// Case 1.01's three activities, keyed by the source id each one opens from.
//
// These replaced the three hand-written activity screens that used to be welded
// one apiece to these same three sources (village-activity, columbus-activity,
// map-jigsaw). Every field here is content: the engines in
// engine/activities/ know none of it. See docs/decision-log/0051.
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
// main.js's interviewTokens() from the live interview state.

// ---- M1.A - "The Question Nobody Asked" (INTERVIEW, taino-context) ------------------------------
//
// Four questions, seven speakers, twenty-eight answers, and exactly seven of
// them useful — one per person. Everyone on the island knows one thing worth
// having and will not volunteer it, so the mission is finding which question
// reaches which person.
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
  briefing: {
    speaker: "taino-child",
    line: "My grandmother says the strangers ask the same question over and over — where the gold is. Nobody asks me what grows here, and I could tell them.",
  },
  questions: [
    { id: "gold", label: "Where is the gold?" },
    { id: "grows", label: "What grows here?" },
    { id: "decides", label: "Who decides here?" },
    { id: "trade", label: "What do you trade, and with whom?" },
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
          text: "A cacique speaks for this village, and I am consulted before he speaks. Nothing is settled here until the people who will have to carry it have said their part.",
          useful: true,
        },
        trade: {
          text: "Canoes go out, canoes come back. What returns is not always goods. Sometimes it is a marriage, sometimes a warning.",
        },
      },
    },
    {
      id: "taino-gardener",
      name: "Taíno gardener",
      role: "Works the conuco",
      group: "taino",
      fallback: "She turns back to the row she was working.",
      answers: {
        gold: {
          text: "There is none in this ground. There is cassava in this ground, and that is what we eat when the rains stop.",
        },
        grows: {
          text: "Yuca first — we heap the earth into mounds and it holds through the dry season. Maize between the mounds, batata beneath them, ají and cotton at the edges. None of it arrived here on its own.",
          useful: true,
        },
        decides: {
          text: "For the planting, I do. For the village, the cacique — and the elder before him.",
        },
        trade: { text: "Cotton, mostly. It leaves in bales and comes back as something else." },
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
          text: "Not in the water. Ask the men who came in the boats. It is the only thing they say.",
        },
        grows: { text: "On the water? Nothing. Fish, turtle, conch — those are taken, not grown." },
        decides: { text: "The sea decides more than any man does. After that, the cacique." },
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
        decides: { text: "The grown ones. And my grandmother, mostly." },
        trade: { text: "I am not old enough to go out in the big canoe yet." },
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
          text: "Among themselves, in canoes. It is not trade as a merchant would understand the word.",
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
        gold: { text: "I set down what he tells me he has seen. I have not seen it myself." },
        grows: {
          text: "Cotton I can name and price. The rest goes down as fruits of many kinds — a court does not read further than that.",
        },
        decides: {
          text: "In this account? Castile does. I choose the words, but I choose them for readers who will decide whether there is a second voyage. What will not persuade them does not go in.",
          useful: true,
        },
        trade: { text: "Ask the Admiral. He is the one making the case." },
      },
    },
    {
      id: "spanish-sailor",
      name: "Spanish sailor",
      group: "spanish",
      fallback: "He shrugs and goes back to the boat.",
      answers: {
        gold: { text: "I have seen none of it. I have seen a very great deal of water." },
        grows: { text: "Enough to eat, which is more than we had at sea." },
        decides: { text: "The Admiral decides. That is the beginning and the end of it." },
        trade: {
          text: "We took on water and cassava bread. We gave hawks' bells and glass beads. They seemed pleased, and I could not tell you what they thought they were getting.",
        },
      },
    },
  ],
  // Four questions used, five of the seven people asked. Reachable in five
  // well-chosen conversations and rewarding of more.
  requires: { questions: 4, speakers: 5 },
  closer: {
    prompt:
      "Two records of this island will now exist: the one the Spanish account carries to Castile, and the one you have just put together. What does the difference between them actually establish?",
    skillCategory: "Sourcing",
    options: [
      {
        id: "questions",
        text: "That a record holds what its makers thought to ask about",
        correct: true,
        why: "Right. Nothing was hidden. The gardener answered fully, and so did the child. The questions the Spanish account was built from simply never reached the conuco, the canoe route, or the cacique — and what a record leaves out is usually a record of its own purpose.",
      },
      {
        id: "concealed",
        text: "That the Taíno concealed what they had from the Spanish",
        correct: false,
        why: "Nobody withheld anything. Every person you asked answered the question you put to them. They were asked about gold.",
      },
      {
        id: "unreliable",
        text: "That the Spanish account is unreliable and should be set aside",
        correct: false,
        why: "It is a reliable record of what Spanish sponsors wanted established, which is worth a great deal. Discarding it loses that; reading it for purpose keeps it.",
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
// The image board's misreads are about reading a printed sheet — border rules,
// engraver's seams, plate joins — because those are transferable to any visual
// source, and because the tiles of a scan cannot be described by their contents
// without claiming more about the crop than is true.
const UNIVERSALIS = {
  kind: "assembly",
  id: "case-001-assembly-universalis",
  title: "Universalis",
  intro:
    "Twelve sheets were printed to be pasted into one wall map, and almost none survived that way. Rebuild what is left of this one, then read the cartouches — because the name on it is the reason anyone kept it.",
  boards: [
    {
      id: "sheet",
      kind: "image",
      label: "The printed sheet",
      note: "The outer edge carries a straight border rule. The inner edges are engraver's seams, and they only meet one way.",
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
          label: "Border on two sides",
          belongs: "p1",
          misread:
            "Two straight border rules meeting at a corner can only be a corner of the sheet.",
        },
        {
          id: "f2",
          label: "Border above",
          belongs: "p2",
          misread: "The rule runs along one edge only, so this is an edge piece, not a corner.",
        },
        {
          id: "f3",
          label: "Border above, seam below",
          belongs: "p3",
          misread: "A straight rule and a seam on opposite edges puts this on the top row.",
        },
        {
          id: "f4",
          label: "Border above, cut coastline",
          belongs: "p4",
          misread:
            "The coastline running off this edge is a real shore, not a plate join — follow the ink, not the paper.",
        },
        {
          id: "f5",
          label: "Border on two sides, east",
          belongs: "p5",
          misread: "The second rule is on the right, which fixes which corner this is.",
        },
        {
          id: "f6",
          label: "Border below, seam above",
          belongs: "p6",
          misread: "The rule is beneath the engraving here, so nothing sits below this piece.",
        },
        {
          id: "f7",
          label: "Seam above, border below",
          belongs: "p7",
          misread:
            "Two of these look interchangeable until you notice which way the latitude scale reads.",
        },
        {
          id: "f8",
          label: "Wind head, lower margin",
          belongs: "p8",
          misread:
            "The wind heads blow inward from the margin, so a head facing this way belongs at the bottom, not the top.",
        },
        {
          id: "f9",
          label: "Long southern coast",
          belongs: "p9",
          misread:
            "This coast runs for most of the piece, which is why it looks like it could sit anywhere along the lower row.",
        },
        {
          id: "f10",
          label: "Border on two sides, south-east",
          belongs: "p10",
          misread: "The last corner. If three corners are placed, the fourth is not a guess.",
        },
      ],
    },
    {
      id: "cartouches",
      kind: "label",
      label: "The blank cartouches",
      note: "Three cartouches, four candidates. One of these words had never been printed on a map before this sheet.",
      slots: [
        { id: "south", label: "The long landmass on the western sheets" },
        { id: "north", label: "The narrower land above it, drawn uncertainly" },
        { id: "east", label: "The great landmass on the eastern sheets" },
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
            "An unknown land is drawn thin and hedged, and this is the only part of the sheet drawn that way.",
        },
        {
          id: "india",
          label: "INDIA",
          belongs: "east",
          misread:
            "The eastern sheets are Ptolemy's, barely altered. That is the older knowledge this map kept.",
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
// a player who asked him about gold is carrying it.
//
// The claims are drawn from the 1493 letter to Rafael Sánchez. The verdicts are
// deliberately not all "contradicted": one claim is straightforwardly true, and
// one cannot be settled either way, because an audit that finds everything
// false teaches a student to distrust documents rather than read them.
const WHAT_WILL_BE_USEFUL = {
  kind: "discrepancy",
  id: "case-001-discrepancy-what-will-be-useful",
  title: "What Will Be Useful",
  intro:
    "The letter goes to Castile whatever you do. What you decide is what the record says it is evidence of — and for each line that does not survive the island, whether it failed by mistake or by choice.",
  record: {
    label: "Letter Reporting on the First Voyage",
    attribution: "Christopher Columbus to Rafael Sánchez, 1493",
  },
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
