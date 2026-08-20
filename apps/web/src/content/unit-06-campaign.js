// Unit 6 (Period 6: 1865-1898) campaign content — "A Continent on Paper."
//
// Structural mirror of unit-05-campaign.js. Three cases: one Chronotravel destination with a
// walkable map (case-016, a Kansas railhead in 1873), and two missions.
//
// ## The unit is one question asked three times
//
// `THE-MAP-PROGRAM.md` §2 fixes what the field case's interview asks — **who is entitled to be
// here, and on whose paper** — and the two missions are that same question, moved. A historian
// tells the country in 1893 that its formative experience was a frontier that has now closed, and
// a student is asked what that argument is *for*. Two federal statutes then ask it of a person
// rather than a place: barred from entering in 1882, and required in 1892 to carry a certificate
// proving a right to remain. Between the war and the century's end the United States reorganised
// itself around railroads, corporations and recorded title, and the paper that order ran on
// decided who was inside it.
//
// The two missions' topics are an authoring choice rather than a briefed one — the map program
// briefs only the field case for Units 6-9. They were chosen to reach the period's key concepts
// the railhead does not (6.3 migration and the reaction to it, 6.4 the arguments Americans made
// about their own transformation) and to use the two quest types the other five units have each
// used only once. Unit 6 is the first to run `hipp` and `mcq` together. Industrial labour and the
// city are carried by the two Archive Challenges rather than by a third case, which is what those
// are for.
//
// ## The register rule again, and why it is sharper here than in Unit 5
//
// Unit 5 established it: **people the paperwork does not name are named here, speak for
// themselves, and say what is being done to them and what they intend.** This unit inherits it and
// the field case is built on the same silence Richmond was, one document further on.
//
// The Kanza were forced out of Kansas on 4 June 1873, under a bill Congress passed at the urging of
// railroad and town-site speculators, and their reservation was appraised and resold to non-Native
// buyers in tracts of 160 acres. Five of this map's six records are instruments of that transaction
// — a receipt, a survey, a payroll, a tariff, a town's own newspaper — and not one of them is
// *about* it. The sixth is a removal roll, which names 533 people the way a requisition names none:
// as a count with ages set against it.
//
// So the map does what Richmond's did. The paper says a number and a person standing on the street
// says a name. **The map must not treat the West as empty land awaiting settlement**
// (`THE-MAP-PROGRAM.md` §5): the Kanza characters here are present, organised, and in the middle of
// being removed rather than already gone, and they speak first.
//
// ## What these six records are, and are not
//
// The convention Units 4 and 5 set: every source in CASE_016_SOURCES is a **composite document
// reconstructed for Chronicle**, not a transcription of one surviving archival item, and each
// citation says so in its own first sentence. Nobody standing at a Kansas railhead is carrying the
// Dawes Act or Turner's essay; those live in
// content/primary-source-library/unit-06-source-library.js and feed the missions and the Archive
// Challenges below.
//
// **Three of the seven `activityRoute`s name an engine as of Phase 87**, which is the state Units
// 3–5 reached in Phase 81F. `THE-MAP-PROGRAM.md` §2 gives this map slate C, `interview · assembly ·
// trace`, and this file's own earlier revision said it would land on the receipt, the payroll and
// the survey in that order; it did. The other four records stay `null` on purpose — a map has three
// missions, not seven, and the remaining records are read rather than played. A route may only name
// an engine once an activity is authored for that record, because `validate:content` cross-checks
// the two and fails if a route has nothing behind it.
//
// The forms are documentary and the figures are real. The trust-land sale terms follow the act of
// 8 May 1872; the survey follows the General Land Office's rectangular system and its printed
// instructions to deputy surveyors; the freight figures follow the long-haul/short-haul
// discrimination the Granger statutes were passed against and the Supreme Court reviewed in Munn
// and Wabash; the removal figures follow the Kaw agency's own returns. A student who checks any
// number here against the cited work will find it.
//
// ## The date is 1873, and it is load-bearing on four records
//
// Fixed by `THE-MAP-PROGRAM.md` §5 and confirmed by the research that produced the art (decision
// log `0067`). The Kanza leave Kansas in June. The trust-land appraisal made under the 1872 act
// runs its one-year settler-purchase window into that summer, so the land office is open and busy.
// The Panic of 1873 breaks in September, which is why the town is booming on a printed page and
// nervous in a conversation. And the southern-plains buffalo herds are inside the two years of
// their destruction, which is what the freight agent means and does not say.

