// Unit 9 (Period 9: 1980-present) campaign content — "What Is Kept."
//
// Structural mirror of unit-08-campaign.js. Three cases: one Chronotravel destination with a
// walkable map (case-025, a university archive in a Rust Belt valley city in October 1998), and
// two missions.
//
// ## The closing unit, and the one place the game's own subject is the subject
//
// `THE-MAP-PROGRAM.md` §5 fixes what the field case's interview asks — **who is allowed to hold
// the record** — and calls this "the one place the game's own thesis is the subject". Eight units
// have now taught a student to read a document against the conditions that produced it. This one
// asks the question those eight were standing on: the document survived, and somebody let you see
// it. Who, and on what terms?
//
// The three records §5 names are three different answers, and they rank in the order nobody
// expects:
//
//   1. **A FOIA response with redactions.** The state withholds, and has to say how much and under
//      which numbered exemption, at the place in the record where it did it. You may appeal in
//      thirty days. A court may read the whole thing in chambers. This is the *weakest* lock on
//      the map, and it is the only one obliged to explain itself.
//   2. **A deed of gift restricting access to a donated collection.** A private contract closes a
//      series at the donor's sole discretion. No exemption, no number, no appeal, no clock, no
//      forum — and it binds the donor's successors. This is the strongest lock in the building and
//      nobody voted on it.
//   3. **A digitised scan that differs from the original it claims to reproduce.** Nobody decided
//      anything at all. An edition change, a publisher's file copy, a filming contract, a discard
//      policy and a scanner setting — each a defensible operational choice by somebody doing their
//      job properly — and the copy that is easy to reach becomes the record.
//
// That is the arc, and it is the one this game has been building since Unit 8's lending office:
// **the decisions that hold hardest are the ones nobody had to sign.** Fairmeadow's committee at
// least had to state a reason it did not have to explain. Furnace Bend's archive does not need a
// committee.
//
// ## The place is composite; every mechanism is documented
//
// Furnace Bend is invented, in the way Riverbend, Canal Crossroads, Cottonwood Junction and
// Fairmeadow are invented and Ellis Island is not, and for the reason `0094` §2 set out: the
// interview asks eight people what somebody else is entitled to see, and eight invented people
// saying that about a real named university is an accusation against a real address. So the valley,
// the works, the company, the coalition, the newspaper and the university are composite.
//
// The mechanisms under them are not. The Freedom of Information Act's nine exemptions and the two
// amendments that shaped this letter are real and cited; the deed of gift follows the standard form
// American archives have used for fifty years, down to the seventy-five-year personnel closure and
// the donor's-designee clause; multiple daily editions, filming from a publisher's file copy,
// discarding the bound originals and bitonal scanning that drops every halftone are all documented
// practice; and the coalition's proposal reconstructs a real campaign — the Ecumenical Coalition of
// the Mahoning Valley's attempt in 1978-79 to buy and reopen a closed works under community
// ownership with a federal loan guarantee, which was refused.
//
// **October 1998 is load-bearing.** The Electronic Freedom of Information Act Amendments of 1996
// had just come fully into force: from 1 October 1997 an agency had twenty working days rather than
// ten, and every deletion had to carry its own exemption number at the place in the record where it
// was made. At the same moment the first large local-history scanning projects were putting
// microfilm on the open web, and university records officers were writing schedules that treated
// electronic mail as not a record at all. It is the last year in which a student could reasonably
// believe the record was a stack of paper in a building.
//
// ## Where the rest of Period 9 went
//
// Not into a fourth case. `THE-MAP-PROGRAM.md` briefs only the field case for Units 6-9, and the
// two missions were chosen to reach the two key concepts the archive does not. case-026 is the
// conservative turn (KC 9.1) and its finding is a date: the two Republican conventions that frame
// it are exactly sixteen years apart, and nearly everything that made the second one possible
// happened between them and outside the party. case-027 is the end of the Cold War (KC 9.3), and it
// is an evidence-organizing mission because the honest answer to "why did it end" is a question
// about which evidence you are holding — which is this unit's own question, asked of the largest
// closed archive of the twentieth century in the year it opened.
//
// Migration and demographic change, the technological transformation and the twenty-first century's
// argument about the size of government are carried by the two Archive Challenges, which is what
// Unit 6 did with industrial labour, Unit 7 with Progressivism and Unit 8 with Vietnam.
//
// ## Every `activityRoute` here is `null`, and that is a stage rather than a decision
//
// Units 3-8 all shipped their content one phase before their maps, for the reason the unit registry
// records: `activeFieldMap()` falls back to Unit 1's Caribbean for a unit it has no map for, so
// registering a field case early does not error — it lands the player on the wrong continent.
// `THE-MAP-PROGRAM.md` §2 gives this map **slate C — `interview` · `assembly` · `trace`**, read off
// that table's own row rather than off a prose summary, which is the mistake `0081` §5 records Unit
// 7 making and paying a rebuild for. §5 names the three records the slate lands on, and they are
// the first three entries below: the deed of gift carries the INTERVIEW, the FOIA response the
// ASSEMBLY, and the two states of one newspaper page the TRACE. The remaining four — the notice
// posted at the mill gate, the coalition's feasibility summary, the finding aid and the university's
// retention schedule — will stay `null` and open in `sourceReader()`, exactly as the non-mission
// records on the other seven maps do. A route may only name an engine once an activity is authored
// for that record, because `validate:content` cross-checks the two and fails if a route has nothing
// behind it.

