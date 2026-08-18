// Unit 5 (Period 5: 1844–1877) campaign content — "A House Divided."
//
// Structural mirror of unit-04-campaign.js. Three cases: one Chronotravel destination with a
// walkable map (case-013, Richmond in 1864), and two missions.
//
// ## The register rule governs this file before anything else does
//
// The brief that commissioned this unit set one constraint above the others, and it binds the
// writing here exactly as it bound the map's NPC roster and its two interiors: **enslaved and
// impressed people are named, speak for themselves, and say what is being done to them and what
// they intend.** Nobody is scenery. No Confederate speaker is the unit's most sympathetic voice.
// There is no Confederate battle flag anywhere in this unit in any form, and there is none in the
// art either.
//
// In a record file that rule lands in a specific place, because six of these documents are
// administrative papers and administrative papers are exactly where a person disappears. So every
// one of the six is written to be read *against its own form*: the requisition moves people its
// text never names; the payroll's second and third classes are wages paid to somebody else; the day
// book's most ordinary column bills an owner for a pair of shoes; the ward register's own matron has
// to write a memorandum to admit that four women work in her ward whom the columns cannot hold; and
// the pass gives Peter Gowrie a first name where he gives himself two. That last gap is the design.
// A student who notices that the paper says PETER and the man says "My name is Peter Gowrie" has
// done the historical thinking this unit exists to teach, and has done it without anybody narrating
// it at them.
//
// ## What these six records are, and are not
//
// The same rule Unit 4 set: every source in CASE_013_SOURCES is a **composite document
// reconstructed for Chronicle**, not a transcription of one surviving archival item, and each
// citation says so in its own first sentence. A Chronicler walks up to a man on a dock and asks to
// see the paper in his hat; the record has to be *that man's* pass. National canonical documents —
// the Emancipation Proclamation, the Gettysburg Address, the 13th Amendment — cannot do that job,
// because nobody standing on Cary Street is carrying one. Those live in
// content/primary-source-library/unit-05-source-library.js and feed the missions and the Archive
// Challenges below.
//
// The form is documentary, the figures are real, and the citation names the scholarship the figures
// come from rather than implying an archive box. The impressment terms track the Confederate acts of
// March 1863 and February 1864; Tredegar's three classes of hands track Dew's payroll analysis;
// the price board's flour figure tracks Richmond's wartime market reports; Chimborazo's admissions
// arithmetic tracks the hospital's own returns. A student who checks any number here against the
// cited work will find it.
//
// ## The date is 1864, and that is load-bearing on four records
//
// Fixed early, for the same reason Unit 4's 1845 was. Richmond does not burn until April 1865, so
// this is a working city under siege conditions rather than a ruin. The Deep South market for the
// slave trade is shut by the blockade and the loss of the Mississippi, which is why the commission
// house's week has no sales in it and a great deal of hiring out. The bread riot is April 1863 —
// **remembered** by 1864, not staged — so the market carries a relief committee and a free market
// day rather than a crowd. And the Confederate impressment machinery is at its fullest extent, which
// is what makes the requisition the district's central document rather than an auction bill.