export const UNIT_06 = {
  id: "unit-06",
  title: "A Continent on Paper",
  period: "Period 6 · 1865–1898",
  description:
    "How a country that had just fought a war over whose labour was whose spent the next thirty years reorganising itself around railroads, corporations and recorded title — settling a continent by survey and statute, building the industrial economy that survey served, drawing millions of people into cities it had not planned for, and arguing without resolution about whether the result was the republic's fulfilment or its capture.",
  centralQuestion:
    "The nation was rebuilt on paper — deeds, patents, tariffs, payrolls, certificates. Who was written into that order, who was written out of it, and who decided which?",
  // Two unit-level Archive Challenges, the pair Units 3, 4 and 5 carry: the SAQ works from a single
  // stimulus, the DBQ from seven documents. Both are reached from the Archive Terminal in the
  // Archive Room, never from a case — see the Mission vs. Archive Challenge split in CLAUDE.md.
  archiveChallenges: [
    { questType: "saq", questId: "unit-06-archive-western-transformation-saq" },
    { questType: "dbq", questId: "unit-06-archive-industrial-order-dbq" },
  ],
  cases: [
    {
      id: "case-016",
      shortTitle: "Cottonwood Junction",
      title: "The Line and the Title",
      date: "1873",
      // The Cottonwood valley of the Flint Hills, east-central Kansas — the country the Kaw
      // diminished reserve adjoins, on the Santa Fe's line up that valley. The town itself is
      // composite, as Riverbend and Canal Crossroads are; the geography is not.
      mapPosition: { lat: 38.37, lon: -96.54 },
      location: "Cottonwood Junction, Kansas · 1873",
      question:
        "A town a railroad company decided should exist, on land a treaty said belonged to somebody else: who is entitled to be here, and on whose paper?",
      mechanic: "Field Investigation",
      route: "field",
      summary:
        "Walk a Kansas railhead in the summer its neighbours are removed — the depot and freight platform, the land office, the telegraph, the graders' camp, the stock pens, the homestead edge and the Kanza village across the line — and recover six records that together show how a continent was transferred by paper.",
      // KC 6.1 (westward migration, the transformation of the West, federal Indian policy) and 6.2
      // (railroads, industrial capital, and the labour that built both). Themes: GEO (land as the
      // thing being surveyed, priced and transferred), MIG (who arrives and who is removed), WXT
      // (the wage, the rate and the title as one economic system).
      ced: { period: 6, keyConcepts: ["6.1", "6.2"], themes: ["GEO", "MIG", "WXT"] },
    },
    {
      id: "case-017",
      shortTitle: "The Frontier Declared Closed",
      title: "The Frontier Declared Closed",
      date: "1893",
      // Chicago — the World's Columbian Exposition, where Turner read the paper in July 1893.
      mapPosition: { lat: 41.79, lon: -87.58 },
      location: "Chicago, Illinois · 1893",
      question:
        "Three years after the Census announced there was no longer a frontier line, a young historian told America what the frontier had made it. Read his argument as a source rather than as a conclusion — and work out what it is for.",
      mechanic: "Source Analysis (HIPP)",
      // A non-map mission. HIPP on one document, and the document is a *historian's* argument
      // rather than a participant's, which is the point. Every other HIPP in the game analyses
      // somebody inside the events; this one analyses somebody explaining them, twenty years after
      // the field case and to an audience standing in a fairground built to celebrate the result.
      route: "mission",
      summary:
        "Work Frederick Jackson Turner's frontier thesis through historical situation, intended audience, purpose and point of view — and account for the continent's existing inhabitants, whom the argument requires to be absent.",
      archiveChallenge: {
        questType: "hipp",
        questId: "case-017-mission-frontier-thesis-hipp",
      },
      // KC 6.1 (the West, and how Americans narrated it) and 6.4 (intellectual and cultural
      // movements). Themes: ARC (the story a culture tells about itself), GEO, NAT.
      ced: { period: 6, keyConcepts: ["6.1", "6.4"], themes: ["ARC", "GEO", "NAT"] },
    },
    {
      id: "case-018",
      shortTitle: "The Certificate of Residence",
      title: "The Certificate of Residence",
      date: "1882–1893",
      // San Francisco, where exclusion was argued hardest and enforced first.
      mapPosition: { lat: 37.77, lon: -122.42 },
      location: "The United States · 1882–1893",
      question:
        "In 1882 the United States barred a nationality from entering. Ten years later it required those already lawfully here to carry paper proving it, on pain of removal. Read both statutes and work out what changed between them.",
      mechanic: "Evidence Review",
      // A non-map mission, and one stimulus question rather than a set — an `mcq` mission is a
      // single carefully built comparison, the shape case-009 established. It is the closest
      // rhyme in the game to this unit's own field case: a person's right to be somewhere,
      // evidenced by a slip of paper issued by an office, and the same question asked of a
      // Chinese labourer in San Francisco that the receiver's receipt asks of a quarter-section
      // in Kansas.
      route: "mission",
      summary:
        "Compare the Chinese Exclusion Act with the Geary Act's certificate of residence, and explain what changes when lawful presence stops being a status a person has and becomes a document they must produce.",
      archiveChallenge: {
        questType: "mcq",
        questId: "case-018-mission-certificate-of-residence",
      },
      // KC 6.2 (industrial labour, in whose name exclusion was argued) and 6.3 (migration to the
      // United States and the reaction against it). Themes: MIG, NAT, PCE.
      ced: { period: 6, keyConcepts: ["6.2", "6.3"], themes: ["MIG", "NAT", "PCE"] },
    },
  ],
};