export const UNIT_09 = {
  id: "unit-09",
  title: "What Is Kept",
  period: "Period 9 · 1980–present",
  description:
    "How a country that had spent forty years arguing about what a government owed its citizens spent the next forty deciding it owed them less — closing the mills that had paid for the argument, winning a cold war it had organised itself around, and rewriting the terms of work, welfare and belonging — while the record of all of it moved off paper and onto film, disk and a network, into the custody of whoever happened to be holding it when the question was asked.",
  centralQuestion:
    "Nearly everything you can find out about the last forty years survives because somebody decided to keep it, and nearly everything you cannot is gone because somebody decided not to — or because nobody decided anything at all. Who holds the record of this period, and what do they have to tell you?",
  // Two unit-level Archive Challenges, the pair Units 3 through 8 carry: the SAQ works from a
  // single stimulus, the DBQ from seven documents. Both are reached from the Archive Terminal in
  // the Archive Room, never from a case — see the Mission vs. Archive Challenge split in CLAUDE.md.
  archiveChallenges: [
    { questType: "saq", questId: "unit-09-archive-a-country-of-arrivals-saq" },
    { questType: "dbq", questId: "unit-09-archive-the-size-of-government-dbq" },
  ],
  cases: [
    {
      id: "case-025",
      shortTitle: "Furnace Bend",
      title: "Permission of the Donor",
      date: "1998",
      // A composite valley city in north-eastern Ohio — see this file's header for why this map is
      // invented where Ellis Island was not.
      mapPosition: { lat: 41.05, lon: -80.95 },
      location: "Furnace Bend State University, Ohio · October 1998",
      question:
        "Three things in this building are shut to you. One has to say how much it is withholding and under which numbered exemption, and gives you thirty days to appeal. One says nothing at all and can be appealed to nobody. And one is not shut — it is simply the wrong copy, and it is the copy everybody uses. Which is the strongest lock, and who put it there?",
      mechanic: "Field Investigation",
      route: "field",
      summary:
        "Walk a campus quadrangle, a reading room and the processing room beneath it, twenty years after the works at the bottom of the hill went cold — and recover seven records that between them show how the history of one valley came to be held by a library, a federal agency and a dissolved corporation's successor, each on different terms and only one of them obliged to say why.",
      // KC 9.2 (the technological, economic and demographic changes of the late twentieth century,
      // reached here through deindustrialisation and through the transformation of the record
      // itself). Themes: WXT (the industrial economy and what replaced it), PCE (who may decide what
      // the public sees), GEO (a valley organised around one works).
      ced: { period: 9, keyConcepts: ["9.2"], themes: ["WXT", "PCE", "GEO"] },
    },
    {
      id: "case-026",
      shortTitle: "Sixteen Years",
      title: "Sixteen Years",
      date: "1964–1981",
      // The Cow Palace in Daly City, where the losing convention was held.
      mapPosition: { lat: 37.7061, lon: -122.4658 },
      location: "The Cow Palace, Daly City, California · July 1964",
      question:
        "In November 1964 the Republican candidate carried six states and lost forty-four. In November 1980 the Republican candidate carried forty-four. The conventions that nominated them were held exactly sixteen years apart, in July. Put the years between them in order, and say what was actually being built.",
      mechanic: "Sequencing",
      // A non-map mission. Sequencing, because the whole difficulty of the conservative turn is that
      // its causes are usually taught in the wrong order — as things a president did, rather than as
      // the movement that produced the president.
      route: "mission",
      summary:
        "Order seven developments between the Goldwater nomination and the first year of the Reagan administration and work out which of them made the others possible — a hand-copied mailing list, a proposed tax rule about schools, a ballot proposition and a strike among them.",
      archiveChallenge: {
        questType: "sequencing",
        questId: "case-026-mission-how-a-majority-was-built",
      },
      // KC 9.1 (the growth of a new conservatism in American culture and politics). Themes: PCE, NAT
      // (what the movement said the country was), ARC (the churches, schools and suburbs the
      // organising actually ran through).
      ced: { period: 9, keyConcepts: ["9.1"], themes: ["PCE", "NAT", "ARC"] },
    },
    {
      id: "case-027",
      shortTitle: "The Archives Opened",
      title: "The Archives Opened",
      date: "1983–1992",
      // Moscow, where the flag came down on 25 December 1991 and where the reading rooms opened the
      // following spring.
      mapPosition: { lat: 55.752, lon: 37.6175 },
      location: "Moscow · 25 December 1991",
      question:
        "Every explanation of why the Cold War ended was written before anybody could check it. Then the archives on the other side opened and the same events had to be argued again with the papers on the table. Sort what a historian can actually establish from each of these records — and say what changed when the evidence did.",
      mechanic: "Evidence Organizing",
      // A non-map mission. Evidence-organizing, because the honest answer here is not a claim but a
      // question about which evidence you are holding — which is this unit's own question, put to
      // the largest closed archive of the twentieth century in the year it opened.
      route: "mission",
      summary:
        "Match six records of the last decade of the Cold War to the historical-thinking skill each one actually demonstrates, then explain what an American speech and the Soviet president's resignation address each establish that the other cannot.",
      archiveChallenge: {
        questType: "evidence-organizing",
        questId: "case-027-mission-what-the-opening-changed",
      },
      // KC 9.3 (the end of the Cold War and the redefinition of the American role in the world).
      // Themes: WOR, PCE, WXT (the economy that was the argument's real subject on both sides).
      ced: { period: 9, keyConcepts: ["9.3"], themes: ["WOR", "PCE", "WXT"] },
    },
  ],
};

