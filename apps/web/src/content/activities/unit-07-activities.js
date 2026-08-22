// Case 7.01's three activities, keyed by the source id each one opens from.
//
// Ellis Island runs slate A — INTERVIEW, ASSEMBLY, DISCREPANCY — which `THE-MAP-PROGRAM.md` §2
// fixed before any of this existed. **It is Unit 1's and Unit 5's slate and deliberately not Unit
// 6's**: the table's own rule is that no unit repeats its neighbour's three, and Cottonwood Junction
// next door is slate C. `unit-07-campaign.js` shipped in Phase 89 saying slate A was
// interview/assembly/trace, which is slate C's line off the same table, and three later documents
// copied it before anybody checked — see decision log `0081` §5. The engine list is only half the
// rule in any case: the right-hand column is the binding half, and this unit's interview asks
// **what the official question fails to ask**. Riverbend asks how one arrangement looks from eight positions inside it,
// Philadelphia what a public position is made of, Richmond what testimony costs when the government
// is writing it down, Cottonwood Junction what entitles a person to be standing here and on whose
// paper. None of those is this one, and the difference is not rhetorical: the other four are asked
// of people the record is thin about. This form is not thin. It has a column for the colour of your
// eyes.
//
// **That is the hard case the register rule has met here**, and unit-07-campaign.js's header states
// it at length: a record that leaves somebody out can be caught by asking who is missing, and a
// record that describes somebody completely, in a vocabulary they did not choose and cannot
// correct, cannot. So the eight people in the interview are not there to supply what the form
// omits. They are there to supply what it gets wrong while filling every column.
//
// **The three records are one procedure seen from three rooms.** A manifest decides what you are
// before anybody looks at you. A staircase decides what you are in six seconds. A closed room
// decides what you are in twenty-two minutes. In each of the three the decision has already been
// made somewhere the record does not reach — in a booking office in Europe, on a printed list, on a
// detention card in another office — and the mission is finding where.
//
// The chain is gated: `port-special-inquiry-minute` requires `port-ship-manifest-page`, and on this
// map that gate is load-bearing twice over. The board reads the manifest's own answers back to the
// person supposed to have given them, so the player has to be holding it — and a DISCREPANCY's
// evidence column is minted from the INTERVIEW's logged answers as `asked:<npc>:<question>` tokens,
// so without the gate the audit's right-hand column could open reading "You did not gather this" all
// the way down. Same shape as Riverbend's letter, Canal Crossroads' time book, Richmond's
// requisition and Cottonwood Junction's receipt, and it decides which mission can be last — which is
// what `arcClose` is authored against: the manifest can never be the ending, so the medical key and
// the minute both carry one.
//
// **Five of the eight interview speakers are outdoors, two are at the registry desks and one is
// behind the second door**, which is the highest interior share in the program and the map stating
// its own shape. `fieldNpcById()` resolves across every surface, so all three are legal for a
// speaker, a briefing and a debrief — see decision log `0071` §4 for the test that was widened to
// allow it in Phase 87.

// What Ellis Island's three records turn out to be about, said once. Same const-rather-than-three-
// copies reason as Units 3, 5 and 6.
const PORT_ARC =
  "Ellis Island's three records are one procedure seen from three rooms, and in none of the three is the decision made. A manifest asks twenty-nine questions and is filled in on the far side of an ocean by a purser copying a booking agent's stubs, so that the same questions can be put again at a desk and the two sets compared — nothing on the sheet has to be true for that to work, it only has to be the same twice. A chalk letter sorts a person in six seconds into a disease, a body, a stage of life or a suspicion, and only the first is a diagnosis; the letters that matter most certify a prediction about the American labour market, and the men they are handed to are not doctors. A hearing runs twenty-two minutes behind a closed door, closes on two statutes that cannot both be satisfied, and is reversed by the one kind of document the government does not issue — and the minute of it is accurate in every line and holds only the answers to twelve questions, which is what anybody consulting it four years later will have instead of the hearing. Everybody in the building is competent and most of them are kind. The instrument decided — in a shipping office in Europe, on a staircase, and in a printed column — and the only evidence that anyone standing here disagreed is what they told you when you asked.";