export const UNIT_05 = {
  id: "unit-05",
  title: "A House Divided",
  period: "Period 5 · 1844–1877",
  description:
    "How a republic that had argued about slavery for seventy years stopped being able to argue about it — through expansion into new territory, a decade of settlements that each unsettled the last, four years of war fought and worked by people on both sides who had never been asked, and a twelve-year attempt to write the war's outcome into law that succeeded at abolishing slavery and failed at securing what the people freed by it understood freedom to mean.",
  centralQuestion:
    "The war destroyed slavery. Who decided what would stand in its place — and by what authority?",
  // Two unit-level Archive Challenges, the same pair Units 3 and 4 carry: the SAQ works from a
  // single stimulus, the DBQ from seven documents. Both are reached from the Archive Terminal in the
  // Archive Room, never from a case — see the Mission vs. Archive Challenge split in CLAUDE.md.
  archiveChallenges: [
    { questType: "saq", questId: "unit-05-archive-confederate-labor-saq" },
    { questType: "dbq", questId: "unit-05-archive-meaning-of-freedom-dbq" },
  ],
  cases: [
    {
      id: "case-013",
      shortTitle: "Richmond",
      title: "The Fractured Republic",
      date: "1864",
      // Richmond, Virginia — the Confederate capital, on the fall line of the James.
      mapPosition: { lat: 37.54, lon: -77.44 },
      location: "Richmond, Virginia · 1864",
      question:
        "A capital in its fourth year of war, swollen to three times the people it was built for: who was made to build it, who was made to feed it, and whose name did the paperwork not bother to write down?",
      mechanic: "Field Investigation",
      route: "field",
      summary:
        "Walk a wartime capital — the government quarter on the hill, the market, the ironworks, the warehouse district, the dock and the hospital on the ridge — and recover six records that together show what the Confederate war effort actually ran on.",
      // KC 5.2 (the sectional conflict's escalation into war) and 5.3 (the war, emancipation, and
      // Reconstruction). Themes: WXT (a war economy run on coerced labour and a collapsing
      // currency), PCE (a government founded on states' rights conscripting its citizens' human
      // property), NAT (who counts as a person the record will name).
      ced: { period: 5, keyConcepts: ["5.2", "5.3"], themes: ["WXT", "PCE", "NAT"] },
    },
    {
      id: "case-014",
      shortTitle: "The Road to Disunion",
      title: "The Road to Disunion",
      date: "1846–1861",
      // Washington, D.C. — where every one of these settlements was written, argued and broken.
      mapPosition: { lat: 38.9, lon: -77.04 },
      location: "Washington, D.C. · 1846–1861",
      question:
        "Between 1846 and 1861 the Union was saved four times. Why did each rescue make the next crisis worse?",
      mechanic: "Chronology Builder",
      // A non-map mission. Sequencing, and deliberately not the same shape as case-011's Bank War
      // chronology: that chain runs decision → consequence, one actor's choices compounding. This
      // one runs settlement → destabilization. Every step here is somebody *solving* the sectional
      // crisis, and the reason it belongs in order is that each solution is what made the next
      // dispute unmanageable. A student who can only recite the dates has not got the argument.
      route: "mission",
      summary:
        "Put the sectional crisis in the order in which each settlement produced the next quarrel — the Proviso, the Compromise, the Act, the ruling, the election — and see why a decade of compromises left less room to compromise each time.",
      archiveChallenge: {
        questType: "sequencing",
        questId: "case-014-mission-road-to-disunion-chronology",
      },
      // KC 5.1 (expansion west and the territorial question it forced) and 5.2 (the escalation of
      // sectional conflict). Themes: PCE (what the federal government may do about slavery in a
      // territory), GEO (the territorial question is a question about ground), NAT (two accounts of
      // what the Union is for).
      ced: { period: 5, keyConcepts: ["5.1", "5.2"], themes: ["PCE", "GEO", "NAT"] },
    },
    {
      id: "case-015",
      shortTitle: "The Unfinished Work",
      title: "The Unfinished Work",
      date: "1865–1877",
      // The former Confederacy at large; the coordinates put the Navigation Table's pin on
      // Charleston, where the Union army's arrival, the freedpeople's schools and one of the first
      // Black-majority constitutional conventions all happened within three years of each other.
      mapPosition: { lat: 32.78, lon: -79.93 },
      location: "The former Confederate states · 1865–1877",
      question:
        "Everyone agreed slavery was over. Sort out what each of these people thought should stand in its place — and then account for why the settlement that arrived was none of them.",
      mechanic: "Evidence Sorting",
      // A non-map mission, and the one the four post-war characters generated for this unit belong
      // to: a soldier of the United States Colored Troops, a freedwoman teaching a school, a
      // Freedmen's Bureau agent and a delegate to a Reconstruction constitutional convention. They
      // render no field sprites — a mission has no map — so what they carry here is their argument.
      // Each of the six documents below is the kind of claim one of those people actually made.
      route: "mission",
      summary:
        "Sort six Reconstruction-era claims by what each one holds freedom to require — land and labour on your own terms, the vote and office, or federal protection of the law — and explain what defeated all three.",
      archiveChallenge: {
        questType: "evidence-organizing",
        questId: "case-015-mission-meanings-of-freedom",
      },
      // KC 5.3 (the war's aftermath, the Reconstruction amendments, and the failure to secure
      // them). Themes: NAT (citizenship and who holds it), PCE (federal versus state authority over
      // civil rights), WXT (what free labour turned out to mean on a cotton farm).
      ced: { period: 5, keyConcepts: ["5.3"], themes: ["NAT", "PCE", "WXT"] },
    },
  ],
};

