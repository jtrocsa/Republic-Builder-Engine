/**
 * Primary source reference library — Unit 6 / Period 6, 1865-1898.
 * Industrialization, the West, immigration, labor, and the Gilded Age.
 * See docs/content-guide/primary-source-library.md — no unit-06 case
 * content exists in the game yet, so nothing here is wired to gameplay.
 */

export const UNIT_06_SOURCE_LIBRARY_META = {
  unit: 6,
  period: "Period 6",
  years: "1865-1898",
  label: "Industrialization, the West, immigration, labor, and the Gilded Age",
  testableComparisons: [
    "Carnegie vs. Sumner vs. the Populists",
    "Gompers vs. the Knights of Labor",
    "Dawes Act vs. Chief Joseph",
    "Washington vs. Wells",
  ],
};

export const UNIT_06_SOURCES = [
  {
    id: "u06-carnegie-gospel-of-wealth",
    unit: 6,
    priority: "essential",
    topPriorityRank: 36,
    title: "The Gospel of Wealth",
    creator: "Andrew Carnegie",
    date: "1889",
    apushUse: "Philanthropy, wealth inequality, and social responsibility",
    excerpt:
      "Carnegie argued that vast fortunes were the natural, beneficial result of competition, but that the wealthy had a moral duty to distribute their fortunes during their lifetimes for the public good rather than pass wealth down through inheritance.",
    citation:
      'Andrew Carnegie, "Wealth" (later known as "The Gospel of Wealth"), North American Review, June 1889.',
    externalUrl: null,
  },
  {
    id: "u06-rockefeller-writings",
    unit: 6,
    priority: "essential",
    topPriorityRank: null,
    title: "Writings defending industrial consolidation",
    creator: "John D. Rockefeller",
    date: "late 1800s",
    apushUse: "Trusts and large-scale business organization",
    excerpt:
      "Rockefeller defended Standard Oil's consolidation of the oil industry as bringing order, efficiency, and lower consumer prices to a chaotic and wasteful competitive market, presenting large-scale combination as economic progress rather than exploitation.",
    citation:
      "John D. Rockefeller, public statements and later memoir writings defending Standard Oil's business practices, late 1800s.",
    externalUrl: null,
  },
  {
    id: "u06-sherman-antitrust-act",
    unit: 6,
    priority: "essential",
    topPriorityRank: null,
    title: "Sherman Antitrust Act",
    creator: "Congress",
    date: "1890",
    apushUse: "Federal response to monopolies",
    excerpt:
      'The first federal law to prohibit "every contract, combination... or conspiracy in restraint of trade," the act targeted monopolistic trusts, though weak early enforcement meant it was used more often against labor unions than corporations in its first decade.',
    citation: "Sherman Antitrust Act, July 2, 1890.",
    externalUrl: null,
  },
  {
    id: "u06-interstate-commerce-act",
    unit: 6,
    priority: "essential",
    topPriorityRank: null,
    title: "Interstate Commerce Act",
    creator: "Congress",
    date: "1887",
    apushUse: "Railroad regulation",
    excerpt:
      'Responding to farmer and shipper complaints about discriminatory railroad rates, the act created the Interstate Commerce Commission, the first federal regulatory agency, to require "reasonable and just" rates on interstate rail traffic.',
    citation: "Interstate Commerce Act, February 4, 1887.",
    externalUrl: null,
  },
  {
    id: "u06-omaha-platform",
    unit: 6,
    priority: "essential",
    topPriorityRank: 38,
    title: "People's Party / Omaha Platform",
    creator: "People's (Populist) Party",
    date: "1892",
    apushUse: "Populism and agrarian reform",
    excerpt:
      "The Populist platform denounced concentrated corporate and financial power and called for a graduated income tax, direct election of senators, free coinage of silver, and government ownership of railroads and telegraphs to protect ordinary farmers and workers.",
    citation:
      "People's Party, Omaha Platform, adopted at the party's national convention, July 1892.",
    externalUrl: null,
  },
  {
    id: "u06-bryan-cross-of-gold",
    unit: 6,
    priority: "essential",
    topPriorityRank: 39,
    title: "Cross of Gold speech",
    creator: "William Jennings Bryan",
    date: "1896",
    apushUse: "Free silver and class conflict",
    excerpt:
      'Addressing the Democratic National Convention, Bryan championed free silver coinage on behalf of indebted farmers against Eastern financial interests, closing with the declaration that mankind would not be crucified "upon a cross of gold."',
    citation:
      'William Jennings Bryan, "Cross of Gold" speech, Democratic National Convention, July 9, 1896.',
    externalUrl: null,
  },
  {
    id: "u06-dawes-severalty-act",
    unit: 6,
    priority: "essential",
    topPriorityRank: 37,
    title: "Dawes Severalty Act",
    creator: "Congress",
    date: "1887",
    apushUse: "Native assimilation and land loss",
    excerpt:
      'The act broke up communally held tribal land into individual allotments intended to encourage assimilation into white agricultural life, declaring "surplus" land not allotted open to non-Native settlement — resulting in massive loss of Native-held land over subsequent decades.',
    citation: "Dawes Severalty Act, February 8, 1887.",
    externalUrl: null,
  },
  {
    id: "u06-helen-hunt-jackson-century-of-dishonor",
    unit: 6,
    priority: "essential",
    topPriorityRank: null,
    title: "A Century of Dishonor",
    creator: "Helen Hunt Jackson",
    date: "1881",
    apushUse: "Criticism of federal Native policy",
    excerpt:
      "Jackson documented a century of broken U.S. treaties and mistreatment of Native nations, arguing the federal government had a moral obligation to reform its Native policy — though her own preferred solution, assimilation, helped inspire the Dawes Act.",
    citation: "Helen Hunt Jackson, A Century of Dishonor, 1881.",
    externalUrl: null,
  },
  {
    id: "u06-chief-joseph-surrender-speech",
    unit: 6,
    priority: "essential",
    topPriorityRank: null,
    title: "Surrender speech and other statements",
    creator: "Chief Joseph (Hin-mah-too-yah-lat-kekht) of the Nez Perce",
    date: "1877",
    apushUse: "Native resistance and dispossession",
    excerpt:
      'After leading his band on a long fighting retreat toward Canada rather than accept forced relocation, Chief Joseph surrendered with words recorded as "I will fight no more forever," describing exhaustion, cold, and the deaths of his people\'s leaders.',
    citation: "Chief Joseph, surrender statement, Bear Paw Mountains, Montana, October 5, 1877.",
    externalUrl: null,
  },
  {
    id: "u06-chinese-exclusion-act",
    unit: 6,
    priority: "essential",
    topPriorityRank: null,
    title: "Chinese Exclusion Act",
    creator: "Congress",
    date: "1882",
    apushUse: "Nativism and immigration restriction",
    excerpt:
      "The first major federal law to restrict immigration by nationality, the act barred nearly all Chinese laborers from entering the United States and barred Chinese immigrants already present from naturalized citizenship, reflecting West Coast anti-Chinese labor competition and racism.",
    citation: "Chinese Exclusion Act, May 6, 1882.",
    externalUrl: null,
  },
  {
    id: "u06-jacob-riis-how-the-other-half-lives",
    unit: 6,
    priority: "essential",
    topPriorityRank: 41,
    title: "How the Other Half Lives",
    creator: "Jacob Riis",
    date: "1890",
    apushUse: "Urban poverty and reform photography",
    excerpt:
      "Using photography and firsthand reporting, Riis documented the overcrowded, unsanitary tenement conditions faced by immigrant New Yorkers, helping galvanize Progressive-era housing and sanitation reform.",
    citation: "Jacob Riis, How the Other Half Lives, 1890.",
    externalUrl: null,
  },
  {
    id: "u06-gompers-labor-speeches",
    unit: 6,
    priority: "essential",
    topPriorityRank: null,
    title: "Labor speeches",
    creator: "Samuel Gompers",
    date: "late 1800s",
    apushUse: 'The AFL and "bread-and-butter" unionism',
    excerpt:
      'As president of the American Federation of Labor, Gompers pursued a pragmatic "bread-and-butter" unionism focused on higher wages, shorter hours, and better conditions for skilled workers through collective bargaining, rather than broader political or social reform.',
    citation: "Samuel Gompers, speeches and writings as AFL president, late 1800s.",
    externalUrl: null,
  },
  {
    id: "u06-knights-of-labor-platform",
    unit: 6,
    priority: "essential",
    topPriorityRank: null,
    title: "Platform / Terence Powderly writings",
    creator: "Knights of Labor (led by Terence Powderly)",
    date: "1870s-1880s",
    apushUse: "Broad labor reform",
    excerpt:
      "Unlike the trade-specific AFL, the Knights of Labor welcomed skilled and unskilled workers of nearly all races and genders and called for broad reforms including an eight-hour day, an end to child labor, and cooperative ownership of industry.",
    citation: "Knights of Labor platform and Terence Powderly's writings, 1870s-1880s.",
    externalUrl: null,
  },
  {
    id: "u06-booker-t-washington-atlanta-exposition-address",
    unit: 6,
    priority: "essential",
    topPriorityRank: null,
    title: "Atlanta Exposition Address",
    creator: "Booker T. Washington",
    date: "1895",
    apushUse: "Accommodation and Black economic advancement",
    excerpt:
      'Washington urged Black Southerners to focus on vocational education and economic self-improvement rather than immediate demands for social and political equality, telling white listeners "in all things that are purely social we can be as separate as the fingers."',
    citation:
      "Booker T. Washington, address at the Atlanta Cotton States and International Exposition, September 18, 1895.",
    externalUrl: null,
  },
  {
    id: "u06-plessy-v-ferguson",
    unit: 6,
    priority: "essential",
    topPriorityRank: 40,
    title: "Plessy v. Ferguson",
    creator: "U.S. Supreme Court",
    date: "1896",
    apushUse: "Legal segregation",
    excerpt:
      'The Court upheld a Louisiana law requiring racially "separate but equal" railroad cars, ruling that legally mandated segregation did not itself violate the 14th Amendment\'s equal protection clause — a decision that legitimized Jim Crow segregation until Brown v. Board of Education in 1954.',
    citation: "Plessy v. Ferguson, 163 U.S. 537 (1896).",
    externalUrl: null,
  },
  {
    id: "u06-sumner-social-darwinist-writings",
    unit: 6,
    priority: "very_common",
    topPriorityRank: null,
    title: "Social Darwinist writings",
    creator: "William Graham Sumner",
    date: "1880s",
    apushUse: "Laissez-faire and the defense of inequality",
    excerpt:
      "Applying evolutionary language to society, Sumner argued that government efforts to help the poor interfered with a natural, beneficial process of competition that rewarded the fittest, and that inequality was a natural and even desirable outcome of a free society.",
    citation:
      "William Graham Sumner, What Social Classes Owe to Each Other, 1883, and related writings.",
    externalUrl: null,
  },
  {
    id: "u06-henry-george-progress-and-poverty",
    unit: 6,
    priority: "very_common",
    topPriorityRank: null,
    title: "Progress and Poverty",
    creator: "Henry George",
    date: "1879",
    apushUse: "Criticism of Gilded Age inequality",
    excerpt:
      'George asked why growing industrial wealth coexisted with deepening poverty, and proposed a "single tax" on the unearned rise in land values as a remedy — a widely read critique that influenced later Progressive and reform movements.',
    citation: "Henry George, Progress and Poverty, 1879.",
    externalUrl: null,
  },
  {
    id: "u06-bellamy-looking-backward",
    unit: 6,
    priority: "very_common",
    topPriorityRank: null,
    title: "Looking Backward",
    creator: "Edward Bellamy",
    date: "1888",
    apushUse: "Utopian criticism of industrial capitalism",
    excerpt:
      "Bellamy's bestselling novel imagines a man who falls asleep in 1887 and wakes in a peaceful, cooperative socialist Boston of the year 2000, offering an influential utopian critique of Gilded Age capitalism's inequality and conflict.",
    citation: "Edward Bellamy, Looking Backward: 2000-1887, 1888.",
    externalUrl: null,
  },
  {
    id: "u06-henry-grady-new-south-speech",
    unit: 6,
    priority: "very_common",
    topPriorityRank: null,
    title: "New South speech",
    creator: "Henry Grady",
    date: "1886",
    apushUse: "Southern industrialization",
    excerpt:
      'An Atlanta newspaper editor, Grady promoted a vision of a "New South" reconciled with the North, diversified beyond cotton agriculture into industry, while leaving the region\'s racial hierarchy largely intact.',
    citation:
      'Henry Grady, "The New South," speech to the New England Society of New York, December 21, 1886.',
    externalUrl: null,
  },
  {
    id: "u06-ida-b-wells-anti-lynching-writings",
    unit: 6,
    priority: "very_common",
    topPriorityRank: null,
    title: "Anti-lynching writings",
    creator: "Ida B. Wells",
    date: "1890s",
    apushUse: "Racial violence and Black activism",
    excerpt:
      "Wells investigated and publicized lynchings across the South, statistically documenting cases and demonstrating that alleged justifications (like accusations against Black men) were often pretexts for economic or social control, becoming a leading anti-lynching crusader.",
    citation:
      "Ida B. Wells, Southern Horrors: Lynch Law in All Its Phases, 1892, and related pamphlets.",
    externalUrl: null,
  },
  {
    id: "u06-turner-frontier-thesis",
    unit: 6,
    priority: "very_common",
    topPriorityRank: null,
    title: "The Significance of the Frontier in American History",
    creator: "Frederick Jackson Turner",
    date: "1893",
    apushUse: "The frontier thesis",
    excerpt:
      "Turner argued that the existence of a westward-moving frontier had shaped American democracy, individualism, and character, and warned that the Census Bureau's 1890 declaration of a closed frontier marked the end of a defining era in American development.",
    citation:
      'Frederick Jackson Turner, "The Significance of the Frontier in American History," address to the American Historical Association, 1893.',
    externalUrl: null,
  },
  {
    id: "u06-farmers-alliance-declarations",
    unit: 6,
    priority: "very_common",
    topPriorityRank: null,
    title: "Declarations",
    creator: "Farmers' Alliance",
    date: "1880s",
    apushUse: "Agrarian grievances",
    excerpt:
      "Regional farmers' alliances organized cooperative buying and selling and protested falling crop prices, high railroad rates, and crushing debt, laying organizational groundwork that fed directly into the Populist Party's 1892 Omaha Platform.",
    citation: "Farmers' Alliance declarations and platforms, 1880s.",
    externalUrl: null,
  },
  {
    id: "u06-homestead-pullman-strike-testimony",
    unit: 6,
    priority: "very_common",
    topPriorityRank: null,
    title: "Homestead or Pullman strike testimony",
    creator: "Steelworkers (Homestead, 1892) and railway workers (Pullman, 1894)",
    date: "1890s",
    apushUse: "Labor conflict and its suppression",
    excerpt:
      "Testimony from the violent Homestead steel strike and the nationwide Pullman railway boycott/strike describes company use of private security (Pinkertons) and federal troops to break strikes, illustrating the era's often-violent labor conflicts and limited legal protection for unions.",
    citation:
      "Congressional and press testimony concerning the Homestead Strike (1892) and Pullman Strike (1894).",
    externalUrl: null,
  },
  {
    id: "u06-munn-v-illinois",
    unit: 6,
    priority: "useful",
    topPriorityRank: null,
    title: "Munn v. Illinois",
    creator: "U.S. Supreme Court",
    date: "1877",
    apushUse: "State regulation of private property affected with a public interest",
    excerpt:
      'The Court upheld an Illinois law regulating grain elevator rates, ruling that private property "affected with a public interest" could be regulated by the state in the public good — an early legal foundation for economic regulation.',
    citation: "Munn v. Illinois, 94 U.S. 113 (1877).",
    externalUrl: null,
  },
  {
    id: "u06-wabash-v-illinois",
    unit: 6,
    priority: "useful",
    topPriorityRank: null,
    title: "Wabash v. Illinois",
    creator: "U.S. Supreme Court",
    date: "1886",
    apushUse: "Limits on state railroad regulation",
    excerpt:
      "The Court ruled that states could not regulate rates on interstate railroad shipments, since only Congress had power over interstate commerce — a decision that helped spur Congress to pass the federal Interstate Commerce Act the following year.",
    citation: "Wabash, St. Louis & Pacific Railway Co. v. Illinois, 118 U.S. 557 (1886).",
    externalUrl: null,
  },
  {
    id: "u06-pendleton-civil-service-act",
    unit: 6,
    priority: "useful",
    topPriorityRank: null,
    title: "Pendleton Civil Service Act",
    creator: "Congress",
    date: "1883",
    apushUse: "Political reform",
    excerpt:
      'Passed after the 1881 assassination of President Garfield by a disappointed office-seeker, the act created a merit-based civil service exam system for federal jobs, reducing (though not eliminating) the patronage "spoils system."',
    citation: "Pendleton Civil Service Reform Act, January 16, 1883.",
    externalUrl: null,
  },
];