// ---- M7.A — "Column Thirty" (INTERVIEW, port-ship-manifest-page) ---------------------------------
//
// The sheet has twenty-nine columns and every one of them is filled. The mission is the thirtieth,
// which is not on it and never was.
//
// Eight speakers, four questions, exactly eight useful answers — one per person, which is also the
// bar (0052 §3: one number, not two). Two useful answers per question, so no question is dead. Every
// speaker answers three of four, so everybody has a question that fires their `fallback`.
//
// The cast splits four and four, and the split is the mission: the people whose work is the form,
// and the people the form is about. Both halves are on this island doing their jobs; neither half
// wrote the questions.
const COLUMN_THIRTY = {
  kind: "interview",
  id: "case-019-interview-column-thirty",
  title: "Column Thirty",
  variant: "Ask What the Form Has No Line For",
  missionQuestion:
    "The form has twenty-nine columns and a field for the colour of your eyes — so what is the question it never asks, and who would have to be standing in front of you to answer it?",
  thinkingMove:
    "Reading a document for its silences. A form that leaves somebody out can be caught by asking who is missing; a form that fills every column about somebody, in words they did not choose, cannot — so you go and ask them.",
  briefing: {
    speaker: "port-immigrant-inspector",
    line: "Manifest sheet fourteen, steerage, thirty lines, and I have read twenty-two of them back to their owners since eight o'clock. Take it. You will find nothing wrong with it, and that is not me being defensive — it is the point. The sheet is correct, the one crossing-out is mine and initialled, and every column is filled. What I will tell you is that I did not fill it and neither did the people entered on it, and if you want to know how a line on this page came to say what it says, you will have to leave this desk and go and ask. Start with whoever brought you the ship.",
  },
  debrief: {
    speaker: "port-interpreter",
    line: "You put one question to each of eight people and wrote down what they said. Do you know that is more than this sheet did? Twenty-nine columns, and not one of them takes a sentence.",
    established:
      "Manifest sheet 14 is accurate, and it is not a record of these people. It was written in Europe before the crossing by a purser copying what the line's booking agents entered on ticket stubs, sometimes months earlier — so every answer on it is second-hand before the ship sails, and the person it describes has never seen the page. At the registry desk the same questions are put again and the two sets are compared, which makes the sheet's function consistency rather than truth: an answer that is wrong twice passes and an answer that is right once does not. One column was supplied by nobody aboard at all. Column 9, race or people, is entered by the officer from a Bureau list, and the circular pinned above his desk says in so many words that it is not to be made to agree with the nationality beside it. And every one of the twenty-nine questions takes a yes, a no, a number or a word from a list. All eight people you spoke to had something true to say that would not go in any of them.",
    remains:
      "What was actually said in Europe, and in what language. The interpreter can tell you what happens to a sentence at this desk, because he is standing in the middle of it. Nobody can tell you what a booking agent in Hamburg or Fiume heard, wrote, or invented, because that conversation left no record on either side of the ocean and the stub it was written on went into the line's own files. This sheet is the earliest surviving version of an exchange that had already happened at least twice.",
  },
  openQuestions: [
    "How often the two sets of answers actually disagreed. The Bureau counted the cases it sent to a board, not the discrepancies an inspector resolved at the desk in a minute, so the ordinary working of the consistency check is invisible in the records it generated.",
    "What the classification meant to the people entered under it. Jewish organisations objected within a few years that Hebrew named a religion rather than a race and the Bureau kept the column; what the other forty-odd categories were understood to mean by the people they named is much harder to recover, and mostly is not.",
  ],
  anomaly: {
    noticed:
      "Somebody has been down column seven of this sheet — able to read; able to write — and ruled a short mark against all thirty lines. It is the only column on the page anybody has marked. Nothing hangs on it: in 1907 a man who cannot read is landed like anybody else, and the entry is collected because the Commissioner-General's annual report counts it. At the foot of the sheet, in the same hand, is a percentage, and the figures are ruled the way the altered entry in the Riverbend wharf book was ruled.",
    note: "A clerk tallying literacy for the annual return is the most ordinary thing that could be happening on this page, and it accounts for the marks, for the column and for a figure at the foot. What it does not account for is that the figure is not a total of thirty lines. It is a year's number, for a fiscal year that does not close until the thirtieth of June, computed from returns that have not been made. Nothing here is wrong and nothing here is early by accident: column seven is the one column on this form that costs nobody anything today, and in ten years a reading test will be law and this column will be the whole of the examination. Somebody has gone down the column that will matter later and left the other twenty-eight alone. File the record as it stands and flag the column.",
  },
  codexFiling: {
    summary:
      "A ship's manifest that is accurate in every column and second-hand in every answer — filled in before the crossing, read back at the desk, and correct when it matches rather than when it is true.",
    tags: ["Counting people", "Whose account is this", "What the record leaves out"],
    seeAlso: [
      "case-013-interview-what-the-government-writes-down",
      "case-016-interview-on-whose-paper",
    ],
  },
  historicalRecord: {
    documented: [
      "The manifest form prescribed under the Immigration Act of 3 March 1903, its column list, the steamship line's duty to prepare it and the master's duty to deliver it to the immigration officer at the port of arrival.",
      "That manifests were filled in at the port of embarkation from information the lines' booking agents took, before the voyage — and that the registry-desk examination consisted of putting the same questions again and comparing the answers.",
      "The Bureau of Immigration's separate race-or-people classification: recorded from 1899, printed as a column on the form from 1903, kept distinct from nationality by standing instruction, and given its full published statement in the Dictionary of Races or Peoples issued in 1911 by the immigration commission the 1907 act created.",
      "The division of Italians into North and South as two stocks, alone among European nationalities, and Jewish organisations' objection that Hebrew named a religion rather than a race.",
      "The head tax of two dollars fixed in 1903, and the act of 20 February 1907 raising it with effect from 1 July — signed two months before this day, so the station is working under one statute while making arrangements for the next.",
      "Steamship lines' liability to fines and to returning rejected aliens at their own cost, and the screening at the European ports that followed from it.",
      "17 April 1907 as the busiest day in the station's history — 11,747 arrivals — in the only fiscal year it passed a million.",
    ],
    reconstructed: [
      "Manifest sheet 14 itself, a composite modelled on the printed 1903 form. Its own citation says so, and nobody entered on it is a real individual.",
      "All eight people you spoke to. They are composites drawn from what the records establish about this station in 1907, not individuals anybody named.",
    ],
    fiction: [
      "Chronotravel, the Chronicle Institute, and a Chronicler securing a record on a wharf in New York Harbor in 1907.",
    ],
    debated: [
      "Whether the race-or-people column is best read as an administrative classification that later hardened into policy, or as the racial argument of the period written into the form from the start. The column, the list and the 1911 Dictionary are documented; what the Bureau took itself to be doing in 1899 is argued.",
    ],
  },
  intro:
    "Twenty-nine columns, thirty lines, and a field for the colour of your hair. The sheet is correct. Put four questions to eight people on this island and find the one true thing about each of them that would not go in any column on it.",
  howItWorks: {
    steps: [
      "You may put any of the four questions to any person on this map, indoors or out. Think about what each of them has to do with the sheet before you choose.",
      "Most answers will send you somewhere else. When somebody gives you something worth keeping, press Add to Field Notebook.",
      "Eight people, eight accounts — one each, and no two alike. Then keep three, because three is what your conclusion will have to stand on.",
    ],
    note: "Five are out on the wharf. Two are at the registry desks in the inspection hall. One is behind the second door, in the room where a hearing has just been held.",
  },
  terms: [
    {
      term: "manifest",
      definition:
        "The list of alien passengers a steamship must prepare before sailing and deliver to the immigration officer on arrival. It is written in Europe, from what the line's booking agents were told, and the passengers do not see it.",
    },
    {
      term: "race or people",
      definition:
        "A Bureau of Immigration classification, separate from nationality, entered by the officer from a printed list of some forty categories. Standing instructions say the two columns are not to be made to agree.",
    },
    {
      term: "head tax",
      definition:
        "A charge on every arriving alien, two dollars in 1907, paid by the steamship line and added to the price of the ticket. The act of 20 February 1907 doubles it from the first of July.",
    },
    {
      term: "steerage",
      definition:
        "The cheapest accommodation on a passenger ship, and the only class examined at the station. Cabin passengers were inspected aboard at quarantine and mostly landed at the pier.",
    },
  ],
  questions: [
    { id: "who-spoke", label: "Who gave these answers, and where were they standing?" },
    { id: "not-yours", label: "Which entry here did not come from the person it describes?" },
    { id: "disagree", label: "What happens if what you say today is not what the sheet says?" },
    { id: "no-line", label: "What is true of you that this form has no line for?" },
  ],
  groups: [
    {
      id: "asking",
      label: "People whose work is the form",
      note: "It passes through four pairs of hands — a booking agent's, a purser's, an inspector's and an interpreter's — before the person it describes ever hears a word of it read out. Each of the four can tell you exactly where his own part of it stops.",
    },
    {
      id: "asked",
      label: "People the form is about",
      note: "Four answers the sheet has twenty-nine columns and no room for. Every one of them is true, checkable, and of a kind that will not go in a box.",
    },
  ],
  speakers: [
    {
      id: "port-ships-purser",
      name: "Aldo Mancuso",
      role: "Purser, transatlantic steamer",
      group: "asking",
      fallback:
        "He weighs the sheet against the rail, looks down at the queue below the gate, and lets that one go past him.",
      answers: {
        "who-spoke": {
          text: "I wrote it, and I will tell you exactly how, because the honest answer surprises people. I was not there when the questions were asked. The line's agents ask them — in a booking office, in a village, wherever a ticket is sold, sometimes months before — and what they write goes on the stub. At Fiume a clerk copies the stubs into the manifest book, thirty lines to a sheet, and I sign that it is a true list. That is what my signature covers: that I have copied faithfully. Not one of the thirty ever saw the page and not one of them was asked anything by me. If you want to know where an answer came from, do not ask the man who wrote it down. Ask the man who sold the ticket.",
          useful: true,
          lead: "The answers were taken by a man paid by the ticket, months before the ship sailed. His line has an agent on this wharf.",
        },
        disagree: {
          text: "Then it is the inspector's business and the line's, and I have landed my passengers and am in ballast by Thursday. I do not stay for that part.",
        },
        "no-line": {
          text: "There is a column for the colour of a man's hair. I have never once carried a sheet that asked what he can do.",
        },
      },
    },
    {
      id: "port-steamship-agent",
      name: "Wilhelm Traube",
      role: "Steamship line's shore agent",
      group: "asking",
      fallback:
        "He checks the booth's tally against the boat coming up the slip and does not take the question.",
      answers: {
        disagree: {
          text: "Then somebody pays, and it is not the Bureau. Read the act. If we land an alien who is rejected we take him back at our own cost, and there are fines besides on anything we ought to have caught at the other end. So work out what that makes our interest. It is not that the sheet is true. It is that the sheet and the man agree — because a disagreement at the desk is what sends him to a board, and a board is what sends him back to us. Our agents at the continental ports are instructed accordingly, and I will not pretend to you that the instruction reads find out the facts. It reads do not book what will come back.",
          useful: true,
          lead: "The line is fined for a passenger who is refused, so its agents are told to prevent the disagreement rather than the error. Go and ask somebody who was asked.",
        },
        "who-spoke": {
          text: "Our agents, at the continental ports, from a printed instruction. I keep a copy at the booth — a different piece of paper from this one.",
        },
        "not-yours": {
          text: "Nothing on it comes from me. I meet boats. A sheet is through four hands before it reaches this island, and none of them is mine.",
        },
      },
    },
    {
      id: "port-immigrant-inspector",
      name: "Inspector Harlan Mudge",
      role: "Immigrant inspector, registry desk",
      group: "asking",
      fallback:
        "He squares the sheet against the desk rail and waits for something he is permitted to answer.",
      answers: {
        "not-yours": {
          text: "Column nine, and I am the only person in the whole transaction who could have put it there. Nationality is column eight and that is his — Russia, Austria, whatever passport or want of one he holds. Column nine is race or people, and it comes off a list the Bureau prints. The circular pinned over this desk says in so many words that the two are not to be made to agree, and that where the alien's own account differs from the list, the officer's determination governs. So I look at a man and I write what he is. He is not asked and he is not told. The one time somebody objected to me across this desk I entered what the list says, and I was right to, because the list is what the Commissioner-General counts at the end of the year.",
          useful: true,
          lead: "Column nine comes off a printed list and the officer's determination governs it. The instruction sheet is pinned above the desks — find whoever has to read it aloud.",
        },
        disagree: {
          text: "Then I put it a third way. If it still will not sit, I mark the line and he goes to a board. That is the whole of my discretion.",
        },
        "who-spoke": {
          text: "Not to me. The company took these in Europe. I check them against the man in front of me, which is what a registry desk is.",
        },
      },
    },
    {
      id: "port-interpreter",
      name: "Piotr Wieniawski",
      role: "Bureau interpreter",
      group: "asking",
      fallback: "He is listening to two conversations already and has no room for a third.",
      answers: {
        "no-line": {
          text: "There is no column for what a word meant. Here is today's. A man was asked whether anybody had promised him work, which is column twenty-one, and it takes yes or no. What he said was that his brother has written to say there is work. Those are not the same sentence, and I have to hand the inspector one of them. If I say yes he is a contract labourer and he is excluded. If I say no, and he is asked again upstairs, he has contradicted himself. So I said what he said, at length, and the inspector wrote NO, and both of us were doing our jobs properly. Nothing on that sheet records that the question was hard.",
          useful: true,
          lead: "Between the question and the entry there is a sentence nobody keeps. Somebody in that queue has already worked out what the two answers cost.",
        },
        "not-yours": {
          text: "The column they argue about, and the one above it. I fill in none of it. I stand between the desk and the man.",
        },
        "who-spoke": {
          text: "In fourteen languages, twice over — once in Europe to somebody, and once here to me. I only ever hear the second one.",
        },
      },
    },
    {
      id: "port-steerage-woman",
      name: "Rozalia Bern",
      role: "Steerage passenger",
      group: "asked",
      fallback:
        "She looks toward the gate lane, counts something under her breath, and says nothing.",
      answers: {
        "who-spoke": {
          text: "In the agent's office at Lemberg, and my husband's brother answered most of it, because he had the money and the letter and I had neither. I was in the room. I was asked my age and I gave it. Everything after that — where we would live, who would keep us, whether anybody had offered him work — the brother said, and the clerk wrote, and nobody read it back to me. Nine months ago. I have not seen that paper since, and I am told it is on this island, and that a man will read it to me in a moment, and that if I say something different from what my husband's brother said at Lemberg in July, then that is my difficulty.",
          useful: true,
          lead: "The answers were given nine months ago, mostly by somebody else in the room, and she is about to be tested against them. Go and find the man who signed the sheet.",
        },
        "no-line": {
          text: "Whether I want to be here. It is not a question, and I do not know what I would say if it were.",
        },
        disagree: {
          text: "Then I am wrong, I suppose. That is what everybody in this line has been told to expect, and it is why nobody in it is talking.",
        },
      },
    },
    {
      id: "port-steerage-man",
      name: "Márton Szabó",
      role: "Steerage passenger",
      group: "asked",
      fallback: "He counts the queue ahead of him again and does not look up.",
      answers: {
        disagree: {
          text: "There is a trap in it, and I have had eleven days on a ship to find it. Column twenty-one asks whether I come because anybody promised me work. If I say yes, that is contract labour, and I go back on the ship — it has been unlawful since eighty-five. If I say no, then I have no work and no money to speak of, and that is likely to become a public charge, and I go back on the ship. Both answers are on the same sheet and only one of them can be written in the column. So I will say I am a labourer and that I can find work, and every man in this line will say that same sentence, and the Bureau will write NO in the column and count it.",
          useful: true,
          lead: "Two statutes, one column, and either answer excludes. Somebody in this building has to decide which of the two applies.",
        },
        "who-spoke": {
          text: "A man in a booking office at Kassa, who wrote down what I told him and never repeated it back. I have not seen it since.",
        },
        "not-yours": {
          text: "I could not tell you. I have never held the sheet. Ask the men who have — that is half of this island.",
        },
      },
    },
    {
      id: "port-steerage-elder",
      name: "Jozef Halka",
      role: "Steerage passenger",
      group: "asked",
      fallback: "He shifts the bundle under his arm and has nothing to say to that one.",
      answers: {
        "not-yours": {
          text: "Column twenty-two, and I have had it read to me twice now. Condition of health, mental and physical — GOOD. I am sixty-eight. Nobody has looked at me. A clerk at Hamburg wrote GOOD because a ticket does not sell with anything else in that space, and he never came round the counter to see. In an hour I am to climb a staircase with this bundle on my shoulder, and a doctor at the top of it will watch me do it, and what he sees will be set against a word written by a man who never saw me at all. The next column is deformed or crippled, and it is blank, and that is his opinion too.",
          useful: true,
          lead: "A word about his body, written at Hamburg by a man who never looked at him — and it is about to be checked on a staircase.",
        },
        "no-line": {
          text: "How far I have come, and who is not with me. There is a column for my nearest relative in the country whence I came. He is dead.",
        },
        disagree: {
          text: "Then a young man will explain to me, slowly and very kindly, what I said. I have been travelling three weeks. I will agree with him.",
        },
      },
    },
    {
      id: "port-detained-woman",
      name: "Anna Krajewska",
      role: "Held for a hearing",
      group: "asked",
      fallback: "She keeps her eyes on the table in front of the board and lets the question sit.",
      answers: {
        "no-line": {
          text: "I have said it twice and it is written nowhere. I have been a seamstress since I was twelve, and I have an aunt in Newark, and her address is in my shoe because I was told to keep it safe. Neither of those is a question. What they ask is whether somebody is meeting me, and the true answer is not yes and it is not no — my aunt does not know which ship — and the form takes only the two. So it goes down as no, and no is what makes me likely to become a public charge, and I come back on Thursday. The trade is not asked. The aunt is not asked. Nineteen and travelling alone is not a question either, and it is the whole of it.",
          useful: true,
          lead: "The two things that would settle her case are not questions on the form. Somewhere in this building a decision is being written down that way.",
        },
        "not-yours": {
          text: "LPC. Three letters on a card I have not been shown, and nobody has told me who wrote them.",
        },
        disagree: {
          text: "I said the same thing three times, and the third time a man wrote down a different word. I do not know which word it was.",
        },
      },
    },
  ],
  requires: { useful: 8, label: "Accounts secured" },
  notebook: {
    capacity: 3,
    prompt:
      "Eight accounts, three slots. The five you leave out are not wrong — they are the ones your conclusion will not have to name.",
    emptyNote: "Log an answer worth keeping and it becomes available here.",
  },
  lockedNote:
    "Eight people on this island, and each of them holds one answer to one of these four that nobody else can give. Find the rest before you file.",
  closer: {
    prompt:
      "Your notebook is above, in two panels: people whose work is the form, and people the form is about. Reading what you actually collected — what is manifest sheet 14 a record of?",
    // Contextualization rather than Sourcing, and the discrepancy two records later is why: that one
    // asks what this page can and cannot tell you given who typed it, which is the sourcing move.
    // This one asks what system the sheet came out of — booking agents paid by the ticket, a line
    // fined for a passenger it should not have booked, a Bureau counting stocks at the end of the
    // year — none of which is on the page.
    skillCategory: "Contextualization",
    options: [
      {
        id: "same-twice",
        text: "A set of answers taken somewhere else and checked here for agreement, with one entry that came from nobody aboard",
        correct: true,
        requiresEvidence: ["port-ships-purser:who-spoke", "port-immigrant-inspector:not-yours"],
        unsupportedNote:
          "This is the reading the sheet will bear, and right now you are not carrying it. The purser told you where the answers came from and the inspector told you which entry came from nobody on the ship — those two are the argument. Go back for them, or file a conclusion your notebook can hold up.",
        why: "Right, and the two halves of it came from opposite sides of the transaction. The purser signs only that he has copied faithfully, from stubs a booking agent filled in months earlier, so the sheet is second-hand before the ship sails and the person it describes has never read it. The inspector then puts the same questions again and compares — which makes agreement the test rather than truth, exactly as the shore agent's fines are designed to produce. And column nine is entered by the officer from a printed list, against a standing instruction that it must not agree with the nationality beside it. Twenty-eight columns are a consistency check. One of them is a verdict.",
      },
      {
        id: "who-they-were",
        text: "A record of who these people were when they arrived",
        correct: false,
        why: "Almost nothing on it reached the page from the person it describes. Rozalia Bern's answers were given at Lemberg nine months ago, mostly by her husband's brother, and never read back to her. Jozef Halka's health is certified GOOD by a clerk at Hamburg who never came round the counter. Column nine was supplied by an officer from a list. What the sheet records is what the system needed to have on file about them, which is a different thing — and a much more useful one to have found.",
      },
      {
        id: "line-fraud",
        text: "A form the steamship lines filled in loosely to get their passengers landed",
        correct: false,
        why: "The shore agent showed you why the incentive runs the other way, and he was not being defensive about it. A line that lands a rejected alien takes him back at its own cost and pays fines besides, so its interest is that the sheet and the person agree — which is why its agents are instructed not to book anything that will come back. The screening happens in Europe, before the ticket is sold, and it is thorough. Loose is the one thing this form is not.",
      },
      {
        id: "incomplete",
        text: "An incomplete record that a better set of questions would have fixed",
        correct: false,
        why: "This is the reading that survives contact with the evidence longest, and it is still wrong, which is worth the time it takes to see. Every column on this sheet is filled. Nobody is missing from it. Add a thirtieth column and a thirty-first and the interpreter's problem does not move: he still has to hand the inspector a yes or a no for a sentence that was neither. The failure is not that the form asks too few questions. It is that it only takes answers of a kind a person can be wrong about twice.",
      },
    ],
  },
};

