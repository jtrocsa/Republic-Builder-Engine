// Unit 7 (Period 7: 1890-1945) campaign content — "The Terms of Belonging."
//
// Structural mirror of unit-06-campaign.js. Three cases: one Chronotravel destination with a
// walkable map (case-019, the immigrant station in New York Harbor on the busiest day it ever
// had), and two missions.
//
// ## The unit is one question asked three times
//
// `THE-MAP-PROGRAM.md` §5 fixes what the field case's interview asks — **what the official
// question fails to ask** — and the two missions are that same question moved. The port asks it of
// people arriving: a printed form decides what you are before anybody looks at you. The first
// mission asks it of people who never arrived anywhere, because the country came to them — seven
// million Filipinos acquired by treaty, and a Supreme Court that had to say what they were to a
// republic. The last asks it of people who were already citizens, and answers that a line drawn on
// a map is enough.
//
// Half a century separates the three, and the instrument gets quieter each time: a chalked letter
// on a coat, a clause in a treaty, an order that names nobody at all.
//
// The two missions' topics are an authoring choice rather than a briefed one — the map program
// briefs only the field case for Units 6-9. They were chosen to reach the period's key concepts
// the port does not (7.3 in both of its halves: the argument over empire, and the domestic
// consequences of a world war) and because the unit's own question has an ending that a third
// immigration case would have talked past. Progressivism, the First World War and the New Deal are
// carried by the two Archive Challenges rather than by a third case, which is what those are for.
//
// **The quest types here were chosen by content rather than by ledger**, and Unit 6 is why that
// was free to happen: it spent its two missions on the two thin types (`hipp` and `mcq`), so this
// unit could take `evidence-organizing` and `sequencing` because the material asked for them. The
// Philippines case has four parties and no single decisive document, which is a sort. The
// incarceration case has no decisive document either, but for the opposite reason — every step in
// it was lawful and unremarkable alone, and the whole is only visible as a chain.
//
// ## The register rule, and what it costs here
//
// Units 5 and 6 established it: **people the paperwork does not name are named here, speak for
// themselves, and say what is being done to them and what they intend.** This map is the hardest
// case the rule has met, because at this station the paperwork *does* name everyone. It has a
// column for the name, and one for the age, and one for how much money is in the pocket, and one
// for what the Bureau has decided the person is regardless of what they would say. A record that
// leaves somebody out can be caught by asking who is missing. A record that describes somebody
// completely, in a vocabulary they did not choose and cannot correct, cannot.
//
// So the map's people are not there to supply what the forms omit. They are there to supply what
// the forms get wrong while filling every column — which is a harder thing to see, and the reason
// this unit's interview is the one `THE-MAP-PROGRAM.md` §5 assigns it.
//
// ## What these seven records are, and are not
//
// The convention Units 4, 5 and 6 set: every source in CASE_019_SOURCES is a **composite document
// reconstructed for Chronicle**, not a transcription of one surviving archival item, and each
// citation says so in its own first sentence. That rule is not optional here, and for a second
// reason beyond the usual one — a real manifest page and a real board minute name real people
// whose grandchildren are alive, and putting a named family's medical certificate into a game is
// not a thing to do merely because the document is public. The forms are exact; nobody on them is
// anybody. The canonical printed documents — the statutes, the court decisions, the speeches —
// live in content/primary-source-library/unit-07-source-library.js and feed the missions and the
// Archive Challenges below.
//
// **Three of the seven routes name an engine as of Phase 89E, and the other four degrade to the
// reader on purpose.** `THE-MAP-PROGRAM.md` §2 gives this map **slate A — `interview` · `assembly`
// · `discrepancy`**. This comment said `trace` from Phase 89 until Phase 89E, which is slate C's
// line off the same table and is Cottonwood Junction's slate next door — the one thing §2's
// "adjacency holds throughout" forbids. Three later documents copied it before anybody checked
// against the table; see decision log `0081` §5. §5 names the three records the slate lands on: the manifest page, the medical inspection
// card and the board of special inquiry minute, which are the first, third and fourth entries
// below. Those three now carry their engine and their content lives in
// `content/activities/unit-07-activities.js`. The remaining four — the circular, the boarding
// division's return, the line's instructions to its agents and the commissioner's daily statement —
// stay `null` and open in `sourceReader()` through `sourceActivityRoute()`, exactly as the
// non-mission records on the other six maps do. A route may only name an engine once an activity is
// authored for that record, because `validate:content` cross-checks the two and fails if a route has
// nothing behind it.
//
// ## The date is 17 April 1907, and it is load-bearing on four records
//
// The single busiest day in the station's history: 11,747 people, into a building rated for about
// five thousand. That is the map's density, and it is a fact rather than a staging choice.
//
// It also lands two months into a gap that does real work. The act of 20 February 1907 had been
// signed and does not take effect until 1 July, so on this day the head tax is still the two
// dollars fixed in 1903 and the manifest is still the form prescribed under that act. The clerks
// know the new law is coming; the daily statement below asks Washington for the new forms in
// advance. A student reading the excerpts carefully will find a station operating under one
// statute while making arrangements for the next, which is what an administrative record looks
// like from the inside.
//
// Two other things the date fixes. The service doing the medical inspection is the **Public Health
// and Marine-Hospital Service** — that was its name from 1902 to 1912, and calling it the Public
// Health Service here would be five years early. And 1907 is the peak of the entire movement:
// 1,004,756 people came through this station in that fiscal year, the only year it ever passed a
// million, which is why the immigration commission the February act created was already sitting
// when the numbers came in.