// Record Reconstruction lanes for case-025. Three, and like Units 4 through 8's they are arguments
// rather than topics. Every record on this map is a piece of one valley's history, and the question
// that organises them is not what each is about — it is which of three things had to happen for it
// to be on the table at all. Something was written; something decided it would still exist in 1998;
// something decides whether you may look at it. Asking a student which of the three a given record
// is evidence *of* is the sort that makes a retention schedule legible as a historical source rather
// than as office furniture.
export const CASE_025_LANES = [
  { id: "what-the-record-says", label: "What the record says" },
  { id: "what-decided-it-survived", label: "What decided it survived" },
  { id: "who-decides-who-reads-it", label: "Who decides who reads it" },
];

export const CASE_025_SOURCES = [
  {
    id: "campus-deed-of-gift",
    type: "Reconstructed record · Instrument of gift transferring a corporate archive to a university library, with the restrictions endorsed on it",
    title: "Deed of Gift, the Vance Steel Corporation Records",
    creator:
      "Counsel for the successor company and the University Librarian, executed in duplicate and filed with the collection",
    date: "14 June 1994",
    record: "Two signatures, five numbered paragraphs, and the paragraph that decides everything",
    visual: "context",
    // Takes the INTERVIEW when Unit 9's activities are authored. Null until then: a route may
    // only name an engine once there is an activity behind it, and `validate:content` fails if
    // there is not.
    activityRoute: null,
    excerpt:
      "AGREEMENT made this fourteenth day of June, 1994, between VANCE HOLDINGS, INCORPORATED, successor by merger to the Vance Steel Corporation (the “Donor”), and the BOARD OF TRUSTEES OF FURNACE BEND STATE UNIVERSITY, on behalf of the Whitmore Library (the “Library”). — 1. TRANSFER OF TITLE. The Donor gives, transfers and delivers to the Library all right, title and interest in and to the records described in the appended schedule, comprising approximately one thousand four hundred and eighty linear feet, together with such further material as the Donor may hereafter deliver. — 2. COPYRIGHT. The Donor retains such copyright as it may hold in the said records and does not convey the same, and reserves the right to require that any publication reproducing more than a brief extract be submitted to it in advance. — 3. ACCESS. Series 1 through 5 shall be open to research use upon completion of processing. Series 6, comprising personnel, payroll and medical records of employees, shall be closed for a period of seventy-five years from the date of creation of each record. Series 7, comprising the files of the Office of the President and of the Executive Committee for the years 1974 to 1982, shall be closed to research use except upon the written permission of the Donor or the Donor's designee, which permission may be granted or withheld at the Donor's sole discretion and without statement of reason. — 4. DISPOSITION. Material which the Library in its sole judgment determines to be without permanent research value may be returned to the Donor or destroyed. — 5. This Agreement shall bind and enure to the benefit of the successors and assigns of both parties.",
    prompt:
      "Read paragraph 3 twice — once for what it closes, and once for what it never has to say. Then set it beside the agency's letter on the reading-room table: one of those two locks must give a numbered reason and one need give none. Say which is the stronger, and why it is the one nobody voted on.",
    feedback:
      "Institute Context: a deed of gift is the ordinary instrument by which a private archive reaches a public library, and every clause here is standard. Title passes; copyright usually does not, which is why a researcher may read a letter and still not print it. The seventy-five-year closure on Series 6 is professional practice and it protects people — payroll and medical files of workers who were alive in 1994 — and no responsible archivist would take the collection without it. Paragraph 4 is standard too, and it is the paragraph that quietly makes the Library the appraiser of its own holdings. Series 7 is the one to argue about, and notice what it is: the years 1974 to 1982 are the years in which the decision to close the works was taken, and the key to them is held by the party that took it. Now compare the two instruments in this building. The Freedom of Information Act's exemptions are numbered, must be cited at the point of deletion, carry a thirty-day administrative appeal, and can be tested in a district court that may read the withheld material in chambers. This paragraph has no number, no reason, no appeal, no deadline and no forum — and it binds successors and assigns, so the company that signed it need not still exist. Nobody here broke a rule and nobody here is concealing anything. The strongest lock in the building is a private contract, and the only reason it is not the largest scandal in the building is that without it the whole one thousand four hundred and eighty feet would have gone into a skip in 1994. That is the trade, and it is not obviously the wrong one.",
    citation:
      "Composite record reconstructed for Chronicle from the standard form of American deeds of gift for archival collections — the transfer of title, the reservation of copyright, a term closure on personnel and medical series, a donor-permission clause and a disposition paragraph are all conventional — and is not a transcription of a single surviving agreement. On the instrument and its clauses see the Society of American Archivists, A Guide to Deeds of Gift, and the SAA Dictionary of Archives Terminology, s.v. “deed of gift”; on the professional expectation that restrictions be limited in time and scope and that restricted material still be described, see Describing Archives: A Content Standard (Chicago: Society of American Archivists) and the SAA Core Values and Code of Ethics.",
    externalUrl: "https://dictionary.archivists.org/entry/deed-of-gift.html",
    reconstruction: "who-decides-who-reads-it",
  },
  {
    id: "campus-foia-response",
    type: "Reconstructed record · Agency determination on a request under the Freedom of Information Act, with two of the released pages",
    title: "Response to Request No. 97-0412",
    creator:
      "The Freedom of Information Officer of the Economic Development Administration, United States Department of Commerce",
    date: "12 February 1998",
    record: "A covering letter, two released pages, and eleven bracketed deletions",
    visual: "context",
    // Takes the ASSEMBLY when Unit 9's activities are authored; null until then, as above.
    activityRoute: null,
    // Gated behind the coalition's own published summary for the reason Unit 7 gated its board
    // minute behind the manifest and Unit 8 its appraisal behind the deed: the ASSEMBLY asks a
    // player to rebuild deleted passages of an application, and the only honest way to do that is
    // from what the applicant said in public. Without the gate the board is a guessing game.
    requiresSourceId: "campus-community-ownership-proposal",
    excerpt:
      "This responds to your request of 3 September 1997 for all records concerning Application No. 80-114, submitted by the Valley Community Steel Committee. A search of the Office of Public Works and of the Office of the General Counsel located 1,214 pages responsive to your request. Of these, 806 pages are released in full, 271 pages are released in part, and 137 pages are withheld in full. Deletions have been made under Exemption 4, 5 U.S.C. § 552(b)(4), protecting trade secrets and commercial or financial information obtained from a person and privileged or confidential; under Exemption 5, § 552(b)(5), protecting inter-agency and intra-agency memoranda which would not be available by law to a party in litigation with the agency; and under Exemption 6, § 552(b)(6), protecting information the disclosure of which would constitute a clearly unwarranted invasion of personal privacy. The amount of the information deleted and the exemption under which each deletion is made are indicated at the place in the record where the deletion is made. You may appeal this determination in writing within thirty days. — RELEASED PAGE 0417. APPLICATION NARRATIVE, PART III: PROPOSED OPERATIONS. The Committee proposes to acquire the Furnace Bend Works and to operate [DELETED — 46 characters — (b)(4)] under a corporation chartered in this State, the stock of which shall be held [DELETED — 118 characters — (b)(4)]. Employment in the first full year of operation is projected at [DELETED — 5 characters — (b)(4)], rising to [DELETED — 5 characters — (b)(4)] in the third year, against present employment at the site of nil. — RELEASED PAGE 0902. MEMORANDUM FOR THE ASSISTANT SECRETARY. Subject: Application No. 80-114 — recommendation. [DELETED — 1,908 characters — (b)(5)] The staff is accordingly unable to recommend approval upon the record as presented. [DELETED — 604 characters — (b)(5)] Concurrence: Office of the General Counsel, no legal objection. Signed, [DELETED — 21 characters — (b)(6)], Deputy Assistant Secretary.",
    prompt:
      "Every deletion on these two pages tells you three things and hides a fourth. Say what the bracket counts and the exemption numbers let you establish about page 0417 and about page 0902 — and then say the one thing a historian still cannot do with either of them.",
    feedback:
      "Institute Context: the Freedom of Information Act (1966, in force from July 1967) makes agency records available on request and then takes nine categories back out. Two of the three cited here are worth reading closely, because they protect opposite parties. Exemption 4 covers commercial or financial information “obtained from a person” — that is, from the applicant. Every figure blacked out on page 0417 is the Committee's own, withheld to protect the Committee, which is why a citizen cannot read employment projections that a citizens' committee published in summary form the same year. Exemption 5 protects the agency's own reasoning: the 1,908 characters before the recommendation are the argument, and in 1998 nothing in the statute put any time limit on that privilege — Congress did not add one, of twenty-five years, until 2016. The mechanics on the page are recent history in their own right. The 1974 amendments, passed over a presidential veto after Watergate, gave the courts power to inspect withheld material in chambers. The 1986 reform required an agency to say how much it had taken out. And the Electronic Freedom of Information Act Amendments of 1996 added the words that make this page readable at all: where technically feasible, the amount deleted and the exemption under which it was deleted must be shown at the place in the record where the deletion is made. A page released in 1985 would have been a wall of black. What you still cannot do is the important part. A bracket count establishes a length, not a sentence; a concurrence establishes that counsel saw no legal objection, not that anyone agreed; and nothing here tells you what the deciding official believed, because the only sentence that would is the one behind the (b)(5). This is the weakest lock in the building — numbered, appealable within thirty days, reviewable by a judge — and it is the only one on this map obliged to explain itself.",
    citation:
      "Composite record reconstructed for Chronicle from the standard form of a Freedom of Information Act determination letter and from released pages of federal grant and loan-guarantee application files; the application, the applicant and the file number are invented, and this is not a transcription of a single surviving release. The statute is 5 U.S.C. § 552 and the nine exemptions are at § 552(b). The in camera review provision follows the Freedom of Information Act Amendments of 1974 (Pub. L. 93-502, enacted over President Ford's veto); the requirement to indicate the amount of information deleted follows the Freedom of Information Reform Act of 1986; the requirement to indicate the amount and the exemption at the place in the record, and the twenty-working-day response period, follow the Electronic Freedom of Information Act Amendments of 1996 (Pub. L. 104-231). The twenty-five-year limit on Exemption 5 follows the FOIA Improvement Act of 2016 (Pub. L. 114-185) and is later than this record.",
    externalUrl: "https://www.justice.gov/oip/freedom-information-act-5-usc-552",
    reconstruction: "who-decides-who-reads-it",
  },
  {
    id: "campus-two-editions",
    type: "Reconstructed record · One newspaper page in two states, with the filming target and the scanning log that lie between them",
    title: "The Sentinel for 26 September 1979, Twice",
    creator:
      "The composing room of the Furnace Bend Sentinel; a commercial micrographics service under contract to the State Library; the Whitmore Library's scanning station",
    date: "1979 · 1974–1981 · 1997",
    record: "A brittle clipping in a folder, and a screen showing the same page",
    visual: "context",
    // Takes the TRACE when Unit 9's activities are authored; null until then, as above.
    activityRoute: null,
    excerpt:
      "CLIPPING, MANILA FOLDER, VALLEY COMMUNITY STEEL COMMITTEE PAPERS, BOX 3, FOLDER 11. — The Furnace Bend Sentinel, Wednesday, 26 September 1979, HOME EDITION, page one. VANCE TO CLOSE FURNACE BEND WORKS; 3,600 JOBS TO GO BY MARCH. “…Asked at the No. 2 gate last night whether the corporation had considered a sale of the works to its employees, the plant manager said that no proposal had been received and that the corporation ‘would of course entertain any serious offer.’” A two-column halftone shows men of the eleven o'clock turn reading the notice posted at the gate. — DIGITAL FILE, VALLEY HISTORY PAGES, IMAGE 0009 OF REEL 47. The Furnace Bend Sentinel, Wednesday, 26 September 1979, FINAL EDITION, page one. Same headline, same take, one paragraph shorter. The paragraph containing the words “would of course entertain any serious offer” is not present. Where the halftone stood there is a three-column advertisement for a savings and loan. — TARGET FRAME PRECEDING REEL 47. FILMED FOR THE STATE LIBRARY, 1974–1981. FILE COPY SUPPLIED BY THE PUBLISHER. ORIGINALS NOT RETAINED. — SCANNING LOG, WHITMORE LIBRARY, 1997. Reel 47 scanned from film at 300 dpi bitonal; 1,240 images; six frames rescanned for density; halftone areas noted illegible at this setting, not rescanned; posted to the Valley History pages October 1997.",
    prompt:
      "The same page, the same date, the same headline, and one paragraph apart. Follow it from the composing room to the screen, say at which step the sentence stopped being reachable — and then say who decided to lose it.",
    feedback:
      "Institute Context: the answer to the second question is nobody, and that is the finding. A daily in 1979 printed several editions and reset page one between them; a paragraph is cut for an advertisement in the ordinary course of an evening. Libraries filmed newspapers from about the 1930s onward because newsprint destroys itself, and the copy filmed was normally the publisher's own file copy — one edition, usually the last. Once the film existed the bound originals were routinely discarded, which is what the target frame is telling you in five words. And a 1990s scanning project worked from the film rather than from paper, at one bit per pixel, because that is what made the text searchable and the files small enough to serve — which renders a halftone photograph as a grey smear and a solid black block by turns. Four defensible operational decisions, made by four people doing their jobs properly, not one of them about this sentence; and the result is that the only surviving evidence that the corporation said in public it would entertain an offer is a brittle clipping in one folder in one box, while the copy any student in the world can reach in 1998 does not contain it. Set that beside the deed of gift and the agency's letter. A restriction can at least be argued with, because somebody imposed it. This cannot, because nobody did — and it is the most effective of the three.",
    citation:
      "Composite record reconstructed for Chronicle from documented newspaper-preservation practice and is not a transcription of a single surviving page. Multiple daily editions with page-one resets, microfilming from a publisher's file copy, the discarding of bound originals after filming, and bitonal scanning from film with halftone loss are all standard practice of the periods given; on the filming programmes and the fate of the originals see Nicholson Baker, Double Fold: Libraries and the Assault on Paper (New York: Random House, 2001), and on digitisation from microfilm and its inherited defects see the Library of Congress's National Digital Newspaper Program technical guidelines.",
    externalUrl: "https://www.loc.gov/collections/chronicling-america/about-this-collection/",
    reconstruction: "what-decided-it-survived",
  },
  {
    id: "campus-gate-notice",
    type: "Reconstructed record · Notice to employees posted at a works gate",
    title: "Notice Posted at No. 2 Gate",
    creator: "The office of the Plant Manager, Furnace Bend Works, Vance Steel Corporation",
    date: "25 September 1979",
    record: "Eight lines on company letterhead, taken down by somebody and kept",
    visual: "context",
    activityRoute: null,
    excerpt:
      "TO ALL EMPLOYEES. The Corporation announces that operations at the Furnace Bend Works will be permanently discontinued in stages, commencing 1 December 1979 and concluding not later than 31 March 1980. Employees will be advised individually of the date upon which their employment will terminate. Questions concerning pension and insurance entitlements will be answered at the Employment Office between the hours of eight and four. The Corporation regrets the necessity of this action, which is required by conditions in the industry over which it has no control. — Posted by order of the Plant Manager, 25 September 1979.",
    prompt:
      "This is the entire notice, and it is the entire notice on purpose. Say what a man reading it at the gate at eleven o'clock at night could find out, what he could not, and what the law at that date required the Corporation to tell him.",
    feedback:
      "Institute Context: the law at that date required nothing. In September 1979 no federal statute obliged an employer to give any advance notice whatever of a plant closing, and most collective agreements did not either. The Worker Adjustment and Retraining Notification Act — sixty days' written notice of a closing or mass layoff by employers of a hundred or more — was nine years away; it passed in 1988 and became law on 4 August without the President's signature, taking effect in February 1989. So this notice is not a legal minimum being met. It is a courtesy, and its three months are more than the period later required. Read what it does and does not establish. It establishes the dates, the sequence and the department that will answer questions, and every one of those is checkable. It establishes nothing whatever about the reasons: “conditions in the industry over which it has no control” is a sentence with no author, no figure and no decision in it, and the papers that would supply all three are in Series 7 of the collection upstairs, closed until the Donor says otherwise. When the workers at a comparable works sued to stop a closing, the argument they made was that a community's long reliance on a mill had created something the law ought to recognise as a property right; the district judge said in open court that he believed something like that had indeed arisen, then held that he could find no law under which to enforce it, and the court of appeals affirmed the dismissal — Local 1330, United Steel Workers v. United States Steel Corp. (6th Cir. 1980). The notice at the gate and that judgment are the two ends of the same fact.",
    citation:
      "Composite record reconstructed for Chronicle from plant-closing notices to employees of the period and is not a transcription of a single surviving notice. The absence of any federal advance-notice requirement in 1979 and the terms of the later statute follow the Worker Adjustment and Retraining Notification Act of 1988 (Pub. L. 100-379), effective 4 February 1989; the litigation described is Local 1330, United Steel Workers of America v. United States Steel Corp., 631 F.2d 1264 (6th Cir. 1980), affirming 492 F. Supp. 1 (N.D. Ohio 1980).",
    externalUrl: "https://www.dol.gov/agencies/eta/layoffs/warn",
    reconstruction: "what-the-record-says",
  },
  {
    id: "campus-community-ownership-proposal",
    type: "Reconstructed record · Summary of a feasibility study circulated in support of an application for a federal loan guarantee",
    title: "A Community Steel Company: Summary of the Feasibility Study",
    creator:
      "The Valley Community Steel Committee, with an economic research organisation retained by it",
    date: "January 1980",
    record: "Twenty-six mimeographed pages of a study of two hundred, run off for the churches",
    visual: "context",
    activityRoute: null,
    excerpt:
      "THE PROPOSAL IN BRIEF. — That the Furnace Bend Works be acquired from the Corporation and operated by a company chartered in this State, the stock of which is to be held one third by the employees through a trust, one third by a community corporation whose directors are elected by the parishes, unions and townships of the valley, and one third by the lending institutions. — THAT the finishing mills, which are sound, be operated from the first quarter, and the open-hearth shop, which is not, be replaced by electric furnaces and a continuous caster in the third year. — THAT the capital required is estimated at five hundred and twenty-five million dollars, of which the Committee asks the United States to guarantee three hundred, the remainder to be raised in the valley and in the private market. — THE ARGUMENT. It is not disputed that the works as presently equipped cannot earn a return. It is disputed that this is a fact about the valley rather than a fact about twenty years of capital being taken out of these mills and placed in other industries by a corporation which is under no obligation to explain itself and has not. The Committee does not ask for a gift. It asks the Government to lend its credit to an industrial investment, which the Government does continually, and to say plainly, if it will not, upon what principle it chooses the industries whose credit it lends.",
    prompt:
      "This is the document the agency's file upstairs is about, and it is the part the release did not delete. Say what the Committee was asking the federal government to do — and then say what it was asking the government to admit.",
    feedback:
      "Institute Context: the real campaign this reconstructs is the Ecumenical Coalition of the Mahoning Valley, formed in Youngstown, Ohio, in the weeks after 19 September 1977 — “Black Monday,” when Youngstown Sheet and Tube announced the closing of its Campbell Works and about five thousand jobs went in a single announcement. The Coalition was led by Catholic and Episcopal bishops, took technical advice from the National Center for Economic Alternatives, and proposed community and worker ownership of the closed works with federal loan guarantees. The proposal was serious, the feasibility study was real work, and the guarantees were refused in 1979. Two things in the argument above are worth separating, because students routinely collapse them. The first is a request: guarantee a loan. The second is a demand for an explanation, and it is the harder one — the federal government did lend and guarantee credit to industry continually, and the Committee is asking it to state the principle by which it selects. The refusal that came back answered the first, and, as the released memorandum shows, kept the second behind Exemption 5. Note also what this record is in the building. It is the only document on this map that argues, and the only one printed for distribution rather than for a file — which is exactly why copies of it survive in three collections while the papers it was arguing with survive in one closed series.",
    citation:
      "Composite record reconstructed for Chronicle from the community-ownership proposals of the late 1970s and from the standard form of a feasibility summary circulated in support of a federal loan-guarantee application; it is not a transcription of a single surviving study. It follows the campaign of the Ecumenical Coalition of the Mahoning Valley (1977-1980) and the feasibility work done for it by the National Center for Economic Alternatives, described in Staughton Lynd, The Fight Against Shutdowns: Youngstown's Steel Mill Closings (San Pedro: Singlejack Books, 1982), and in Sherry Lee Linkon and John Russo, Steeltown U.S.A.: Work and Memory in Youngstown (Lawrence: University Press of Kansas, 2002). The federal records of such applications are in Record Group 378.",
    externalUrl: "https://www.archives.gov/research/guide-fed-records/groups/378.html",
    reconstruction: "what-the-record-says",
  },
  {
    id: "campus-finding-aid",
    type: "Reconstructed record · Finding aid to a processed manuscript collection, with the series descriptions and the restriction notes",
    title: "Finding Aid, the Vance Steel Corporation Records, 1901–1982",
    creator: "The processing archivist, Valley Collections, Whitmore Library",
    date: "Compiled 1995; revised 1996",
    record: "The thirty-page guide that is the only public description of a closed series",
    visual: "context",
    activityRoute: null,
    // Gated behind the deed for a plain reason: this page is the deed's consequence, and a student
    // who reads the consequence first reads Series 7 as an archivist's decision rather than as a
    // clause somebody else wrote in 1994.
    requiresSourceId: "campus-deed-of-gift",
    excerpt:
      "SCOPE AND CONTENT. The records document the operations of the Vance Steel Corporation and its predecessors at four works in the valley, from incorporation in 1901 to the winding up of manufacturing operations in 1982… — SERIES 5. Plant and Departmental Files, Furnace Bend Works, 1901–1980. 214 linear feet. Open. Production reports, maintenance and capital-repair files, safety records, departmental correspondence. — SERIES 6. Personnel, Payroll and Medical, 1901–1982. 470 linear feet. CLOSED for seventy-five years from the date of creation of each record (see Deed of Gift, 14 June 1994). Applications, service cards, injury reports, pension files. — SERIES 7. Office of the President and Executive Committee, 1974–1982. 62 linear feet. CLOSED. Access requires the written permission of the donor (see Deed of Gift, 14 June 1994). Contents include correspondence, minutes of the Board and of the Executive Committee, capital appropriation requests, and studies relating to the future of the Furnace Bend, Riverton and Palmer Street works. — NOTE. The Library is unable to forward requests to the donor and holds no current address for the donor's designee. — SERIES 8. Photographs, 1904–1979. 11 linear feet. Open. Largely unidentified.",
    prompt:
      "A finding aid describes what a collection contains so that somebody who cannot see it can decide whether they need it. Read Series 7's entry and say exactly how much this page tells you, how much it withholds, and what happens to a researcher who follows its instructions.",
    feedback:
      "Institute Context: this page is doing its job, and the job is a hard one. Archival description holds that a closed series must still be described — its extent, its dates, its contents in outline — because concealing the existence of records is a graver failure than restricting them, and because a researcher who knows what is in Series 7 can at least argue for it, cite its absence, or go looking for the other party's copy. So the entry is honest: sixty-two feet, the exact years in which the closure was decided, and a contents list naming board minutes and capital appropriation requests — which is enough to tell you that the answer to the whole question of this map is on that shelf. Then read the note. The permission the deed requires must be sought from a designee whose address the Library does not hold, of a donor dissolved by merger. That is not a policy anybody adopted; it is a clause outliving the party that wrote it, exactly as paragraph 5 provided. And notice the entry underneath. Series 8 is open, eleven feet of photographs, largely unidentified — which is the archive's other permanent condition and the one nobody argues about: the material that is freely available is often the material nobody had time to describe, and those two facts together decide what gets written about this valley far more than any restriction does.",
    citation:
      "Composite record reconstructed for Chronicle from the standard form of an American archival finding aid — scope and content note, series descriptions with extents and inclusive dates, and restriction notes referring to the governing instrument — and is not a transcription of a single surviving guide. The form follows Describing Archives: A Content Standard (Chicago: Society of American Archivists), and the principle that the existence and outline of restricted material should still be described follows the SAA Core Values and Code of Ethics.",
    externalUrl: "https://dictionary.archivists.org/entry/finding-aid.html",
    reconstruction: "who-decides-who-reads-it",
  },
  {
    id: "campus-records-schedule",
    type: "Reconstructed record · General records retention schedule of a state university, with the items in force",
    title: "General Records Retention Schedule, Items 3.02 to 4.19",
    creator:
      "The University Records Officer, adopted by the Board of Trustees on the advice of the State Records Commission",
    date: "Adopted 1991; in force October 1998",
    record: "A table of ninety-one lines that decides what the next century may ask",
    visual: "context",
    activityRoute: null,
    excerpt:
      "ITEM 3.02. Correspondence, academic departments, general. RETENTION: five years, then destroy. — ITEM 3.11. Minutes, standing committees of the Faculty Senate. RETENTION: permanent; transfer to University Archives at the close of the academic year. — ITEM 3.24. Search and appointment files, unsuccessful applicants. RETENTION: three years, then destroy. — ITEM 4.09. Records of sponsored research, financial. RETENTION: seven years from final report, then destroy. — ITEM 4.17. Records of oral-history and community-documentation projects, including tapes, transcripts and release forms. RETENTION: retain until completion of the project; thereafter transfer to the University Archives such material as is selected by the University Archivist; unselected material destroy. — ITEM 4.19. Electronic mail. Electronic mail is a means of transmission and is not a record series. Messages constituting records of the University shall be printed and filed in the appropriate series above; all other messages are retained at the discretion of the account holder. — NOTE. No record listed in this schedule shall be destroyed while it is the subject of a pending public-records request, audit or litigation.",
    prompt:
      "Nothing on this page is a decision about the steelworks, and nobody who signed it was thinking about one. Say what this schedule will have done to the record of the 1990s by the time somebody wants to write about them.",
    feedback:
      "Institute Context: retention schedules are the least-read and most consequential documents in any institution, and this one is entirely ordinary. Most records are destroyed. That is not a scandal, it is the premise of the whole system — nobody can keep everything, so somebody decides in advance, by category and in the abstract, what a class of record is worth, and that decision is executed years later by a clerk who has never read the file. Item 4.17 is the one that should stop a student. An oral-history project that goes and records the men who worked the last turn at the Furnace Bend Works produces tapes and transcripts, and this line says the Archivist selects and the rest is destroyed — so the survival of the only testimony ever taken from those men rests on one person's judgment, exercised once, unreviewed, and recorded nowhere on this page. Item 4.19 is the one a reader in the present should stop at. In 1998 a great many institutions took exactly this position: that electronic mail was a means of transmission rather than a record, to be printed if it mattered and deleted otherwise. The federal courts had already said the opposite of federal agencies — that electronic mail carries information a printout does not, and cannot simply be erased, Armstrong v. Executive Office of the President (D.C. Cir. 1993) — but a state university's schedule is its own, and this is the hole through which most of the decade's actual decision-making left the record. So set this page beside the closed series and the redacted memorandum. Those two withhold from you, and both can be named and argued with. This one is why the argument will often be about nothing: the largest single force deciding what a future historian may ask is not a lock at all, it is a table, and nobody in this building could tell you who wrote it.",
    citation:
      "Composite record reconstructed for Chronicle from state university general records retention schedules of the period and is not a transcription of a single surviving schedule. Its structure — numbered items by function, a stated retention period, a disposition instruction and a litigation hold — follows ordinary American records-management practice as set out in the National Archives and Records Administration's General Records Schedules and the state schedules modelled on them. The treatment of electronic mail as a means of transmission rather than a record series was widespread in the 1990s; the contrary federal holding is Armstrong v. Executive Office of the President, 1 F.3d 1274 (D.C. Cir. 1993).",
    externalUrl: "https://www.archives.gov/records-mgmt/rcs",
    reconstruction: "what-decided-it-survived",
  },
];