// ---- M7.B — "Six Seconds" (ASSEMBLY, port-medical-inspection-card) -------------------------------
//
// Two label boards. The first sorts five chalk letters by what kind of finding each one actually is
// and turns up two items on the same posted sheet that are not findings at all; the second asks who
// the decision belongs to once the letter is on the coat, and turns up two decisions everybody
// expects to find and nobody in this building makes.
//
// **The sorting is the mission's argument rather than a document**, and `historicalRecord` says so
// in as many words. The service did not group its own alphabet this way. What is documented is the
// alphabet, the staircase, the Class A / Class B split and the statutory wording of the Class B
// standard; what the boards do is hold those against each other until the seam shows.
const SIX_SECONDS = {
  kind: "assembly",
  id: "case-019-assembly-six-seconds",
  title: "Six Seconds",
  variant: "Rebuild the Key",
  missionQuestion:
    "Eighteen chalk letters and one staircase sort several thousand people a day — so how many of the letters are a diagnosis, and who decides the ones that are not?",
  thinkingMove:
    "Taking a single category apart. A list that looks uniform because it is printed in one alphabet is usually several different kinds of judgement wearing one uniform, and sorting it is how you find out which.",
  briefing: {
    speaker: "port-line-surgeon",
    line: "Take the key — it is posted, it is not confidential, and I would rather you had it from me than off the wall. Understand what you are holding. It is not a diagnostic manual. It is a list of letters and where to write them, and half of it names things I could not treat if I had a hospital standing behind me. I am at the head of that flight four hours at a stretch and I mark perhaps two in a hundred. What happens to those two is not decided in this room and mostly not by a doctor. Sort the letters by what kind of finding each one actually is, and then tell me whose decision each part of it is. I have been trying to get an answer to the second one out of Washington since March.",
  },
  debrief: {
    speaker: "port-station-matron",
    line: "You have the letters in order. Now come and sit in the detention room for an afternoon and watch what a letter does to somebody who cannot read it.",
    established:
      "The chalk alphabet is five kinds of finding under one procedure, and only one of the five is a diagnosis. CT names a disease with a cause and a course, and the statute excludes it without anybody in the building deciding anything at all. X names a suspicion the officer has not been able to name, and the key admits it by carrying a stronger version of the same mark. L names a permanent feature of a body that is not an illness. Pg names a condition that will end without treatment. S names a stage of life. Two other things printed on the same sheet are not findings: SI is an instruction addressed to another office, and the staircase is not a mark but the instrument that produces all the rest. And the split carrying the whole procedure is not medical. Class A is a diagnosis the statute acts on; Class B is a prediction about whether somebody can earn a living in the United States, certified by a doctor and decided by three lay inspectors in a side room.",
    remains:
      "What became of the people who were marked. The key records the letters and the classes, the station's statistics record certificates issued and exclusions ordered, and the connection between one mark on one coat and one outcome ran through three offices and mostly does not survive as a chain. A person's inspection card and the minute of their hearing are in different files, and for most arrivals only one of the two exists at all.",
  },
  openQuestions: [
    "Whether the six-second examination was as accurate as its defenders claimed. Officers of the service published on the reliability of line inspection at the time and so did its critics, and both were arguing about a procedure nobody could hold still long enough to test.",
    "How much of a Class B certification was medical judgement and how much was a doctor estimating the American labour market. The 1907 act writes the standard in those words; the surgeons who applied it left almost nothing on record about how they read it.",
  ],
  arcClose: {
    speaker: "port-line-surgeon",
    line: "A sheet, a key and a minute. Eleven years in this service and I have never once seen the three of them laid side by side.",
    established: PORT_ARC,
  },
  codexFiling: {
    summary:
      "A line-inspection key whose eighteen letters turn out to be five different kinds of finding, of which one is a diagnosis — and whose most consequential class is a prediction about the labour market.",
    tags: ["What a paper permits", "Who does the work", "Counting people"],
    seeAlso: ["case-013-assembly-three-sorts-of-men"],
  },
  historicalRecord: {
    documented: [
      "The Public Health and Marine-Hospital Service — the service's name from 1902 to 1912 — and its officers' line inspection of arriving steerage passengers.",
      "The stairway inspection: officers stationed at the head of the flight up from the baggage room, observing each ascent for the heart, the lungs and the gait, and the contemporary description of it as a six-second physical.",
      "The chalk marks written on the right shoulder of the outer garment and their meanings, including CT for trachoma, X for suspected mental defect and a circled X for definite signs of mental disease.",
      "The eversion of the eyelid with a buttonhook, and trachoma as the largest single medical cause of exclusion.",
      "The Class A / Class B distinction: a loathsome or dangerous contagious disease excluding by operation of law with no discretion in the certifying officer, against a mental or physical condition referred to a board of special inquiry which determines the case.",
      "The wording of the Class B standard written into the act of 20 February 1907 — a defect of a nature which may affect the ability of such alien to earn a living.",
      "That a board of special inquiry was three immigrant inspectors, not medical officers.",
    ],
    reconstructed: [
      "The key itself, a composite modelled on the form of line-inspection procedure and the station's chalk code. Its own citation says so.",
      "The grouping of the letters into five kinds of finding. The service did not sort its own alphabet this way; the sorting is this mission's argument rather than a document, and it is offered as one.",
    ],
    fiction: [
      "Chronotravel, the Institute, and a Chronicler holding a posted key in an inspection hall in 1907.",
    ],
    debated: [
      "Whether the medical inspection is best read as public health administration under impossible conditions or as the working machinery of a selection policy. The procedures, the classes and the numbers are documented; what the officers took themselves to be doing is argued from very little.",
    ],
  },
  intro:
    "The staircase is the examination. A surgeon watches several thousand people climb it and writes a letter in chalk on perhaps two in a hundred. Rebuild the key, sort the letters by what kind of finding each one is — and then find out whose decision it is once the letter is on the coat.",
  howItWorks: {
    steps: [
      "Select a piece from the tray, then select the place you think it belongs. Wrong is useful here: every piece tells you why it looked right.",
      "Two pieces on the first board belong nowhere on it. Finding them is part of the board rather than a mistake.",
      "The second board opens once the first is finished, and asks a different question about the same key.",
    ],
    note: "There are eighteen letters on the posted key. Five of them are on the first board, chosen because no two are the same kind of thing.",
  },
  terms: [
    {
      term: "line inspection",
      definition:
        "The examination of arriving steerage passengers as they pass in single file. It is done by observation, at walking pace, without halting anybody, and its instrument is the staircase.",
    },
    {
      term: "Class A",
      definition:
        "A loathsome or dangerous contagious disease. The surgeon certifies it and the statute excludes; no board sits, and the certifying officer exercises no discretion about the result.",
    },
    {
      term: "Class B",
      definition:
        "A mental or physical condition of a nature that may affect the ability to earn a living. The surgeon certifies it and a board of three immigrant inspectors decides the case.",
    },
    {
      term: "trachoma",
      definition:
        "A contagious infection of the eye, then common in parts of Europe and the Levant, and the largest single medical cause of exclusion. Finding it means turning the eyelid, which is what the buttonhook was for.",
    },
  ],
  boards: [
    {
      id: "marks",
      kind: "label",
      label: "One alphabet, five different kinds of finding",
      note: "Five letters off the posted key, and two other things printed on the same sheet. Sort each letter by what kind of finding it actually is — and two of these seven are not findings at all.",
      slots: [
        {
          id: "disease",
          label:
            "A named disease, with a cause and a course. The mark is a diagnosis, and it can be wrong.",
        },
        {
          id: "sign",
          label: "A visible sign standing in for something the officer has not been able to name.",
        },
        {
          id: "body",
          label: "A permanent feature of a body. It is not an illness and it will not change.",
        },
        { id: "passing", label: "A condition that will end on its own, with nobody treating it." },
        { id: "age", label: "A stage of life." },
      ],
      fragments: [
        {
          id: "ct",
          label: "CT — trachoma",
          belongs: "disease",
          misread:
            "It is the one letter on this board that behaves the way people assume the whole key behaves. Trachoma is a specific contagious infection of the eye, it is found by turning the lid, it has a cause and a course, and the certificate a surgeon writes for it is a medical statement another doctor could check and find wrong. It is also the largest single medical cause of exclusion at this station — and the statute does the excluding, which is why the officer who writes it has less discretion than anybody else in the building. Put it anywhere else and you have lost the only thing on this board a doctor is actually for.",
        },
        {
          id: "x",
          label: "X — suspected mental defect",
          belongs: "sign",
          hints: [
            "Read the letter again. What is the word suspected doing in it?",
            "The key carries a second, stronger version of this mark for when the officer is sure. Why would it need one?",
          ],
          misread:
            "Not a diagnosis — a suspicion, and the key says so in the word suspected. It is the only mark on the posted list with a stronger version of itself, X within a circle for definite signs of mental disease, which is the surgeon admitting in the code itself that the plain X is something he has seen and cannot name. A man who is deaf, who does not speak the language the question was put in, who has been eleven days in steerage, or who is simply frightened, all present to a stranger at the top of a staircase in about the same way. The mark records what was observed. It does not record what it was.",
        },
        {
          id: "l",
          label: "L — lameness",
          belongs: "body",
          misread:
            "A limp is not an illness. It is a fact about a leg, it will be the same fact next year, and there is nothing in it for a doctor to treat or cure — which is exactly why it is on the key. The question the mark opens is not a medical one at all: it is whether a man who walks like that can earn a living in the United States, and that question goes to three inspectors in a side room. Reading it as a diagnosis is the misreading the whole key encourages, and the second board is about what follows from it.",
        },
        {
          id: "pg",
          label: "Pg — pregnancy",
          belongs: "passing",
          hints: [
            "Is this something that is wrong with her?",
            "What will be true of her in six months that is not true today?",
          ],
          misread:
            "It is not a disease, not a defect, not permanent and not a stage of life — it is a condition that will end on its own, and the woman it is written on will be in a different condition before the year is out. It is on the key for what it predicts rather than for what it is: a woman about to have a child, with no man's name in the column, is likely to become a public charge in the reading the boards actually used. The chalk says pregnancy. The finding is arithmetic about somebody else's future.",
        },
        {
          id: "s",
          label: "S — senility",
          belongs: "age",
          misread:
            "Old age. Not an illness, not an injury, not a suspicion — a stage of life, marked in chalk on a shoulder, and there is no version of this examination that could find it wrong. Its whole content is a prediction, and the prediction is about the labour market rather than the body: a man of sixty-eight is marked because of what three inspectors will decide he can earn, and the surgeon marking him knows that is what he is doing. This is the letter that makes the second board necessary.",
        },
        {
          id: "si",
          label: "SI — to be held for special inquiry",
          belongs: null,
          hints: [
            "Is this something the surgeon found?",
            "Read what the letters stand for. Who is it addressed to?",
          ],
          misread:
            "It fits nowhere on this board because it is not a finding at all — it is an instruction, written in the same chalk, on the same shoulder, addressed to a different office. That is worth more than the trick of it. Somebody walking the length of this hall with SI on their coat is carrying a message about themselves that they cannot read, to people they have not met, and everyone around them can read it. The key makes no distinction between a diagnosis and a direction, and neither does the coat.",
        },
        {
          id: "stairs",
          label: "The climb from the baggage room, which the key says is itself the examination",
          belongs: null,
          hints: [
            "This is printed on the same posted sheet as the letters. Is it one of them?",
            "The key says aliens are not to be halted upon the stairs. What does that make the staircase?",
          ],
          misread:
            "The most important sentence on the key, and not a mark at all — the climb is itself the examination for the heart, the lungs and the gait, and officers are instructed not to halt anybody upon it. It is the instrument rather than a finding: a heart, a lung and a limp are all easier to see in somebody carrying a bundle up a flight of stairs than in somebody standing still, and the entire six-second procedure is built on that being true. It belongs nowhere on this board because it is what produces everything else on it.",
        },
      ],
    },
    {
      id: "decides",
      kind: "label",
      label: "Once the letter is on the coat, whose decision is it?",
      note: "Three of these five are decisions somebody in this system actually makes. Two are decisions you would expect to find here, and nobody in this building makes either of them.",
      opensAfter: "marks",
      slots: [
        {
          id: "statute",
          label: "Decided by the statute. Nobody here exercises any judgement about the outcome.",
        },
        { id: "surgeon", label: "Decided by the doctor, and by nobody else." },
        { id: "board", label: "Decided by three men who are not doctors." },
      ],
      fragments: [
        {
          id: "class-a",
          label: "Whether a loathsome or dangerous contagious disease excludes",
          belongs: "statute",
          misread:
            "The surgeon certifies the condition and that is the end of his part in it — the key says he exercises no discretion as to the result, and the exclusion follows by operation of law. Reading this as the doctor's decision is the ordinary misreading and it flatters him: the most consequential-looking finding on the key is the one where nobody in the building decides anything. It is also, for exactly that reason, the only class an arrival could argue on medical grounds, because the diagnosis is the whole of it.",
        },
        {
          id: "mark",
          label: "Whether a mark is made at all, and on whom",
          belongs: "surgeon",
          misread:
            "This is the doctor's real power, and it is the one nobody wrote a rule for. Everything downstream — the class, the certificate, the board, the exclusion — begins with an officer at the head of a staircase deciding that this person and not the four behind them is worth a piece of chalk. He marks perhaps two in a hundred, at walking pace, in a hall holding several thousand people, and there is no form anywhere on which that decision is recorded or reviewed. The procedure documents everything after it and nothing at all about it.",
        },
        {
          id: "class-b",
          label: "Whether a certified condition may affect the ability to earn a living",
          belongs: "board",
          hints: [
            "A doctor writes the certificate. Does he decide the case?",
            "Read the class rule to the end. Where does it say the certificate goes?",
          ],
          misread:
            "The certificate is medical and the decision is not. The key says the Class B certificate is referred to a board of special inquiry, which determines the case, and a board is three immigrant inspectors — officers and clerks, not doctors. So the question actually being answered is whether a person with a limp, a goitre or sixty-eight years can earn a living in a country none of the three has ever surveyed for the purpose, and the act of 20 February 1907 writes that standard into the statute in those words. This is the hinge of the whole key: the more discretionary the finding, the further it travels from anybody qualified.",
        },
        {
          id: "treatment",
          label: "Whether the alien is treated for what the mark names",
          belongs: null,
          hints: [
            "Go through the key again and look for treatment.",
            "The station had a hospital. Does this key mention it once?",
          ],
          misread:
            "Nothing on this key contemplates treating anybody, which is easy to miss because a doctor is doing the examining. Line inspection is a sorting procedure: it produces marks, certificates and classes, and every one of them describes what will be done about the person rather than about the condition. The station did have a hospital and people were treated in it, sometimes for months — but that happened under a different authority, on a different form, after this key had finished with them. It belongs nowhere here because it is nowhere here.",
        },
        {
          id: "appeal",
          label: "Whether an excluded alien may appeal",
          belongs: null,
          misread:
            "Real, and not on this key. An excluded alien could appeal to the Secretary of Commerce and Labor, the department the Bureau then sat in, and counsel was admitted on the appeal though never at the hearing. None of that is a medical question and none of it is decided in this hall. It is on the board because it is what people reach for when they want to believe there was a check on the chalk — and finding out where the check actually lives, three offices away, on paper somebody has to know how to file, is worth the wrong placement.",
        },
      ],
    },
  ],
  closer: {
    prompt:
      "The key is rebuilt and the decisions are placed. Your reading goes into the record — what is this line-inspection key evidence of?",
    skillCategory: "Comparison",
    options: [
      {
        id: "one-chalk",
        text: "One piece of chalk doing two different jobs — naming a disease in some cases, and predicting a person's earnings in others",
        correct: true,
        why: "Right, and the board is what makes it visible. CT is a diagnosis: a specific infection, found by turning a lid, excluded by the statute without anybody deciding anything. S and L and Pg are not diagnoses at all — a stage of life, a permanent fact about a leg, a condition that will end by itself — and what each of them actually opens is a question about whether this person can earn a living in the United States. The key gives both kinds the same alphabet, the same shoulder and the same six seconds, and then hands the second kind to three men who are not doctors. The act of 20 February 1907 writes that standard into law in so many words, two months before this day.",
      },
      {
        id: "cruelty",
        text: "A procedure designed to humiliate the people it examined",
        correct: false,
        why: "You can build that out of the chalk alone and it will not survive the rest of the key. A letter written on a coat that everybody around you can read and you cannot is genuinely a humiliation, and the officers knew it. But the instrument is a staircase because a staircase shows a heart and a lung; the eyelid rule is there because trachoma is found no other way; the cleaning instruction is there because somebody worked out what happens without it. This is a procedure built for speed against a million arrivals a year, and what it does to people is a consequence of that — which is harder to argue with than cruelty, and much harder to fix.",
      },
      {
        id: "crude",
        text: "An examination too fast to be worth anything",
        correct: false,
        why: "Six seconds is genuinely six seconds, and the finding is not that it caught nothing. The climb is chosen because it reveals what can be revealed at walking pace, the eyelid is everted in every case where the eye is marked, and trachoma — the largest single medical cause of exclusion — is a real diagnosis found by a real procedure. The examination is about as good as an examination that fast can be. What you found is not on the medical side at all: the same six seconds also produces S, and L, and Pg, and those are not medical findings however long anybody looks.",
      },
      {
        id: "public-health",
        text: "A public health measure that kept contagious disease out of American cities",
        correct: false,
        why: "It is the defence the service itself made, and it is true of exactly one slot on your first board. Class A is public health: a named contagious disease, excluded by statute, no discretion anywhere. Everything else you sorted — a limp, a pregnancy, an age, a suspicion the officer could not name — is Class B, which is not a public health finding and was never claimed as one. Read the standard again: a condition of such a nature as may affect the ability of the alien to earn a living. That is a labour-market question wearing a doctor's certificate, and it is where most of the discretion in this building lived.",
      },
    ],
  },
};