export const UNIT_07 = {
  id: "unit-07",
  title: "The Terms of Belonging",
  period: "Period 7 · 1890–1945",
  description:
    "How a country that became an industrial power and a world power in the same twenty years spent the next fifty deciding who belonged to it — sorting a million arrivals a year by printed form and chalk mark, ruling over people it had acquired but would not admit, replacing a clerk's discretion with a quota computed from a census thirty-four years old, and finally removing its own citizens from their homes on the authority of a line drawn on a map — while a generation of reformers argued that the same government could be made to answer for the people already inside it.",
  centralQuestion:
    "Between 1890 and 1945 the United States decided over and over who counted as one of its own — at a desk, in a courtroom, in a quota table, on an order nailed to a telephone pole. On what evidence were those decisions made, and who was allowed to answer back?",
  // Two unit-level Archive Challenges, the pair Units 3, 4, 5 and 6 carry: the SAQ works from a
  // single stimulus, the DBQ from seven documents. Both are reached from the Archive Terminal in
  // the Archive Room, never from a case — see the Mission vs. Archive Challenge split in CLAUDE.md.
  archiveChallenges: [
    { questType: "saq", questId: "unit-07-archive-sorting-arrivals-saq" },
    { questType: "dbq", questId: "unit-07-archive-terms-of-belonging-dbq" },
  ],
  cases: [
    {
      id: "case-019",
      shortTitle: "Ellis Island",
      title: "Admitted, Detained, Excluded",
      date: "1907",
      // Ellis Island, in the Upper Bay off the New Jersey shore. Unlike Riverbend, Canal
      // Crossroads and Cottonwood Junction, the place is real and named: the station is the
      // subject rather than the setting, and inventing a composite harbour would cost the one
      // thing the map is for. The records on it are composites; the island is not.
      mapPosition: { lat: 40.6995, lon: -74.0396 },
      location: "Ellis Island, New York Harbor · 17 April 1907",
      question:
        "Eleven thousand seven hundred and forty-seven people came off the barges here in a single day, and every one of them had been written down in Europe before anybody in America looked at them. Who decided what they were — and what did the form have to leave out in order to decide it?",
      mechanic: "Field Investigation",
      route: "field",
      summary:
        "Walk the busiest day the station ever had — the ferry slip and the baggage canopy on the wharf outside, then the stairs the surgeons watch you climb, the registry desks in the inspection hall, and the closed door of the board of special inquiry — and recover seven records that together show how a country sorted a million people a year with a printed form, a piece of chalk and three inspectors in a side room.",
      // KC 7.1 (the Progressive-era administrative state, and what it was built to do) and 7.2
      // (international migration and the reaction to it). Themes: MIG (who arrives, and on what
      // terms), NAT (what the country decided a person was), PCE (discretion exercised by
      // officials answerable to nobody in the room).
      ced: { period: 7, keyConcepts: ["7.1", "7.2"], themes: ["MIG", "NAT", "PCE"] },
    },
    {
      id: "case-020",
      shortTitle: "Under the Flag",
      title: "Under the Flag",
      date: "1898–1901",
      // Manila — where the question was answered by force three years before it was answered in
      // Washington by opinion.
      mapPosition: { lat: 14.5995, lon: 120.9842 },
      location: "The Philippine Islands and Washington, D.C. · 1898–1901",
      question:
        "The United States acquired seven million people by treaty and then had to say what they were to it. Sort the case its supporters made, the case its opponents made, the answer the people themselves gave, and the answer the Supreme Court actually handed down — and work out which of the four settled it.",
      mechanic: "Evidence Sorting",
      // A non-map mission. Evidence-organizing on six documents, because the question genuinely
      // has four parties to it and a student's real difficulty is not deciding who was right. It
      // is seeing that the Court answered a different question from the one either side was
      // arguing, and that its answer is the one that lasted.
      route: "mission",
      summary:
        "Sort six documents from the argument over the Philippines by what each one is actually doing as evidence, then explain why a tariff case about Puerto Rico decided the constitutional standing of people nobody in it had ever met.",
      archiveChallenge: {
        questType: "evidence-organizing",
        questId: "case-020-mission-under-the-flag",
      },
      // KC 7.3 (global conflict, empire, and the domestic argument about the nation's proper role).
      // Themes: WOR, NAT (what a republic is, if it holds subjects), PCE.
      ced: { period: 7, keyConcepts: ["7.3"], themes: ["WOR", "NAT", "PCE"] },
    },
    {
      id: "case-021",
      shortTitle: "The Order and the Map",
      title: "The Order and the Map",
      date: "1941–1944",
      // The Presidio of San Francisco — headquarters of the Western Defense Command, where the
      // recommendation was written and the exclusion orders were drawn.
      mapPosition: { lat: 37.7989, lon: -122.4662 },
      location: "The Western Defense Command · 1941–1944",
      question:
        "In 1942 the United States removed about 120,000 people from their homes, roughly two thirds of them its own citizens, on the authority of an order that named no nationality at all. Put the steps in the order in which each one made the next one possible.",
      mechanic: "Chronology Builder",
      // A non-map mission. Sequencing, and the reason is that no single document explains this:
      // every step was lawful, several were unremarkable on their own, and the whole is only
      // visible as a chain. The last item is a reversal students consistently miss.
      route: "mission",
      summary:
        "Reconstruct the chain that ran from a 1922 citizenship decision to a pair of 1944 Supreme Court opinions — a registration statute, an arrest list, a general's recommendation, an executive order that named nobody, and the criminal penalty that gave it teeth.",
      archiveChallenge: {
        questType: "sequencing",
        questId: "case-021-mission-the-order-and-the-map",
      },
      // KC 7.2 (internal migration, forced this time) and 7.3 (the domestic consequences of the
      // Second World War). Themes: NAT (citizenship that did not hold), PCE, MIG.
      ced: { period: 7, keyConcepts: ["7.2", "7.3"], themes: ["NAT", "PCE", "MIG"] },
    },
  ],
};