// Record Reconstruction lanes for case-016. Three, and like Units 4 and 5's they are arguments
// rather than topics. This district's evidence is almost entirely instruments — a receipt, a
// survey, a payroll, a tariff, a roll, a newspaper — and an instrument does exactly three things:
// it confers something, it prices something, and it leaves somebody out. Asking a student which of
// the three a given form is doing is a sourcing exercise disguised as a sort.
export const CASE_016_LANES = [
  { id: "what-the-paper-grants", label: "What the paper grants" },
  { id: "what-the-rate-decides", label: "What the rate decides" },
  { id: "who-the-paper-leaves-out", label: "Who the paper leaves out" },
];

export const CASE_016_SOURCES = [
  {
    id: "railhead-land-office-receipt",
    type: "Reconstructed record · United States land office receiver's receipt",
    title: "Receiver's Receipt, Kaw Trust Lands",
    creator: "The receiver of the district land office",
    date: "June 1873",
    record: "The slip handed back across the counter when a tract has been paid for",
    visual: "context",
    activityRoute: "interview",
    excerpt:
      "UNITED STATES LAND OFFICE. — RECEIVER'S RECEIPT, No. 1,412. Received of the person named below the sum endorsed hereon, being in full for the north-east quarter of section twenty-one, in township eighteen south, of range eight east of the sixth principal meridian, containing one hundred and sixty acres, sold this day at public sale under the act of Congress approved the eighth of May, eighteen hundred and seventy-two, providing for the appraisement and sale of the trust lands and the diminished reserve of the Kansas or Kaw tribe of Indians. Sold to the highest bidder, for cash, no tract exceeding one hundred and sixty acres. The proceeds of this sale, less the expenses thereof, to be placed to the credit of the said tribe. Patent to issue in due course. Purchaser will preserve this receipt: it is his only evidence of title until the patent is delivered. — RECEIVER.",
    prompt:
      "Read the two sentences about money. Somebody pays cash, and somebody else is to be credited with the proceeds. Name both parties — and then say where the second one is, in June of 1873, and what that does to the word “sale.”",
    feedback:
      "Institute Context: the act of 8 May 1872 provided for a commission to appraise both the Kaw “trust lands” and the “diminished reserve” in Kansas. Settlers already living on the trust lands were given one year from appraisal to buy 160 acres each; everything unoccupied went at public auction, for cash, in tracts of not more than 160 acres, with the proceeds credited to the tribe's account in the Treasury. Every clause of that is on this slip. The clause that is not on it is where the tribe was. The Kanza left the agency at Council Grove on 4 June 1873 for a reserve in Indian Territory 160 miles south, having protested the removal to the last, and the bill authorising it was pushed by railroad and town-site interests who wanted the land in the market. So the document records a genuine transaction — money really was paid, and really was credited — conducted in the absence of the party being credited, on ground they were leaving under compulsion as the auction was advertised. That is not a forgery to be exposed. It is a legal instrument working exactly as designed, and the design is the finding.",
    citation:
      "Composite record reconstructed for Chronicle from the printed receiver's-receipt forms of the General Land Office and the terms of the act of 8 May 1872; it is not a transcription of a single surviving document. The appraisement commission, the settlers' one-year purchase window, the 160-acre cap, the cash-to-highest-bidder auction and the crediting of proceeds to the tribe follow that act; the removal date and the pressure behind the bill follow William E. Unrau, The Kansa Indians: A History of the Wind People, 1673–1873 (Norman: University of Oklahoma Press, 1971).",
    externalUrl: "https://www.kawnation.gov/the-kanza-people/",
    reconstruction: "what-the-paper-grants",
  },
  {
    id: "railhead-construction-payroll",
    type: "Reconstructed record · railroad construction department pay sheet",
    title: "Time Check and Pay Sheet, Construction Department",
    creator: "The division paymaster's clerk",
    date: "July 1873",
    record: "The month's sheet for one grading section, and the paper a man is paid in",
    visual: "context",
    activityRoute: "assembly",
    excerpt:
      "CONSTRUCTION DEPARTMENT. — PAY SHEET, SECTION 4, GRADING. Rate allowed, one dollar and seventy-five cents the day; the day to be reckoned from the whistle at six to the whistle at six, dinner not counted. Days worked, 26. GROSS, forty-five dollars and fifty cents. — DEDUCTIONS. Board at the company boarding car, three dollars the week, four weeks, 12.00. Blankets and slicker, issued, charged, 4.50. Shovel and pick, charged on issue, credited on return in good order, 2.25. Store account, order book No. 3, 9.80. Doctor, one half of one per cent, 0.23. Hospital fund, 0.25. TOTAL DEDUCTIONS, 29.03. — BALANCE, sixteen dollars and forty-seven cents, PAYABLE IN TIME CHECK at the company's office at the close of the quarter, or discounted for cash at the store at the rate current there. — No advance of wages will be made. Men leaving before the completion of the section forfeit the unpaid balance.",
    prompt:
      "The rate is printed at the top of the sheet and the money is at the bottom. Work out what fraction of the advertised rate the man actually receives, and in what form he receives it. Then go through the six deductions and say which of them he was in a position to refuse.",
    feedback:
      "Institute Context: nothing on this sheet is illegal and nothing on it is unusual. Construction crews were boarded by the company in cars alongside the grade, outfitted from the company store on credit, doctored by a company surgeon paid for by a compulsory levy, and paid not in money but in a time check redeemable at the office at the end of the quarter — or, today, for cash at the store, at a discount the store set. The forfeiture clause is what holds the whole arrangement together: a man who walks off loses the balance he has already earned. Two things follow. The advertised rate of $1.75 a day is a real number that describes almost nothing, because board, outfit, tools, medicine and the discount on his own wages are all taken out of it before he touches it; and every one of those deductions is paid to the same company that set the rate. This is what the period's labour organisations meant by “wage slavery,” a phrase easy to dismiss as rhetoric until you follow one month's arithmetic. The Panic of September 1873 made it sharper still: when eastern credit failed, time checks were discounted harder, and a man's month of work was worth whatever the store said it was.",
    citation:
      "Composite record reconstructed for Chronicle from the form of railroad construction pay sheets and time checks; it is not a transcription of a single surviving document. Boarding cars, company-store order books, compulsory hospital and doctor levies, quarter-end time checks discounted for cash, and forfeiture of unpaid balances follow Walter Licht, Working for the Railroad: The Organization of Work in the Nineteenth Century (Princeton: Princeton University Press, 1983).",
    externalUrl:
      "https://www.loc.gov/collections/railroad-maps-1828-to-1900/articles-and-essays/history-of-railroads-and-maps/",
    reconstruction: "what-the-rate-decides",
  },
  {
    id: "railhead-survey-field-book",
    type: "Reconstructed record · deputy surveyor's field notes, General Land Office",
    title: "Field Notes, Township 18 South, Range 8 East",
    creator: "A deputy surveyor under contract to the Surveyor General",
    date: "1873, returning a line first run in 1859",
    record: "The bound field book a contract surveyor returns with his plat",
    visual: "context",
    activityRoute: "trace",
    // The audit chain reads the land office's own instrument, so the receipt has to have been
    // recovered first. Same shape as Riverbend's letter, Canal Crossroads' time book and
    // Richmond's requisition — and it decides which mission can be last, which is what `arcClose`
    // is authored against. See the header on unit-06-activities.js.
    requiresSourceId: "railhead-land-office-receipt",
    excerpt:
      "FIELD NOTES OF THE SUBDIVISION OF TOWNSHIP 18 SOUTH, RANGE 8 EAST OF THE SIXTH PRINCIPAL MERIDIAN. — Variation 11° 30' east. Commencing at the quarter-section corner between sections 20 and 21, I run North on a random line. — 12.20 chains, enter timber, bearing north. 26.50, cross a branch 8 links wide, running south-east. 40.00 chains, set a sandstone 20 by 8 by 6 inches, marked with six notches, for the quarter corner, from which a burr oak 14 inches diameter bears N. 42° W. 31 links, and an elm 9 inches bears S. 18° E. 24 links. — Land rolling, second rate; soil black loam; timber burr oak, elm, hackberry. — NOTE BY THE DEPUTY. The line here run and marked is the north boundary of the diminished reserve as that boundary is described by course and distance in the treaty. The line run in 1859 by the deputy under the previous contract, and shown on the plat of record in this office, lies thirty-three chains and sixty links to the south of it. I have run the treaty line, have marked it, and report both. The tracts lying between the two lines are returned herewith as unsurveyed.",
    prompt:
      "Two surveyors ran the same boundary fourteen years apart and put it in two different places. Find the distance between their lines and convert it out of chains. Then take out the receipt you are carrying, read the tract it describes, and say what the land office did with the ground between the two lines.",
    feedback:
      "Institute Context: this is the single most useful document on the map, and the reason is that nobody on it is lying. The rectangular survey is how the United States turned territory into property: a deputy surveyor under contract runs lines by compass and chain, marks corners with stone and bearing trees, returns his field book and plat, and only then can the land office sell, patent or tax anything inside them. A chain is 66 feet, so thirty-three chains and sixty links is 2,217 feet — a strip about two-fifths of a mile deep running the width of a township. The 1859 deputy ran a line and it went on the plat of record; patents issued from that plat; taxes were assessed from it; and this deputy, running the boundary as the treaty text actually describes it, finds it somewhere else and says so in writing. The honest finding is not that somebody cheated. It is that a treaty boundary existed in two incompatible legal forms at once — a description in a treaty and a line on a plat — and that the second one governed because it was the one the office could sell from. Surveys were the instrument of dispossession far more often than fraud was, precisely because they were competent, routine and reviewable.",
    citation:
      "Composite record reconstructed for Chronicle from the form of General Land Office deputy surveyors' field notes; it is not a transcription of a single surviving document. The random-and-corrected line method, magnetic variation, chain-and-link distances, sandstone corners with bearing trees, land-quality classification and the deputy's obligation to report discrepancies follow the GLO's printed instructions to deputy surveyors and C. Albert White, A History of the Rectangular Survey System (Washington: Government Printing Office, 1983). The 1846 treaty boundary and its later disputes follow Unrau, The Kansa Indians.",
    externalUrl: "https://www.blm.gov/services/land-records",
    reconstruction: "what-the-paper-grants",
  },
  {
    id: "railhead-freight-tariff",
    type: "Reconstructed record · a railroad freight tariff and a way-bill",
    title: "Tariff No. 9, and One Car of Wheat",
    creator: "The general freight agent of the division",
    date: "July 1873",
    record: "The rate sheet posted at the depot, and a way-bill made out under it",
    visual: "context",
    activityRoute: null,
    excerpt:
      "TARIFF No. 9, IN EFFECT THIS DATE. Class rates per hundred pounds from stations on this division. — COTTONWOOD JUNCTION to Kansas City, 141 miles: first class 74 cents; grain, in car-loads, 24 cents. — FLORENCE to Kansas City, 168 miles: first class 62 cents; grain, in car-loads, 19 cents. — Through rates from points west of this division, and from Denver to Chicago, are made by agreement with connecting lines and are not shown herein. — Rates are subject to change without notice. — WAY-BILL: one car wheat, 24,000 lbs., Cottonwood Junction to Kansas City, at tariff, fifty-seven dollars and sixty cents. Consignor's memorandum appended: “shipped in the name of the elevator, the rate to the elevator being by special arrangement.”",
    prompt:
      "Two stations on the same line ship the same grain to the same market. The nearer one pays more. Work out why that is not a clerical error — then read the consignor's memorandum and say what a farmer with one car of wheat and no elevator would pay.",
    feedback:
      "Institute Context: Florence is twenty-seven miles farther from Kansas City and ships at a fifth less, because Florence is a junction served by more than one road and the Junction is served by one. Where a railroad had competition it cut rates to whatever it took; where it had none it charged what the traffic would bear, and the short-haul shipper paid for the long-haul war. Add the memorandum and the second mechanism appears: the elevator moves enough grain to negotiate a rate nobody else gets, so the published tariff is the price paid by people too small to argue. This is the grievance that organised the Grange, produced the “Granger laws” by which several midwestern states set maximum rates in the early 1870s, and reached the Supreme Court twice — upheld for state regulation of businesses “affected with a public interest” in Munn v. Illinois (1877), then sharply narrowed in Wabash v. Illinois (1886), which held that states could not regulate interstate rates. That gap is what Congress filled with the Interstate Commerce Act of 1887 and the first federal regulatory commission. A student who can trace a policy from a posted rate sheet to a federal agency has done the work this record exists for.",
    citation:
      "Composite record reconstructed for Chronicle from the form of 1870s divisional freight tariffs and way-bills; it is not a transcription of a single surviving document. Long-haul/short-haul rate discrimination, competitive versus non-competitive points, and shipper rebates through elevators follow George H. Miller, Railroads and the Granger Laws (Madison: University of Wisconsin Press, 1971); the litigation and legislation that followed are Munn v. Illinois, 94 U.S. 113 (1877), Wabash, St. Louis & Pacific Railway Co. v. Illinois, 118 U.S. 557 (1886), and the Interstate Commerce Act of 1887.",
    externalUrl: "https://www.archives.gov/milestone-documents/interstate-commerce-act",
    reconstruction: "what-the-rate-decides",
  },
  {
    id: "railhead-removal-roll",
    type: "Reconstructed record · agency roll and removal return",
    title: "Roll of the Kansas Tribe, Taken Preparatory to Removal",
    creator: "The agent for the Kansas or Kaw tribe",
    date: "June 1873",
    record: "The certified count the agency returns to Washington when a people is moved",
    visual: "context",
    activityRoute: null,
    excerpt:
      "ROLL OF THE KANSAS OR KAW TRIBE, TAKEN AT THIS AGENCY PREPARATORY TO REMOVAL, AND HEREWITH CERTIFIED. — Whole number of souls, 533. Men above eighteen years, 138. Women above eighteen, 176. Children, 219. — Wagons furnished by the Government, 15. Head of stock driven, 143. Rations issued for the march, twenty days. — Houses of stone erected for the tribe upon the reserve and now abandoned, 138. — Distance to the new reserve in the Indian Territory, 160 miles. — The tribe left this agency on the fourth day of June. — [The roll is drawn up by family, and gives against each name the age and the degree of blood. The greater number of the entries in the column headed NAME are set down as the agency clerk heard them; several are entered only as “wife of” the man written above.]",
    prompt:
      "This document counts 533 people and it is the only record on this map that admits any of them exist. Read the bracketed note at the foot. Then find somebody in this town whose name is on that roll, ask them for it, and write down what the roll could not.",
    feedback:
      "Institute Context: the Kanza — the Kaw, the Wind People, for whom the state and the river are named — were reduced by successive treaties from most of northern Kansas to a twenty-mile-square reserve at Council Grove by 1848, and to a diminished reserve after 1859. The government built one hundred and thirty-eight one-room stone houses for them in 1862; they declined to live in square rooms, kept animals in them, and in 1866 settlers stripped the doors and window sashes while the tribe was away on the winter hunt. Congress ordered removal over Chief Allegawaho's protest, and 533 people walked south on 4 June 1873. Read this roll beside the receiver's receipt and the two documents are one transaction seen from two desks. Read it against the person standing in front of you and it does what every administrative roll in this game does: it is exact about number, age and distance, and it cannot hold a name its clerk did not trouble to learn or a woman's name at all. That is not an accident of this form. It is the form.",
    citation:
      "Composite record reconstructed for Chronicle from the form of Office of Indian Affairs agency rolls and removal returns; it is not a transcription of a single surviving document. The population figure, the removal date, the distance to the Kay County reserve, the 1862 stone houses and their stripping follow Unrau, The Kansa Indians, and the Annual Report of the Commissioner of Indian Affairs for 1873.",
    externalUrl: "https://www.okhistory.org/publications/enc/entry.php?entry=KA001",
    reconstruction: "who-the-paper-leaves-out",
  },
  {
    id: "railhead-town-paper",
    type: "Reconstructed record · a weekly newspaper page",
    title: "The Cottonwood Junction Clarion",
    creator: "The proprietor, who is also a town-site trustee",
    date: "June 1873",
    record: "One week's front page, pasted in the window of the newspaper office",
    visual: "context",
    activityRoute: null,
    excerpt:
      "THE CLARION. — LANDS! LANDS! LANDS! The finest bottom and second-bottom in the State now offering. Trust lands of the Kaw Reserve, appraised and in market, at figures that will not be seen again in the lifetime of any man reading this. Terms cash. Apply at this office. — TO THE CAPITALIST. The Junction has this season shipped more stock than any point on the division, and asks nothing of the East but that it come and look. — A CARD. The undersigned, having no interest in any town site whatever, cheerfully recommends the Junction to all persons seeking homes. — THE INDIANS. The Kaws took their departure on Wednesday for their new home in the Territory. The removal was effected without disturbance. Their late reserve being now open, we may look for a large immigration. — MONEY. Eastern exchange is close, and loans upon town lots are not to be had at any figure this month. There is no occasion for alarm. — MARRIED, at the residence of the bride's father —",
    prompt:
      "Everything on this page was written by one man in one week. Rank the four items by the space he gave them, then rank them again by how much each one changed. Where the two rankings disagree, say what the paper is for.",
    feedback:
      "Institute Context: the frontier weekly was not primarily a newspaper. It was a town-site promotion, usually owned by men holding lots in the town it advertised, printed for circulation back east where the buyers and the capital were. The “A CARD” notice, disclaiming any interest in a town site, is a standard device and is very often false — this proprietor is a trustee. Robert Dykstra's work on the Kansas cattle towns shows how completely the local press functioned as the marketing arm of the town company. So the page is evidence of two things at once. It is unreliable about the Junction's prospects, in a way a student should be able to detect from its own “A CARD.” And it is a precise record of what its readers were assumed to care about: the removal of 533 people gets three lines and is reported as good news for the land market, on the same page as a warning that money is tight in which the proprietor tells his readers not to be alarmed. Three months later, in September, the failure of Jay Cooke's house closed the New York exchange and began a depression that ran for years.",
    citation:
      "Composite record reconstructed for Chronicle from the form and contents of Kansas frontier weeklies of the early 1870s; it is not a transcription of a single surviving issue. The town-company ownership of the local press, the “A CARD” disclaimer convention and the eastward-facing promotional function follow Robert R. Dykstra, The Cattle Towns (New York: Alfred A. Knopf, 1968). The removal notice follows the date in Unrau, The Kansa Indians; the money paragraph precedes the failure of Jay Cooke & Company on 18 September 1873.",
    externalUrl: "https://www.loc.gov/collections/chronicling-america/",
    reconstruction: "who-the-paper-leaves-out",
  },
  {
    id: "railhead-telegram-file",
    type: "Reconstructed record · a telegraph operator's file of messages sent",
    title: "Messages Sent, This Office, 4 June 1873",
    creator: "The operator at the Cottonwood Junction office",
    date: "4 June 1873",
    record: "The day's file of sent messages, which every operating room was required to keep",
    visual: "context",
    activityRoute: null,
    excerpt:
      "MESSAGES SENT, THIS OFFICE, JUNE 4. Rates: twenty-five cents the first ten words, two cents each word thereafter; address and signature not counted; press matter forwarded at association rates. — No. 41, 8.02 a.m., to Kansas City. “Cattle steady natives four ten to five twenty wintered texans three sixty to four fifteen receipts light.” 16 wds. — No. 44, 8.31 a.m., to Chicago. “Wheat number two spring one eleven and a quarter corn thirty eight and a half unchanged.” 15 wds. — No. 52, 11.40 a.m., PRESS. “Kaws took departure this morning for the Indian Territory. Removal effected without disturbance. Their late reserve now open. Large immigration expected.” 22 wds, association rate. — No. 53, 11.52 a.m., to Boston. “Have bought eleven quarters at the appraisal will take more at these figures wire authority two thousand.” 18 wds. — No. 61, 3.20 p.m., to Topeka. “Send surgeon. Man hurt on the grade, section four.” 9 wds, minimum charge. — TOTAL FORWARDED THIS DATE, 63.",
    prompt:
      "Every line on this sheet is priced by the word. Put No. 52 and No. 61 side by side — count the words each was given and what each of them is about — and then say what a price per word does to the things a place can afford to know about itself.",
    feedback:
      "Institute Context: this is the cheapest document on the map and the one that moves fastest, and both of those are the finding. A telegram was charged by the word, so the wire taught a generation to write without articles — and what a message could afford to say became a commercial decision before it was an editorial one. Read the file as one day of a town's outgoing thought and the priorities are legible without any interpretation at all: two market quotations before nine in the morning, one land purchase for an eastern account, one injured man at the minimum charge, and 533 people leaving their reserve in twenty-two words at a reduced rate. Then notice what those twenty-two words are. They are the same sentences the Clarion prints — “the removal was effected without disturbance” — because the town's news of the removal *is* this dispatch. After the consolidation of 1866 Western Union carried nearly all of the country's telegraph traffic, and it had an exclusive arrangement with the New York Associated Press: the association got priority and a press rate, and in exchange one company's wires carried one association's news to every interior paper in the United States. Contemporaries called it a monopoly over information and meant it literally. The two market quotations are the other half. The wire did not move a single steer or a single bushel; it moved the number that valued them, and it delivered that number to the buyer's house in Kansas City at the same instant as to the seller standing in a Kansas pen — which is why a drover ninety miles from a market was a price-taker in it.",
    citation:
      "Composite record reconstructed for Chronicle from the form of Western Union sent-message files and posted tariffs; it is not a transcription of a single surviving document. The word-rate structure with a ten-word minimum, free address and signature, the required file of sent messages and the reduced press rate follow standard company practice of the period. The Western Union–New York Associated Press arrangement and its consequences for what interior papers could print follow Menahem Blondheim, News Over the Wires: The Telegraph and the Flow of Public Information in America, 1844–1897 (Cambridge, Mass.: Harvard University Press, 1994), and Richard R. John, Network Nation: Inventing American Telecommunications (Cambridge, Mass.: Harvard University Press, 2010). The removal date follows Unrau, The Kansa Indians.",
    externalUrl:
      "https://www.kshs.org/kansapedia/kansas-historical-quarterly-the-telegraph-comes-to-kansas/13043",
    reconstruction: "what-the-rate-decides",
  },
];