export const UNIT_06_VISUAL_SOURCES = [
  {
    id: "u06-visual-standard-oil-octopus",
    unit: 6,
    title: "Udo Keppler's Standard Oil octopus cartoon",
    description:
      "A famous 1904 political cartoon depicting Standard Oil as an octopus with tentacles wrapped around Congress, state legislatures, and industries, symbolizing monopoly power's reach into American political and economic life.",
    citation: 'Udo J. Keppler, "Next!", Puck magazine, September 7, 1904.',
    externalUrl: "https://www.loc.gov/item/2010652057",
  },
  {
    id: "u06-visual-boss-tweed-cartoons",
    unit: 6,
    title: "Thomas Nast's Boss Tweed cartoons",
    description:
      'Political cartoons attacking William "Boss" Tweed and New York\'s Tammany Hall political machine for corruption, credited with helping turn public opinion against Tweed and contribute to his downfall.',
    citation: "Thomas Nast, cartoons published in Harper's Weekly, early 1870s.",
    externalUrl: null,
  },
  {
    id: "u06-visual-railroad-monopoly-cartoons",
    unit: 6,
    title: "Railroad monopoly cartoons",
    description:
      "Political cartoons depicting railroad companies as controlling farmers and shippers through discriminatory rates, used to illustrate the grievances behind the Grange movement and the Interstate Commerce Act.",
    citation: "Various late-19th-century American political cartoons on railroad monopoly power.",
    externalUrl: null,
  },
  {
    id: "u06-visual-chinese-exclusion-cartoons",
    unit: 6,
    title: "Chinese exclusion cartoons",
    description:
      "Political cartoons from the 1870s-1880s, many overtly racist, depicting Chinese immigrants as an economic and cultural threat, used to illustrate the nativist sentiment behind the Chinese Exclusion Act.",
    citation: "Various American political cartoons, 1870s-1880s.",
    externalUrl: null,
  },
  {
    id: "u06-visual-trust-controlled-senate",
    unit: 6,
    title: "Trust-controlled Senate images",
    description:
      'Political cartoons depicting the U.S. Senate chamber packed with giant money-bag "trust" figures looming over senators, used to illustrate Populist and Progressive-era concerns about corporate influence over government.',
    citation: 'E.g. Joseph Keppler, "The Bosses of the Senate," Puck magazine, January 23, 1889.',
    externalUrl: null,
  },
];