// Record Reconstruction lanes for case-019. Three, and like Units 4, 5 and 6's they are arguments
// rather than topics. Every record on this map is part of one machine for sorting people, and a
// machine has three parts worth asking about: what it is measuring, who is holding the lever, and
// what it costs to run. Asking a student which of the three a given form belongs to is a sourcing
// exercise disguised as a sort — and it is the sort that makes the cabin-passenger return and the
// steamship circular legible as evidence rather than as background.
export const CASE_019_LANES = [
  { id: "what-the-question-is-for", label: "What the question is for" },
  { id: "who-decides-and-on-what", label: "Who decides, and on what" },
  { id: "what-the-sorting-costs", label: "What the sorting costs" },
];

export const CASE_019_SOURCES = [
  {
    id: "port-ship-manifest-page",
    type: "Reconstructed record · List or Manifest of Alien Passengers for the United States Immigration Officer at Port of Arrival",
    title: "Manifest Sheet 14, Steerage",
    creator: "The purser of a transatlantic steamer, filled in at the port of embarkation",
    date: "April 1907",
    record:
      "One ruled sheet of thirty lines, and the sheet an inspector reads back to you at the desk",
    visual: "context",
    activityRoute: "interview",
    excerpt:
      "LIST OR MANIFEST OF ALIEN PASSENGERS FOR THE UNITED STATES IMMIGRATION OFFICER AT PORT OF ARRIVAL. Required by the regulations of the Secretary of Commerce and Labor, under act of Congress approved March 3, 1903, to be delivered to the United States immigration officer by the commanding officer of any vessel having such passengers on board upon arrival at a port in the United States. — COLUMN HEADINGS. 1 No. on list. 2 Name in full, family and given. 3 Age. 4 Sex. 5 Married or single. 6 Calling or occupation. 7 Able to read; able to write. 8 Nationality: country of which citizen or subject. 9 Race or people. 10 Last residence. 11 Name and complete address of nearest relative or friend in country whence alien came. 12 Final destination. 13 Whether having a ticket to such final destination. 14 By whom was passage paid. 15 Whether in possession of $50, and if less, how much. 16 Whether ever before in the United States, and if so, when and where. 17 Whether going to join a relative or friend, and if so, what relative or friend, and his name and complete address. 18 Ever in prison, or almshouse, or institution for the care and treatment of the insane, or supported by charity. 19 Whether a polygamist. 20 Whether an anarchist. 21 Whether coming by reason of any offer, solicitation, promise, or agreement, express or implied, to labor in the United States. 22 Condition of health, mental and physical. 23 Deformed or crippled; nature, length of time, and cause. 24 Height. 25 Complexion. 26 Colour of hair and eyes. 27 Marks of identification. 28 Place of birth: country. 29 Place of birth: city or town. — LINE 11. Age 34. F. Married. Wife. Reads, yes; writes, no. Nationality, RUSSIA. Race or people, HEBREW. Last residence, Kiev. Final destination, New York. Ticket to destination, no. Passage paid by husband. In possession of $50? No — $11. Going to join relative: husband, Orchard street. Health, good. Height 5 ft. 1 in. Complexion fair. — LINE 12. Age 9. F. Single. Daughter. Reads, no. Nationality, RUSSIA. Race or people, HEBREW. — LINE 13. Age 26. M. Single. Labourer. Reads, yes; writes, yes. Nationality, AUSTRIA. Race or people, SOUTH ITALIAN. Last residence, Trieste. Passage paid by self. $18. Whether coming by reason of any offer or promise to labor: NO.",
    prompt:
      "Two of these columns ask where a person is from. Read what each one is actually asking for, and say why the Bureau needed both of them. Then find the one column whose answer a person could not possibly know about themselves — and say who does know it.",
    feedback:
      "Institute Context: column 8 records the state that governs you and column 9 records what the Bureau has decided you are, and the two are meant to disagree. The woman on line 11 is a subject of the Russian Empire and is entered as “Hebrew.” The man on line 13 is a subject of Austria-Hungary and is entered as “South Italian.” Neither answer came from them. The Bureau of Immigration began recording a separate race or people for every arrival in 1899 and printed it as a column on this form in 1903, working from its own list of some forty-odd categories — Hebrew, Magyar, Ruthenian, Slovak, Croatian and Slovenian, Finnish, Scandinavian, African (black) — and, alone among European nationalities, splitting Italians into North and South on the theory that they were two different stocks. Jewish organisations objected within a few years that Hebrew named a religion and not a race; the Bureau kept the column. The classification received its full published statement in the Dictionary of Races or Peoples that the immigration commission created by the 1907 act issued in 1911. Column 9 is therefore the answer to the second half of the question: it is the one entry on the sheet that nobody aboard the ship supplied, and the only person who knows what will be written there is the clerk holding the pen. The rest of the form is a consistency test. It was filled in by the steamship company in Europe, before the crossing; the inspector at the registry desk asks the same questions again and compares. Nothing on the sheet has to be true for the system to work. It has to be the same twice.",
    citation:
      "Composite record reconstructed for Chronicle from the printed manifest form prescribed under the Immigration Act of 3 March 1903; it is not a transcription of a single surviving sheet, and no person entered on it is a real individual. The column list, the ruled thirty-line sheet, the steamship line's duty to prepare the manifest and the master's duty to deliver it follow that act and the regulations issued under it. The separate race-or-people classification, its adoption in 1899, the instruction that it be recorded independently of nationality, and the North and South Italian distinction follow Joel Perlmann, “‘Race or People’: Federal Race Classifications for Europeans in America, 1898-1913” (Levy Economics Institute Working Paper 320, 2001), and the United States Immigration Commission, Dictionary of Races or Peoples (Washington: Government Printing Office, 1911).",
    externalUrl: "https://www.archives.gov/research/immigration/passenger-arrival",
    reconstruction: "what-the-question-is-for",
  },
  {
    id: "port-races-or-peoples-circular",
    type: "Reconstructed record · Bureau of Immigration circular, the list of races or peoples",
    title: "Instructions for Column Nine",
    creator: "The office of the Commissioner-General of Immigration, Washington",
    date: "1907, reissuing a classification in use since 1899",
    record:
      "The instruction sheet pinned above the registry desks, telling an inspector how to fill one column",
    visual: "context",
    activityRoute: null,
    excerpt:
      "CIRCULAR. — TO INSPECTORS IN CHARGE AT ALL PORTS. The entry required in the column headed RACE OR PEOPLE is not the entry required in the column headed NATIONALITY, and the two are not to be made to agree. Nationality is the country of which the alien is a citizen or subject. Race or people is the stock to which the alien belongs, and is to be entered from the list appended hereto, without regard to the country of birth, the country of last residence, or the passport carried. — Thus an alien born in Russia may be Russian, Polish, Hebrew, German, Lithuanian, Finnish or Ruthenian; an alien born in Austria-Hungary may be German, Magyar, Bohemian, Slovak, Croatian, Ruthenian, Roumanian or Italian; and the entry will be made accordingly. — The distinction between NORTH ITALIAN and SOUTH ITALIAN is to be observed in every case, the dividing line being that between the northern provinces and the remainder of the peninsula together with Sicily and Sardinia. — Where the alien's own statement of his race is at variance with the facts as they appear to the inspecting officer, the officer will enter the race as indicated by the language habitually spoken, by the place of origin of the stock, and by his own observation, and will not enter the race merely as claimed. — The entry HEBREW will be made for aliens of that race whatever their nationality or country of birth. — Officers are reminded that this column is required for statistical purposes and that its accuracy is of the first importance to the work of the Bureau.",
    prompt:
      "One sentence here tells an inspector what to do when the traveller's answer and the rule disagree. Find it, and read it twice. Then find the one category on the list that names no country at all, and say what an officer has to be looking at in order to enter it.",
    feedback:
      "Institute Context: this is the shortest document on the map and it does the most work. Three things to take out of it. First, the disagreement between columns 8 and 9 is deliberate and stated — “the two are not to be made to agree.” The Bureau wanted a count of stocks rather than of passports, because the political argument then being had about immigration was an argument about stocks. Second, the variance sentence settles who owns the answer. Where the traveller's account of themselves differs from the officer's, the officer's governs, and the evidence he is directed to use is language, origin and “his own observation” — that is, what a person looks like to a stranger across a desk, entered as a fact and reported to Washington as a statistic. Third, the one category that names no country is the one an officer must supply from observation in every single case. The North and South Italian division was defended on the same reasoning and was objected to by Italian officials at the time; the Hebrew category was objected to publicly by Jewish organisations in congressional hearings in 1909 and 1910, on the ground that it classified a religion as a race, and it survived the objection. The reason to read an administrative circular this closely is that it is not describing a prejudice held by the men at the desks. It is issuing them one, in writing, with a filing requirement attached.",
    citation:
      "Composite record reconstructed for Chronicle from the form and substance of Bureau of Immigration circulars instructing inspectors on the race-or-people classification; it is not a transcription of a single surviving circular. The 1899 adoption of the classification, its independence from nationality, the North and South Italian division, the instruction to prefer the officer's determination to the alien's own statement, and the contemporary objections to the Hebrew entry follow Joel Perlmann, “‘Race or People’: Federal Race Classifications for Europeans in America, 1898-1913,” and Mae M. Ngai, Impossible Subjects: Illegal Aliens and the Making of Modern America (Princeton: Princeton University Press, 2004). The published codification is the United States Immigration Commission's Dictionary of Races or Peoples (1911).",
    externalUrl: "https://www.loc.gov/collections/immigration-to-the-united-states-1789-1930/",
    reconstruction: "what-the-question-is-for",
  },
  {
    id: "port-medical-inspection-card",
    type: "Reconstructed record · line-inspection card, and the chalk-mark key posted in the surgeons' room",
    title: "The Six-Second Examination",
    creator: "A surgeon of the United States Public Health and Marine-Hospital Service",
    date: "17 April 1907",
    record:
      "The card a passenger carries up the stairs, and the letters written on a coat in chalk",
    visual: "context",
    activityRoute: "assembly",
    excerpt:
      "LINE INSPECTION — STATION KEY, POSTED. Officers will take station at the head of the stairs from the baggage room and will observe each alien during the ascent. The climb is itself the examination for the heart, the lungs and the gait; aliens are not to be halted upon the stairs. — MARKS. Chalk upon the right shoulder of the outer garment, as follows. B, back. C, conjunctivitis. CT, trachoma. E, eyes. F, face. Ft, feet. G, goitre. H, heart. K, hernia. L, lameness. N, neck. P, physical and lungs. Pg, pregnancy. S, senility. Sc, scalp. X, suspected mental defect; X within a circle, definite signs of mental disease. SI, to be held for special inquiry. — Marked aliens will be turned aside to the second examination in the rooms adjoining and will not proceed to the registry desks until released. — CLASSES. Class A, a loathsome or a dangerous contagious disease: certification is mandatory and the alien is excluded by operation of law; the officer certifies the condition and exercises no discretion as to the result. Class B, a mental or physical condition of such a nature as may affect the ability of the alien to earn a living: the certificate is referred to a board of special inquiry, which determines the case. — Officers are reminded that the eyelid is to be everted in every case where the eye is marked, and that the instrument is to be cleansed between aliens.",
    prompt:
      "Go through the chalk letters and count how many name something a doctor could treat, and how many name something a person simply is. Then read the two class rules at the foot, and say which of the two classes actually needed a doctor to decide anything at all.",
    feedback:
      "Institute Context: the staircase is the instrument. Surgeons of the Public Health and Marine-Hospital Service — that was the service's name from 1902 to 1912 — stood at the top of the flight up from the baggage room and watched several thousand people a day climb it, because a heart, a lung and a limp are all easier to see in somebody carrying a bundle up stairs than in somebody standing still. Contemporaries called it the six-second physical, and it was not a joke: an examination that fast can detect only what movement reveals, which is exactly what it was designed around. The two classes are the finding. Class A is a diagnosis — trachoma, favus, tuberculosis — and the statute does the rest; the surgeon has no discretion and the case never reaches a board. Class B is not a diagnosis at all. It is a prediction about whether a person will be able to earn a living, which is a question about the American labour market rather than about the body in front of you, and the doctor who certifies it hands that question to three lay inspectors in a side room. The act of 20 February 1907, signed two months before this day and in force from 1 July, wrote the standard into the statute in so many words: a person “mentally or physically defective, such mental or physical defect being of a nature which may affect the ability of such alien to earn a living.” Trachoma was the largest single medical cause of exclusion, and the buttonhook used to turn an eyelid is the object more arrivals remembered than any other. Note too what a chalk mark is: a public letter on your coat, in a hall holding several thousand people, that everyone around you can read and you cannot.",
    citation:
      "Composite record reconstructed for Chronicle from the form of Public Health and Marine-Hospital Service line-inspection procedure and the chalk-mark code used at the Ellis Island station; it is not a transcription of a single surviving card. The stairway inspection, the chalk letters and their meanings, the eversion of the eyelid, and the Class A and Class B distinction between mandatory exclusion and referral to a board follow Alan M. Kraut, Silent Travelers: Germs, Genes, and the “Immigrant Menace” (New York: Basic Books, 1994), and Amy L. Fairchild, Science at the Borders: Immigrant Medical Inspection and the Shaping of the Modern Industrial Labor Force (Baltimore: Johns Hopkins University Press, 2003). The Class B statutory language is that of the Immigration Act of 20 February 1907.",
    externalUrl: "https://www.nps.gov/elis/learn/historyculture/index.htm",
    reconstruction: "who-decides-and-on-what",
  },
  {
    id: "port-special-inquiry-minute",
    type: "Reconstructed record · minutes of a board of special inquiry",
    title: "Minute of a Hearing, Board No. 2",
    creator: "The clerk of the board; three immigrant inspectors sitting",
    date: "17 April 1907",
    record: "One typed minute of one hearing, in a closed room off the registry floor",
    visual: "context",
    // The audit chain reads the manifest's own answers back to the person supposed to have given
    // them, so the manifest has to have been recovered first. Same shape as Riverbend's letter,
    // Canal Crossroads' time book, Richmond's requisition and Cottonwood Junction's receipt — and
    // it decides which mission can be last.
    requiresSourceId: "port-ship-manifest-page",
    activityRoute: "discrepancy",
    excerpt:
      "BOARD OF SPECIAL INQUIRY NO. 2. — Present: three inspectors, and the interpreter. The hearing is held separate and apart from the public. Alien held as likely to become a public charge. — Q. You are the person entered upon line 11 of manifest sheet 14? — A. Yes. — Q. The manifest says you have eleven dollars. Is that all the money you have? — A. Yes. — Q. Who is going to support you? — A. My husband. He is here three years. He works. — Q. Has he sent you anything? — A. He sent the ticket. — Q. Have you a promise of employment? — A. I can sew. I sewed at home. — INSPECTOR: Let it be noted that the alien states she is able to work. The manifest, column 21, is answered NO as to any offer or promise of employment. If she has an offer she is excluded under the contract labour provision; if she has none, and eleven dollars, she is likely to become a public charge. — Q. Do you have an offer of work in America? — A. I did not say an offer. I said I can sew. — The certificate of the medical officer is called for: none. — The board deliberates. Decision, two to one: EXCLUDED, likely to become a public charge; and the alien is informed of her right of appeal to the Secretary of Commerce and Labor. — Later, same day. The husband appearing at the bar of the board and producing a bank book and a statement from his employer, the board on its own motion reopens and reverses. ADMITTED. Total time of both hearings, twenty-two minutes.",
    prompt:
      "The board reaches a decision, and then a different piece of paper walks into the room and it reaches the opposite one. List every document the board relied on in the first hearing and say who wrote each. Then find the one document that changed the outcome — and say what makes it different from all the others.",
    feedback:
      "Institute Context: a board of special inquiry was three immigrant inspectors sitting in closed session, deciding by majority, working through perhaps fifty or a hundred cases in a day. No lawyer was permitted at the hearing itself; counsel was admitted only on an appeal to the Secretary of Commerce and Labor, the department the Bureau of Immigration then sat in. Roughly one arrival in five was detained for some reason and about two in a hundred were finally excluded, so the boards' work was mostly admission — but the discretion was complete, and the whole record of it is four lines of a clerk's typing. Two things are worth taking out of this minute. The first is the bind the inspector states aloud, which is neither a trick nor an accident: promising a job to a labourer before arrival had been unlawful since the alien contract labour act of 1885, and arriving without means or prospects made a person likely to become a public charge under the general immigration acts. Answer one way and you are excluded under one statute; answer the other way and you are excluded under the other. That ground was the most-used in the period precisely because it was elastic — it could rest on a sum of money, on a Class B medical certificate, on a woman travelling without a man, or on nothing anybody had to write down. The second is what reverses it. Every document in the first hearing was produced by an arm of the government or by the steamship company: the manifest, the medical certificate, the detention card. What changes the decision is a bank book and a letter from a private employer, carried in by a relative who had to be in New York, know the hearing was happening, and be able to leave work to attend. That is the shape of the whole system in one afternoon. The paper the state generated described her; the paper she could not generate herself is the only paper that freed her.",
    citation:
      "Composite record reconstructed for Chronicle from the form of board of special inquiry minutes; it is not a transcription of a single surviving hearing, and no person in it is a real individual. The three-inspector board, the closed session, decision by majority, the exclusion of counsel from the hearing but not from the appeal, the appeal to the Secretary of Commerce and Labor and the board's power to reopen follow the Immigration Act of 3 March 1903 and the regulations under it. The interaction between the likely-to-become-a-public-charge ground and the alien contract labour act of 1885, and the elasticity of that ground in practice, follow Mae M. Ngai, Impossible Subjects, and Vincent J. Cannato, American Passage: The History of Ellis Island (New York: Harper, 2009).",
    externalUrl: "https://www.archives.gov/research/immigration",
    reconstruction: "who-decides-and-on-what",
  },
  {
    id: "port-cabin-passenger-return",
    type: "Reconstructed record · boarding inspector's return of cabin passengers examined on shipboard",
    title: "Return of the Boarding Division",
    creator: "The boarding division, at quarantine in the Lower Bay",
    date: "17 April 1907",
    record: "The list a boarding party leaves with the purser before a ship goes up to her pier",
    visual: "context",
    activityRoute: null,
    excerpt:
      "BOARDING DIVISION, PORT OF NEW YORK. — RETURN OF CABIN PASSENGERS EXAMINED ON SHIPBOARD. The vessel having been boarded at quarantine, the inspectors and the medical officer of the boarding party have examined the passengers of the first and second cabins in the saloon, in the presence of the purser, and have compared them with the manifest. — First cabin, 212 examined, 212 passed. Second cabin, 341 examined, 338 passed, 3 held. — Passengers passed will land at the company's pier in the North River with their baggage and are not required to proceed to the immigration station. — The three held, being two for the medical officer and one for further inquiry as to means, will be transferred with the steerage to the station by barge. — Steerage, 1,106, to be landed at the station in the usual manner. — NOTE. Nothing in the statute distinguishes the cabin passenger from the steerage passenger as to the law to be applied; the distinction is one of the place and manner of examination only.",
    prompt:
      "The note at the foot says the same law applies to everybody aboard this ship. Find the sentence that decides which of them will ever set foot on the island — and say what that sentence is actually measuring.",
    feedback:
      "Institute Context: this record reframes the whole map, and it does it in one line. First- and second-cabin passengers were examined aboard ship in the harbour, in the saloon, by a boarding party of a few inspectors and a surgeon working through several hundred people in an hour or two; if passed, they walked down the gangway at the company's Hudson River pier and into the city. Steerage passengers were taken off by barge to the island, up the stairs past the surgeons, through the registry desks and — one in five of them — into a detention room. The note is telling the truth: the statute makes no distinction, and the regulations make one only as to “the place and manner of examination.” What that phrase measures is the price of a ticket. The administrative justification was straightforward and even, on its own terms, reasonable: a passenger who could afford a cabin was unlikely to be found likely to become a public charge, so examining them at length was a poor use of officers. The effect is that the grounds of exclusion most used at this station were grounds a person with money could not plausibly be charged under, applied at length to people who had none. Note the last clause as well. A cabin passenger who was sick or doubtful was sent to the island after all, so the gate was never sealed by class — it was weighted by it, which is harder to see and much harder to argue with.",
    citation:
      "Composite record reconstructed for Chronicle from the form of boarding division returns at the port of New York; it is not a transcription of a single surviving return. The shipboard examination of first- and second-cabin passengers, their landing at the company piers without proceeding to the island, the transfer of held cabin passengers with the steerage, and the regulatory rather than statutory basis of the distinction follow Vincent J. Cannato, American Passage: The History of Ellis Island, and Roger Daniels, Guarding the Golden Door: American Immigration Policy and Immigrants since 1882 (New York: Hill and Wang, 2004).",
    externalUrl: "https://www.nps.gov/elis/learn/historyculture/places.htm",
    reconstruction: "what-the-sorting-costs",
  },
  {
    id: "port-steamship-line-circular",
    type: "Reconstructed record · a steamship line's circular to its emigration agents at the European ports",
    title: "Instructions to Agents, Continental Ports",
    creator: "The passenger department of a transatlantic line",
    date: "1907",
    record: "The instruction sheet an emigration agent works from at Hamburg, Bremen or Naples",
    visual: "context",
    activityRoute: null,
    excerpt:
      "PASSENGER DEPARTMENT. — TO OUR AGENTS AT THE CONTINENTAL PORTS. Agents are again reminded that where an alien is refused a landing at New York the Company is required to return him to the port of embarkation at the Company's own charge, is liable to a penalty in respect of any alien afflicted with a loathsome or dangerous contagious disease which might have been detected at the time of embarkation, and receives back no part of the passage money. The Company's loss upon a single rejected emigrant exceeds its profit upon several accepted ones. — Agents will therefore: FIRST, require every emigrant to pass the Company's own medical examination at the control station before a ticket is issued, and will particularly instruct the examining physician as to the eye. SECOND, refuse a ticket to any person who cannot show the means required upon landing, or a relative in America who will appear for him. THIRD, cause every emigrant to be bathed and his effects disinfected at the control station, and to be held there the period prescribed. FOURTH, fill the manifest from the emigrant's own answers, and where an answer is such as would cause a rejection, decline the passage rather than enter a different answer, the manifest being compared with the alien's statement at New York. — The Company's examination is not the Government's, and passing it is no assurance of a landing. Agents will make this plain and will take no responsibility for a rejection at New York.",
    prompt:
      "Count the parties on this sheet who lose money when somebody is turned back at New York, and then count the parties who lose anything else. Read the fourth instruction twice. Then say who actually inspected this person first, and how long before any American saw them.",
    feedback:
      "Institute Context: the first immigration officer most people met was not an American official and was not paid by a government. The acts of 1891, 1893 and 1903 made a steamship line carry a rejected alien home at its own expense and fined it for landing anyone with a contagious disease it ought to have caught at embarkation, and the lines responded exactly as businesses do: they built their own inspection into the sale of the ticket. The Hamburg-Amerika line's control stations on the German frontier and its walled emigrant halls at Hamburg, opened in 1901, held and bathed and examined and disinfected people for days before they were allowed aboard; Naples, Antwerp and Bremen ran comparable arrangements. By the time a family reached the island they had already been sorted once, by a company with money at stake and no obligation to explain itself, and there was no appeal from a shipping clerk. The fourth instruction is the sharpest line on the sheet: the company will not falsify the manifest, not out of scruple but because the answers are checked against the person at New York and a discrepancy is worse than a bad answer. That is why the manifest is a consistency test rather than a fact-finding one — a document written in Europe by somebody with a commercial interest in your admission, to be read back to you in America by somebody with none. And the last paragraph is the company protecting itself: it has taken your money, examined you, and disclaimed the result in advance.",
    citation:
      "Composite record reconstructed for Chronicle from the form of transatlantic steamship companies' instructions to their emigration agents; it is not a transcription of a single surviving circular. The lines' statutory liability to return rejected aliens at their own cost and the penalty for landing an alien with a detectable contagious disease follow the Immigration Acts of 3 March 1891, 3 March 1893 and 3 March 1903. The company control stations, the Hamburg emigrant halls of 1901, the pre-embarkation medical examination and disinfection, and the commercial logic behind them follow Drew Keeling, The Business of Transatlantic Migration between Europe and the United States, 1900-1914 (Zurich: Chronos, 2012), and Cannato, American Passage.",
    externalUrl:
      "https://www.loc.gov/collections/immigration-to-the-united-states-1789-1930/about-this-collection/",
    reconstruction: "what-the-sorting-costs",
  },
  {
    id: "port-commissioners-daily-statement",
    type: "Reconstructed record · the commissioner's daily statement of business at the station",
    title: "Statement of Business, One Day",
    creator: "The office of the Commissioner of Immigration, Port of New York",
    date: "17 April 1907",
    record:
      "The day's totals, made up at the close of business and wired to the Bureau in Washington",
    visual: "context",
    activityRoute: null,
    excerpt:
      "STATEMENT OF BUSINESS AT THIS STATION, THIS DATE. — Aliens landed and examined, 11,747; being the largest number examined at this station upon any one day. Vessels discharging, 9. Hours worked, first barge to last, 14. — DISPOSITION. Admitted at the desks, 9,412. Temporarily detained, awaiting relatives, money or railroad, 1,881. Held for boards of special inquiry, 402. Held for the medical officers, 52. Excluded upon the day's boards, 47, of whom appealing to the Secretary, 21. Discharged to the hospital, 19. — REVENUE. Head tax collected at two dollars the head, $23,494, remitted to the Treasury to the credit of the immigrant fund. — CONCESSIONS, being privileges let by contract upon this station and no part of the revenue of the United States: money exchange, sums exchanged, $41,300; railroad ticket office, tickets sold, 6,209, being to points beyond this city; food concession, box lunches sold, 3,140. — REMARKS. The station is rated for the examination of about five thousand aliens in a day. The Commissioner again respectfully directs attention to the condition of the detention quarters. — The head tax provided by the act approved 20 February last, at four dollars the head, is to be collected from and after 1 July next; forms and instructions are requested in advance of that date.",
    prompt:
      "Every figure here is one the office was required to report. Find the two that are money, and say which one the United States keeps and which one it does not. Then divide the day's arrivals by the hours worked, and read the first sentence under REMARKS again.",
    feedback:
      "Institute Context: 11,747 people in fourteen hours is about fourteen a minute, sustained, through a building rated for five thousand a day — and the station's own return says so in the same breath, which is what makes an administrative document worth reading. The two money lines are the finding. The head tax is public revenue: two dollars a head under the act of 1903, paid to the Treasury, rising to four dollars on 1 July 1907 under the act signed eight weeks before this day, which is why a clerk is asking Washington for the new forms in advance. The concessions are not public revenue at all. The money exchange, the railroad ticket office and the box-lunch counter were private franchises let by contract to operate on federal property, and the reason a government form troubles to say “no part of the revenue of the United States” is that those concessions had been the subject of a presidential investigation five years earlier, after repeated findings that immigrants were short-changed at the exchange and overcharged for food they could not refuse. Note where the people go: most of them bought a railroad ticket, because the harbour was a doorway rather than a destination, and the ferries carried them to the New Jersey terminals for trains west. And note the shape of the dispositions. Exclusion is 47 out of 11,747 — well under half of one per cent on the day, in line with about two per cent across the year once appeals and later hearings are counted. The system's real product was not exclusion. It was the sorting: a fifth of everyone arriving spent a night or more in a detention room because a relative was late, a sum was short or a form did not match, and nearly every one of them was admitted in the end.",
    citation:
      "Composite record reconstructed for Chronicle from the form of daily statements returned by the commissioner at the port of New York to the Bureau of Immigration; it is not a transcription of a single surviving statement. The figure of 11,747 aliens on 17 April 1907, the busiest day in the station's history, and the fiscal-year total of 1,004,756 follow the National Park Service's Ellis Island administrative history. The two-dollar head tax follows the Immigration Act of 3 March 1903 and the four-dollar tax the Act of 20 February 1907. The concession system, its standing as privileges let by contract rather than as federal revenue, and the investigations of abuses at the money exchange and the food concession follow Vincent J. Cannato, American Passage.",
    externalUrl: "https://www.nps.gov/elis/learn/historyculture/immigration-timeline.htm",
    reconstruction: "what-the-sorting-costs",
  },
];