// Record Reconstruction lanes for case-013. Three, and like Unit 4's they are arguments rather than
// topics — but the argument they make is about *the documents themselves*, which suits a district
// whose evidence is almost entirely administrative. A requisition, a payroll, a price board, a day
// book, a register and a pass are all forms designed to be filed and forgotten, and asking a student
// which of three things a given form is doing is a sourcing exercise disguised as a sort.
export const CASE_013_LANES = [
  { id: "what-the-government-took", label: "What the government took" },
  { id: "what-the-market-did", label: "What the market did" },
  { id: "who-the-record-counted", label: "Who the record counted" },
];

export const CASE_013_SOURCES = [
  {
    id: "richmond-impressment-order",
    type: "Reconstructed record · War Department requisition for impressed labour",
    title: "Requisition for Slave Labour, Engineer Bureau",
    creator: "Engineer Bureau, War Department, Confederate States",
    date: "March 1864",
    record: "A printed requisition served on the slaveholders of a Virginia district",
    visual: "context",
    activityRoute: "interview",
    excerpt:
      "ENGINEER BUREAU, RICHMOND. — By authority of the Act of Congress approved the seventeenth of February last, and of the requisition of the Governor thereunder, you are required to deliver at the place named below, on or before the day named, the number of male slaves between the ages of eighteen and fifty set opposite your name, being not more than one fifth of those liable in this district. Term of service, sixty days from the day of delivery, unless sooner discharged. The Government will furnish rations and medical attendance, and will pay to the owner the sum per month hereon endorsed for each hand delivered. Owners failing to deliver will have the number impressed by the enrolling officer of this district without further notice. Should any hand die, or be lost to the owner while in the service of the Government, compensation will be made upon the value sworn to at the time of delivery, and not otherwise. — Names and numbers annexed. Delivery to be made to the officer in charge of the works east of the city.",
    prompt:
      "Read the last two sentences on their own. The document promises to pay somebody every month, and to compensate somebody if a person dies. Who is that somebody, both times — and what does the answer tell you about what this piece of paper believes it is moving?",
    feedback:
      "Institute Context: the Confederate Congress passed a general impressment act in March 1863 and a far broader one on 17 February 1864, and Virginia had been requisitioning enslaved labour under its own statutes since 1862. District quotas set as a fraction of an owner's liable men, fixed terms of sixty days, government rations, and payment of the hire to the owner are all real features of the forms. Two things make this the single most useful document on the map. The first is what it does to the Confederacy's own founding argument: a government built on states' rights and on property in human beings created a central state that seized that property, over its owners' furious objection — enslavers sued, petitioned, hid men in the woods, and wrote to the newspapers about tyranny. The second is the silence at the center of the page. The people delivered under this requisition are counted, aged, valued and moved, and the document does not contain a single one of their names. It was not designed to. A Chronicler who wants those names has to go and find the person, which is exactly what the rest of this city is for.",
    citation:
      "Composite record reconstructed for Chronicle from the printed requisition forms served under the Confederate impressment acts; it is not a transcription of a single surviving document. Quotas, sixty-day terms, government rations, payment of hire to owners and the compensation-on-sworn-value clause follow the acts of 26 March 1863 and 17 February 1864 and the analysis in Jaime Amanda Martinez, Confederate Slave Impressment in the Upper South (Chapel Hill: University of North Carolina Press, 2013).",
    externalUrl: "https://www.britannica.com/topic/Confederate-States-of-America",
    reconstruction: "what-the-government-took",
  },
  {
    id: "richmond-tredegar-payroll",
    type: "Reconstructed record · monthly pay roll of an ironworks",
    title: "Pay Roll, Tredegar Iron Works",
    creator: "The works' pay clerk",
    date: "August 1864",
    record: "The month's pay roll, posted at the gate of the South's largest ironworks",
    visual: "context",
    activityRoute: "assembly",
    excerpt:
      "PAY ROLL, ROLLING MILL AND FOUNDRY, FOR THE MONTH. — CLASS FIRST, mechanics and skilled hands, paid to themselves: D. Boyle, puddler, wages as agreed, one half advanced in flour and meal at government rates and charged against the month's account; and forty-one further names. — CLASS SECOND, slaves hired by the year, the hire payable to the owner and not to the hand: sixty-three names, with the owner and the county set against each, hire settled quarterly on the owner's order. — CLASS THIRD, hands delivered under the Engineer Bureau's requisition: thirty-one names, no wages payable at these works, term of service as endorsed on the several requisitions. — Rations issued at the works to all three classes alike. Hands of the second and third classes are not to leave the yard without a pass from the office.",
    prompt:
      "Three columns of men stand at the same furnace and do the same work. Follow the money in each column — who earns it, and whose hand it actually reaches. Then explain what the payroll's own bookkeeping proves about the Confederate war economy that no speech by anybody in this city could prove.",
    feedback:
      "Institute Context: Tredegar was the largest ironworks in the South and cast roughly half of all the artillery the Confederacy manufactured — something like eleven hundred guns. Joseph Anderson had been buying and hiring enslaved ironworkers since the 1840s — in part deliberately, to weaken the bargaining position of his white mechanics, who struck over it in 1847 and lost. By the war's later years roughly half the workforce was Black, hired by the year or impressed outright. Three details repay attention. Paying half a white mechanic's wage in flour and meal is evidence about the currency rather than about generosity: Confederate paper was depreciating fast enough that food was the more reliable payment. The second class is the ordinary condition of enslaved industrial labour in Virginia — the man works, the owner is paid, and the two may live a hundred miles apart. And the third class is paid nothing at all. What makes this document unusually direct is that the Confederacy's own accountant has set all three side by side on one sheet, in the same hand, as one workforce, because for the purpose of getting guns made that is what they were.",
    citation:
      "Composite record reconstructed for Chronicle from the form of Tredegar's wartime pay rolls; it is not a transcription of a single surviving document. The three classes of hands, the proportion of Black workers, payment partly in rations, and Anderson's use of enslaved labour against his white mechanics follow Charles B. Dew, Ironmaker to the Confederacy: Joseph R. Anderson and the Tredegar Iron Works (New Haven: Yale University Press, 1966), and Midori Takagi, \"Rearing Wolves to Our Own Destruction\": Slavery in Richmond, Virginia, 1782–1865 (Charlottesville: University Press of Virginia, 1999).",
    externalUrl: "https://www.nps.gov/rich/learn/historyculture/index.htm",
    reconstruction: "what-the-government-took",
  },
  {
    id: "richmond-price-board",
    type: "Reconstructed record · a chalked price board and the notices pasted beside it",
    title: "The Second Market Price Board",
    creator: "Four hands, posted and chalked in the same week",
    date: "August 1864",
    record:
      "A grocer's board at a Richmond public market, with the week's public notices beside it",
    visual: "context",
    activityRoute: "discrepancy",
    // The audit's evidence column is a transcript of what this player actually asked at the
    // requisition, so the interview has to have happened. Same shape as Riverbend's letter and
    // Canal Crossroads' time book — and it decides which mission can be last, which is what
    // `arcClose` is authored against. See the header on unit-05-activities.js.
    requiresSourceId: "richmond-impressment-order",
    excerpt:
      "[chalked, three figures to a line, the two older ones left standing] FLOUR, the barrel — 40 — 125 — 250. BACON, the pound — 1.25 — 6 — 11. SALT, the pound — 1.50. WOOD, the cord — 30. COFFEE — none. — [pasted] FREE MARKET. The ladies' committee will distribute on Wednesday morning to the families of soldiers in the service, upon the certificate of the ward visitor, while the supply holds out. — [pasted] A SUBSTITUTE WANTED. A sound man not liable to conscription may hear of an advantageous arrangement by applying within. — [pasted] ABSENT WITHOUT LEAVE. The following men of this city have failed to report to their commands and are to be arrested wherever found, the reward as by the regulation: [twenty-one names].",
    prompt:
      "The grocer stopped rubbing out the old figures. Take the flour line by itself: does it tell you that flour became scarce, or that money became weak, or both — and what would you need to know to decide? Then ask why these four particular things were posted in the same week.",
    feedback:
      "Institute Context: Richmond's population roughly tripled during the war, its food arrived over a rail network being dismantled by the fighting, and the Confederate dollar depreciated until a paper dollar bought a few cents' worth of what it had bought in 1861. So most of the movement in that flour line is the currency and not the flour, which is the analytical point worth taking away: a price is a ratio, and either side of it can move. The other three notices are the social consequences of the first. Relief committees and free-market days existed in Richmond partly because on 2 April 1863 several hundred women — led by Mary Jackson, a huckster in this market — marched on the shops and took bread, and Jefferson Davis came out and spoke to the crowd himself; by 1864 the riot is a memory the city organizes around rather than an event. The substitute advertisement records the exemption and substitution provisions that produced the charge of a rich man's war and a poor man's fight. And the desertion list is the Confederate army's own arithmetic catching up with the price board: men whose families could not eat went home.",
    citation:
      "Composite record reconstructed for Chronicle from the market reports and posted notices of Richmond's wartime newspapers; it is not a transcription of a single surviving document. Prices, the free market and relief committees, the substitution and exemption provisions, and desertion follow Emory M. Thomas, The Confederate State of Richmond: A Biography of the Capital (Austin: University of Texas Press, 1971). The bread riot of April 1863 and women's wartime political action follow Stephanie McCurry, Confederate Reckoning: Power and Politics in the Civil War South (Cambridge, Mass.: Harvard University Press, 2010).",
    externalUrl: "https://www.britannica.com/event/American-Civil-War",
    reconstruction: "what-the-market-did",
  },
  {
    id: "richmond-trader-day-book",
    type: "Reconstructed record · a week in a commission house day book",
    title: "Day Book, Franklin Street Commission House",
    creator: "The house's book-keeper",
    date: "1864",
    record: "A week's entries in the day book of a Richmond slave-trading and hiring house",
    visual: "context",
    activityRoute: null,
    excerpt:
      "ENTRIES OF THE WEEK. — SALES: none. Two offered and withdrawn, no bid reaching the reserve. — HIRES, one year from January next, commission of two and one half per centum from each party: to the Nitre and Mining Bureau, four men, the hire payable quarterly to the owner in Charlotte County; to Chimborazo Hospital, three women, for cooking, washing and attendance, the hire to the owner in Hanover; to the Tredegar company, six men, the owners' orders on file. — CHARGES: board and lodging of hands in the jail, per day, per head; washing; a physician's visit; a pair of shoes furnished, charged to the owner. — MEMORANDUM: the market is not what it was, the river being shut, and there is no saying what our money will be worth at the settlement. Hiring is the surer business now. — Names of hands as per the register kept separately.",
    prompt:
      "This is a week in which nothing was sold. Follow the hiring entries instead: who pays, who is paid, who is moved, and who is not written down. Then look at the plainest column on the page — the charges — and say what it means that a pair of shoes is billed to an owner.",
    feedback:
      "Institute Context: the interstate slave trade collapsed once the blockade closed the ports and the loss of the Mississippi cut Richmond off from the Deep South market, but Richmond's traders did not shut their doors. They turned to hiring out, which had been a large part of the Virginia business for decades and which by 1864 was the arrangement most enslaved people in this city actually lived under: hired by the year, the wage paid to the owner, and very often living apart from that owner in the city itself — which is precisely the mobility the pass system existed to control. Notice who the customers are on this page. The Nitre and Mining Bureau, a military hospital, an ironworks: the Confederate government, renting people by the year, through a commission house, at two and a half per cent. And notice the charges. Board, washing, a doctor, shoes — the bookkeeping for a person is identical in form to the bookkeeping for freight, which is what makes this document usable as evidence and unbearable as a document. Robert Lumpkin's jail, a private holding pen a few streets from here, was operating throughout.",
    citation:
      'Composite record reconstructed for Chronicle from the ordinary form of a Virginia commission house\'s day book; it is not a transcription of a single surviving document. The wartime collapse of sales, the shift to hiring out, government departments as hirers, commission rates and the jail charges follow Midori Takagi, "Rearing Wolves to Our Own Destruction": Slavery in Richmond, Virginia, 1782–1865 (Charlottesville: University Press of Virginia, 1999), and Maurie D. McInnis, Slaves Waiting for Sale: Abolitionist Art and the American Slave Trade (Chicago: University of Chicago Press, 2011).',
    externalUrl: "https://www.britannica.com/topic/slavery-sociology",
    reconstruction: "what-the-market-did",
  },
  {
    id: "richmond-ward-register",
    type: "Reconstructed record · a month's page from a hospital ward register",
    title: "Ward Register, Chimborazo Hospital",
    creator: "The ward's matron",
    date: "August 1864",
    record:
      "One ward's monthly return from a Confederate military hospital on the hill east of Richmond",
    visual: "context",
    activityRoute: null,
    excerpt:
      "WARD REGISTER, MONTH OF AUGUST. Columns: NAME — RANK AND COMPANY — REGIMENT — STATE — DATE ADMITTED — DISEASE OR WOUND — RETURNED TO DUTY — FURLOUGHED — TRANSFERRED — DIED. — Admitted this month, sixty-one. Returned to duty, thirty-four. Furloughed, nine. Transferred to other hospitals, seven. Remaining in ward, six. Died, five, whose effects are accounted for below. — Of the whole number admitted, forty-two were entered as disease and nineteen as wound or injury. — MATRON'S MEMORANDUM: the diet kitchen has had no coffee since April, and the whisky ration is drawn upon the surgeon's written order only. The ward is attended by four hired servants whose names are not entered in this book, they not being patients, and whose hire for the year is paid to their owners through the commission house.",
    prompt:
      "Two numbers on this page argue with each other: forty-two admitted for disease against nineteen for wounds. And one sentence at the bottom describes four people the register was never built to hold. What can this page prove on its own, and what can it only point at?",
    feedback:
      "Institute Context: Chimborazo was roughly a hundred and fifty whitewashed frame buildings on a hill east of the city and treated something like seventy-six thousand patients, which makes it one of the largest military hospitals of the nineteenth century. Its recorded mortality was low for the era, and its own surgeons credited ventilation, siting and diet rather than anything done at a bedside. Disease outrunning wounds by better than two to one is the central medical fact of the war, not a peculiarity of this ward. Two groups of women stand at the edges of the page. White women of the city took on paid and unpaid hospital administration that would have been socially unthinkable to them in 1860 — Phoebe Pember, one of Chimborazo's own matrons, wrote a book largely about fighting the surgeons for the authority to do the job — and the argument the matron expects when the men come home is a real one that ran on into the 1870s. The four hired attendants in the memorandum are enslaved women doing the ward's washing, cooking and night watching, hired by the year with their wages paid to somebody in another county: present in the building every hour, absent from the book by design. Reading a register means reading both what its columns count and what they were built not to hold.",
    citation:
      "Composite record reconstructed for Chronicle from the form of Confederate general hospital ward returns; it is not a transcription of a single surviving document. Chimborazo's scale, its admissions and mortality, and the ratio of disease to wounds follow the hospital's own returns as summarized by Richmond National Battlefield Park. Matrons' work and authority follow Phoebe Yates Pember, A Southern Woman's Story (1879), and Drew Gilpin Faust, Mothers of Invention: Women of the Slaveholding South in the American Civil War (Chapel Hill: University of North Carolina Press, 1996). The hired enslaved attendants follow Midori Takagi, \"Rearing Wolves to Our Own Destruction\" (Charlottesville: University Press of Virginia, 1999).",
    externalUrl: "https://www.britannica.com/place/Richmond-Virginia",
    reconstruction: "who-the-record-counted",
  },
  {
    id: "richmond-labor-pass",
    type: "Reconstructed record · the paper an impressed labourer carried on his person",
    title: "Pass and Certificate of Impressment, Richmond Dock",
    creator: "Provost marshal's office, endorsed by the officer of the works",
    date: "1864",
    record:
      "A street pass issued to a man impressed onto the government works at the Richmond Dock",
    visual: "context",
    activityRoute: null,
    excerpt:
      "PASS. — The bearer, PETER, a slave the property of ——— of the county of Sussex, was delivered under the Engineer Bureau's requisition of February and is employed upon the government works at the Richmond Dock. He has leave to pass between the Dock, the depot and the works, and upon Cary Street and Fourteenth Street only, between sunrise and the ringing of the bell at nine in the evening. He is not to be upon any other street, nor abroad after that hour, without a written order from this office. Any person is authorised to demand the production of this paper. A hand found without it will be taken up and confined in the watch house until claimed, and the charges of his keeping made against the owner. — Provost marshal's office. Endorsed: the term of sixty days extended by order until further notice.",
    prompt:
      "This paper decides which streets a man may walk and until what hour, and it gives him one name where he gives himself two. Notice what the endorsement does to his term of service, and who is billed if he is arrested. What was this document made to do — and what does the man carrying it learn from it that nobody intended him to learn?",
    feedback:
      "Institute Context: Richmond's pass and patrol system was older than the war. City ordinances required an enslaved person abroad to carry a pass and a free Black resident to carry registration papers renewed and paid for every year, and the guard could stop anyone after the nine o'clock bell. The war tightened all of it, because the city filled with hired-out, impressed and refugee Black workers whose movement was harder to supervise than a household's. Three things on this page. First, the naming: the pass records a first name and an owner, because that is how the system saw a person — which is why a historian working only from these papers would never learn the name the man himself used. Second, the endorsement: a sixty-day term extended until further notice is the ordinary experience of impressment, and while enslavers complained about it loudly and in writing, the people actually held complained to no one who would write it down. Third, the geography. A pass that lists streets is also a map of the war economy, and a man moving government freight between the canal, the dock and the depot every day knows what is arriving, what is leaving, and what has stopped coming. Enslaved Virginians used exactly that knowledge — tens of thousands walked to Union lines and carried intelligence with them, and the Union's spy network inside Richmond depended on Black city dwellers who could move through it and be overlooked.",
    citation:
      "Composite record reconstructed for Chronicle from Richmond's wartime pass forms and the city ordinances behind them; it is not a transcription of a single surviving document. The pass and patrol system, registration of free Black residents, the watch house and the charging of costs to owners follow Midori Takagi, \"Rearing Wolves to Our Own Destruction\" (Charlottesville: University Press of Virginia, 1999), and Emory M. Thomas, The Confederate State of Richmond (Austin: University of Texas Press, 1971). Enslaved people's wartime intelligence and self-emancipation follow Stephanie McCurry, Confederate Reckoning (Cambridge, Mass.: Harvard University Press, 2010), and Elizabeth R. Varon, Southern Lady, Yankee Spy: The True Story of Elizabeth Van Lew (New York: Oxford University Press, 2003).",
    externalUrl: "https://www.britannica.com/topic/slave-code",
    reconstruction: "who-the-record-counted",
  },
];