// ---- M7.C — "In Answer to a Question" (DISCREPANCY, port-special-inquiry-minute) ----------------
//
// The last mission of the case, and the content decides that rather than the authoring: the minute
// carries `requiresSourceId: "port-ship-manifest-page"`, the only cross-surface lock in the game, so
// it cannot be opened until the manifest the INTERVIEW is built on has been secured next door.
//
// **That gate does more work here than anywhere else it has been used.** A DISCREPANCY's evidence
// column is minted from the interview's *logged* answers as `asked:<npc>:<question>` tokens, so an
// audit built on an interview the player has not done is a right-hand column reading "You did not
// gather this" all the way down. Canal Crossroads is the map that has to live without it — no
// interview on that map, so every observation there is `requires: null` and held to a stricter
// standard instead. Here the lock guarantees the column is full, and every one of the eight
// observations hangs off a *useful* answer, which `requires.useful: 8` makes unavoidable.
//
// The finding is the clerk's own account of his job, tested. He says it standing in the room: he
// types what is said in answer to a question, and a woman who explains something nobody asked about
// has no place on the form. Five of the six lines hold up against everything eight people told you.
// The sixth is the board's opening move — establishing that she is the person entered upon line 11 —
// and it is contradicted outright, because being that person and having given those answers are two
// different things and no question on the board's list would ever have surfaced the difference.
const IN_ANSWER_TO_A_QUESTION = {
  kind: "discrepancy",
  id: "case-019-discrepancy-in-answer-to-a-question",
  title: "In Answer to a Question",
  variant: "One Minute Against Eight Accounts",
  missionQuestion:
    "Nothing in this minute is false, and in four years it will be the only account of the hearing anybody can consult — so what can a record of answers to twelve questions not hold?",
  thinkingMove:
    "Auditing a record against its own conditions of production. The question is not whether the clerk was honest — he was — but what a form of this shape is incapable of carrying, and which of the things it cannot carry decided the case.",
  briefing: {
    speaker: "port-board-clerk",
    line: "You may have the minute; the board has risen. Read it the way I have to type it, one answer at a time, and hold it against whatever you got out of people downstairs — because I will tell you now that I typed every word of this correctly and I do not think that is the end of it. Twelve questions, a decision two to one, a reversal, twenty-two minutes. In four years, if she appeals, or a lawyer writes to Washington, this page is the hearing. It is the only thing that will still exist. So go through it line by line and tell me which lines your evidence holds up, which ones it complicates, and why. I have wanted somebody to do that to one of these for eleven years.",
  },
  debrief: {
    speaker: "port-detained-woman",
    line: "You read her page against what eight people told you. Nobody is going to do that with mine.",
    established:
      "The minute is accurate line by line and it is not a record of the hearing. Only one of its six statements is contradicted by anything you gathered, and two are supported outright: the session really was closed and required to be, and the medical certificate really was called for and really was absent. Three more are true as far as they go and complicated by where they came from — a detention decided downstairs, a column that takes two values when the answer was a third, and a form of words that files the husband's bank book under the board's own initiative. What the audit finds is what a minute of this shape is — a transcript of answers to questions, typed by a clerk whose own account of the job is that anything said outside a question has nowhere to go on the form. Its opening move establishes that she is the person entered upon line 11 and then proceeds as though that settled whose answers those are, which is the one thing it does not settle: the purser signs only that he copied faithfully from a booking agent's stubs, and Rozalia Bern was in the room at Lemberg while somebody else answered for her. The hearing compared her answers today against answers she never gave, and no question on the board's list would have surfaced that.",
    remains:
      "What was said in that room outside a question. By the clerk's own description it is not on the page and was never anywhere else, so it is not recoverable from this document or from any other — there is no second copy, no stenographic record and no witness who was permitted to be present. The same is true of every hearing these boards held. What survives of the discretion is the outcome, and what survives of the reasoning is whatever fitted into an answer.",
  },
  openQuestions: [
    "How representative this hearing is. Roughly one arrival in five was detained and about two in a hundred finally excluded, so most of what the boards did was admit people — but minutes survive unevenly, the ones historians quote are often the ones somebody appealed, and a routine admission leaves the thinnest paper of all.",
    "What the appeal to the Secretary of Commerce and Labor was worth in practice. Counsel was admitted on appeal though not at the hearing, which sounds like a real check; how many arrivals knew of it, could reach a lawyer, or could afford the delay is a different question and largely an unanswered one.",
  ],
  arcClose: {
    speaker: "port-board-clerk",
    line: "A sheet, a key and a minute — and I type the third one out of the answers to twelve questions, in about eleven minutes, and I am good at my job.",
    established: PORT_ARC,
  },
  codexFiling: {
    summary:
      "A board's minute that is accurate in every line and is not a record of the hearing: it holds the answers to twelve questions, and the two things that would have settled the case were not among them.",
    tags: ["Who is permitted to speak", "What the record leaves out", "What a paper permits"],
    seeAlso: [
      "case-013-discrepancy-two-hundred-and-fifty-dollars",
      "case-016-trace-where-the-line-is",
    ],
  },
  historicalRecord: {
    documented: [
      "Boards of special inquiry: three immigrant inspectors sitting separate and apart from the public, deciding by majority, and working through large numbers of cases in a day.",
      "The exclusion of counsel from the hearing itself and its admission on an appeal to the Secretary of Commerce and Labor, the department the Bureau of Immigration then sat in.",
      "The likely-to-become-a-public-charge ground under the general immigration acts, and its use as the most elastic and most-used ground of exclusion in the period.",
      "The alien contract labour act of 1885 and its prohibition on prearranged employment, and the resulting bind for an arrival asked whether work is waiting.",
      "That roughly one arrival in five was detained for some reason and about two in a hundred finally excluded, so the boards' work was mostly admission.",
      "A board's power to reopen a case on its own motion, and the practice of relatives appearing with evidence of support.",
      "That the manifest was prepared by the steamship company at the port of embarkation and used at the registry desk as the standard against which an arrival's answers were checked.",
    ],
    reconstructed: [
      "The minute itself, a composite modelled on the form of board of special inquiry minutes. Its own citation says so, and no person in it is a real individual.",
      "The clerk's account of what does and does not go on the form. Boards kept minutes in question-and-answer form and the constraint follows from that, but no clerk left a statement of it in these words.",
    ],
    fiction: [
      "Chronotravel, the Institute, and a Chronicler auditing a board's minute in a closed hearing room in 1907.",
    ],
    debated: [
      "Whether the boards are best read as a rough but real hearing that admitted most of the people who came before them, or as a procedure whose outcomes turned on an arrival's resources and connections rather than on the evidence. Both readings are built from the same minutes.",
    ],
  },
  intro:
    "Twelve questions, a decision, a reversal, twenty-two minutes — and in four years this page will be the hearing. Read the whole minute, then take it line by line against the eight accounts you gathered at the manifest.",
  howItWorks: {
    steps: [
      "Read the minute first. All of it — the lines below are lifted straight off it.",
      "For each line, say what your evidence does to it: supports it, complicates it, contradicts it, or is not enough to settle it. Two of these your evidence backs outright, and only one of the six is contradicted.",
      "Land on complicated or contradicted and a second question opens: why does it differ? A line can be true, correctly typed, and still describe the wrong thing.",
    ],
    note: "The right-hand column holds only what you added to your Field Notebook at the manifest. Where it says you did not gather something, that is a line of this minute you have no way to read.",
  },
  terms: [
    {
      term: "board of special inquiry",
      definition:
        "Three immigrant inspectors sitting in closed session to decide a detained arrival's case by majority. No lawyer at the hearing; counsel only on an appeal to the Secretary of Commerce and Labor.",
    },
    {
      term: "likely to become a public charge",
      definition:
        "A ground of exclusion meaning the person is expected to end up dependent on public support. It has no fixed test, which is why it was the most-used ground of the period.",
    },
    {
      term: "contract labour",
      definition:
        "Employment arranged before arrival, unlawful since 1885. So an arrival who says work is waiting is excluded for having it, and may be excluded for having none.",
    },
    {
      term: "on its own motion",
      definition:
        "A board reopening a case with nobody having appealed or applied — the board acting unprompted. It is the form of words the minute uses, and it is entirely within the board's discretion, which cuts both ways: nothing obliges it to.",
    },
  ],
  record: {
    label: "Minute of a Hearing, Board No. 2",
    attribution: "The clerk of the board; three immigrant inspectors sitting",
    context:
      "One typed sheet from a closed room off the registry floor, on the busiest day this station ever had. A board of special inquiry is three immigrant inspectors — officers and clerks, not lawyers and not doctors — deciding by majority, working through perhaps fifty or a hundred cases in a day, with an interpreter present and no counsel admitted. The alien before them was detained at a registry desk downstairs and sent up on a card. The clerk types in question-and-answer form, which means the page holds what was said in answer to a question and nothing that anybody volunteered outside one. It is the only account of the proceeding that exists.",
    text: [
      "BOARD OF SPECIAL INQUIRY NO. 2. — Present: three inspectors, and the interpreter. The hearing is held separate and apart from the public. Alien held as likely to become a public charge.",
      "— Q. You are the person entered upon line 11 of manifest sheet 14? — A. Yes. — Q. The manifest says you have eleven dollars. Is that all the money you have? — A. Yes. — Q. Who is going to support you? — A. My husband. He is here three years. He works. — Q. Has he sent you anything? — A. He sent the ticket. — Q. Have you a promise of employment? — A. I can sew. I sewed at home.",
      "— INSPECTOR: Let it be noted that the alien states she is able to work. The manifest, column 21, is answered NO as to any offer or promise of employment. If she has an offer she is excluded under the contract labour provision; if she has none, and eleven dollars, she is likely to become a public charge. — Q. Do you have an offer of work in America? — A. I did not say an offer. I said I can sew. — The certificate of the medical officer is called for: none.",
      "— The board deliberates. Decision, two to one: EXCLUDED, likely to become a public charge; and the alien is informed of her right of appeal to the Secretary of Commerce and Labor. — Later, same day. The husband appearing at the bar of the board and producing a bank book and a statement from his employer, the board on its own motion reopens and reverses. ADMITTED. Total time of both hearings, twenty-two minutes.",
    ],
  },
  verdicts: [
    { id: "supported", label: "Supported by what you gathered" },
    { id: "complicated", label: "Complicated by what you gathered" },
    { id: "contradicted", label: "Contradicted by what you gathered" },
    { id: "cannot-tell", label: "Not enough to say" },
  ],
  verdictPrompt:
    "For each line of the minute, decide what the eight accounts you gathered at the manifest actually do to it.",
  gapRequiredFor: ["contradicted", "complicated"],
  gapPrompt: "Why does the minute differ from what you gathered?",
  gapKinds: [
    { id: "no-question", label: "Nobody asked, so it was never said" },
    { id: "no-field", label: "The form had no line that could hold it" },
    { id: "elsewhere", label: "It happened where this clerk was not" },
    { id: "formula", label: "A correct form of words describing the wrong thing" },
    { id: "undetermined", label: "Not enough evidence to determine why" },
  ],
  claims: [
    {
      id: "line-11",
      text: "— Q. You are the person entered upon line 11 of manifest sheet 14? — A. Yes.",
      verdict: "contradicted",
      gap: "no-question",
      why: "She is that person, and the answers on that line are not hers — which is the whole hearing, because everything after this question tests her against them. The purser signs one thing only: that he copied the sheet faithfully from stubs a booking agent filled in, in Europe, sometimes months before the crossing. Rozalia Bern told you what that looks like from inside the booking office — she answered her age, her husband's brother answered the rest, the clerk wrote, and nobody read it back. So the board establishes identity and then proceeds as though identity settled authorship. There is no question on its list that would ever have surfaced the difference, and by the clerk's own account there is nowhere on the form for it if she had said so unprompted.",
    },
    {
      id: "held",
      text: "Alien held as likely to become a public charge.",
      verdict: "complicated",
      gap: "elsewhere",
      why: "True, and this is the wrong document to learn it from. Nobody at a registry desk can exclude anybody — an inspector there has the power to refer and nothing more — so the finding was made downstairs and written on a card that travels with the person rather than with the case. This heading carries no name, no hour, no card number and nobody's signature, and the board has to send for a medical certificate later precisely because it does not know what is behind the referral. You know a detention happened because she is standing in the room. Where it was decided, by whom, and on what is not on this page and was never going to be: the clerk types what is said in this room, and it was not said in this room.",
    },
    {
      id: "column-21",
      text: "The manifest, column 21, is answered NO as to any offer or promise of employment.",
      verdict: "complicated",
      gap: "no-field",
      why: "The entry is accurate and the answer it records is not a fact about anybody. Piotr Wieniawski described the mechanism to you standing at the desk: a man says his brother has written to say there is work, which is neither yes nor no, and the interpreter has to hand the inspector one of the two words the column takes. Márton Szabó had worked out the rest of it on the ship — an offer makes him a contract labourer under the act of 1885, no offer with no money makes him likely to become a public charge, and both grounds read off the same line. The column has two values. The true answer to it was a third, and nothing on this page or that one records that the question was hard.",
    },
    {
      id: "certificate",
      text: "The certificate of the medical officer is called for: none.",
      verdict: "supported",
      why: "Five words, and they rule out an entire floor of this building. A Class B certificate is the commonest thing to find in a public-charge file — a limp, a goitre, sixty-eight years, any of the findings you sorted off the surgeons' key — so the board sends for one as a matter of routine. There was not one. She reached that room on a sum of money and a question with no safe answer, with no doctor involved at any point, and the minute says so plainly. Marking it supported is not a formality: it is the line that stops you importing the inspection hall into a case that never touched it.",
    },
    {
      id: "separate",
      text: "The hearing is held separate and apart from the public.",
      verdict: "supported",
      why: "Exactly right, and it is the procedure rather than a courtesy. Three immigrant inspectors, closed session, decision by majority, an interpreter present and no counsel admitted — a lawyer is permitted only on an appeal to the Secretary of Commerce and Labor, which is a different building in a different city. Everything else on this board follows from that one line being true. A proceeding nobody was allowed to watch is knowable only from the account the proceeding made of itself, and the account is this page.",
    },
    {
      id: "own-motion",
      text: "The board on its own motion reopens and reverses. ADMITTED.",
      verdict: "complicated",
      gap: "formula",
      why: "The words are the correct form and they describe the wrong cause. On its own motion means nobody appealed and nobody applied — the board acted unprompted — and the clause immediately before it says what actually prompted them: the husband appearing at the bar of the board with a bank book and a statement from his employer. Both are on the page, which is the clerk being scrupulous. But the formula is what a reader four years from now carries away, and what it says is that a board reconsidered on its own initiative. What happened is that a man knew the hearing was on, was in New York, could leave work at eleven on a Wednesday, and held two documents no office in this building issues. Nothing about her had changed.",
    },
  ],
  observed: [
    {
      id: "purser",
      text: "“That is what my signature covers: that I have copied faithfully. Not one of the thirty ever saw the page and not one of them was asked anything by me.”",
      from: "Aldo Mancuso, steamship purser",
      requires: "asked:port-ships-purser:who-spoke",
    },
    {
      id: "lemberg",
      text: "“I was asked my age and I gave it. Everything after that, the brother said, and the clerk wrote, and nobody read it back to me.”",
      from: "Rozalia Bern, steerage passenger",
      requires: "asked:port-steerage-woman:who-spoke",
    },
    {
      id: "column-nine",
      text: "“The circular says the two are not to be made to agree, and that where the alien's own account differs from the list, the officer's determination governs.”",
      from: "Inspector Harlan Mudge, registry desk",
      requires: "asked:port-immigrant-inspector:not-yours",
    },
    {
      id: "interpreter",
      text: "“Those are not the same sentence, and I have to hand the inspector one of them. Nothing on that sheet records that the question was hard.”",
      from: "Piotr Wieniawski, Bureau interpreter",
      requires: "asked:port-interpreter:no-line",
    },
    {
      id: "trap",
      text: "“If I say yes, that is contract labour. If I say no, that is likely to become a public charge. Both answers are on the same sheet.”",
      from: "Márton Szabó, steerage passenger",
      requires: "asked:port-steerage-man:disagree",
    },
    {
      id: "fines",
      text: "“It is not that the sheet is true. It is that the sheet and the man agree — because a disagreement at the desk is what sends him to a board, and a board sends him back to us.”",
      from: "Wilhelm Traube, shore agent",
      requires: "asked:port-steamship-agent:disagree",
    },
    {
      id: "hamburg",
      text: "“Condition of health, mental and physical — GOOD. I am sixty-eight. A clerk at Hamburg wrote it and never came round the counter to see.”",
      from: "Jozef Halka, steerage passenger",
      requires: "asked:port-steerage-elder:not-yours",
    },
    {
      id: "not-asked",
      text: "“I have been a seamstress since I was twelve, and I have an aunt in Newark. Neither of those is a question.”",
      from: "Anna Krajewska, held for a hearing",
      requires: "asked:port-detained-woman:no-line",
    },
  ],
  closer: {
    prompt:
      "Six lines audited against eight accounts. Your reading goes into the record — what is this minute?",
    skillCategory: "Sourcing",
    options: [
      {
        id: "only-copy",
        text: "An accurate record of the answers to twelve questions, and the only account of the hearing that will ever exist",
        correct: true,
        why: "Right, and both halves matter. Nothing in it is false: the money is what the manifest says, the certificate really was called for and really was absent, the session really was closed and required to be, the board really did divide and then reverse. What the audit finds is what a minute of this shape can hold — answers to questions, and nothing anybody volunteered outside one, which is the clerk's own description of his job. Its opening question establishes that she is the person on line 11 and the hearing then proceeds as though that settled whose answers those are, which two of your eight accounts refute outright. And in four years, on an appeal, this page is the hearing.",
      },
      {
        id: "doctored",
        text: "A record shaped after the fact to justify the decision",
        correct: false,
        why: "You went looking for the doctoring and did not find it, which is the useful outcome rather than a wasted afternoon. The minute records the inspector stating the bind aloud, records her correcting him — I did not say an offer — records that the medical certificate was called for and absent, records the split vote, and records the husband and his bank book. A clerk covering for a board does not type the sentence that convicts the procedure. Every line you marked complicated is complicated by what the form could hold, not by what anybody chose to keep out of it.",
      },
      {
        id: "thorough",
        text: "A thorough hearing, fairly recorded",
        correct: false,
        why: "Half of that is true and it is the half the page can prove. Three inspectors, twelve questions, a split vote, a reversal inside the hour, twenty-two minutes in all — against a board handling fifty or a hundred cases in a day, this is careful work by people taking it seriously. What it is not is a record of the hearing. It holds the answers to twelve questions and nothing said outside one, and the two things that would have settled the case — a trade she has had since she was twelve and an aunt in Newark — were not among the twelve, on her page or on the one in the room next door.",
      },
      {
        id: "useless",
        text: "Too incomplete to be evidence of anything",
        correct: false,
        why: "The opposite of the finding, and it throws the mission away. Only one of the six lines you audited is contradicted by anything you gathered, and contradicting that one took eight conversations — which is precisely what makes this page evidence. A document that cannot be checked is useless; this one can be checked, line by line, and the checking is what shows you the shape of the room it was made in. Knowing exactly what a record cannot carry is not the same as concluding it carries nothing.",
      },
    ],
  },
};

export const UNIT_07_ACTIVITIES = {
  "port-ship-manifest-page": COLUMN_THIRTY,
  "port-medical-inspection-card": SIX_SECONDS,
  "port-special-inquiry-minute": IN_ANSWER_TO_A_QUESTION,
};
