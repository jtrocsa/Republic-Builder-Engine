export const CHRONICLE_CONTENT = {
  brand: { engine: 'Republic Builder Engine', campaign: 'Chronicle', status: 'Archive connection secure' },
  institute: {
    title: 'Chronicle Institute',
    subtitle: 'The Archive is your point of return.',
    body: 'Review your current assignment, consult the map table, and enter the historical record only when the Institute has cleared a route.',
    enter: 'Enter the Archive',
    table: 'Open Navigation Table',
    return: 'Return to Institute',
    mapTitle: 'Chronicle Navigation Table',
    mapBody: 'Each illuminated point marks a teacher-unlocked case. The Archive will open only one route at a time.',
    currentCase: 'Caribbean · 1493',
    currentTitle: 'Case 1.01 — The Atlantic Crossroads',
    currentDescription: 'Investigate how early Atlantic contact reshaped societies on both sides of the ocean.',
    travel: 'Initiate Chronotravel',
    locked: 'Future unit · Teacher locked'
  },
  case: {
    title: 'The Atlantic Crossroads',
    location: 'Caribbean · 1493',
    centralQuestion: 'How did early contact among Europe, Africa, and the Americas begin to reshape societies on both sides of the Atlantic?',
    mentor: 'Maren Vale',
    mentorRole: 'Senior Chronicler · Field Mentor',
    mentorNote: 'Start with the evidence. The people and societies of the Caribbean did not begin with European arrival. Secure each record, then use your Codex to test what it can support.',
    finish: 'Submit field record',
    return: 'Return to the Archive'
  }
};

export const CASE_001_SOURCES = [
  {
    id: 'taino-context',
    signalLabel: 'Community record',
    sourceType: 'Secondary context',
    title: 'The Caribbean—Island Society',
    creator: 'Library of Congress exhibition text',
    date: '1991 exhibition text',
    provenance: '1492: An Ongoing Voyage, Library of Congress',
    excerpt: 'The largest group of people living in the islands of the Caribbean were the Taínos. Their villages were governed by chieftains, or caciques. Related families lived together in large houses built of poles, mats, and thatch.',
    context: 'This is a modern secondary-context record. It helps establish that Caribbean societies were organized and longstanding before European arrival. It is not a Taíno-authored primary source.',
    sourceQuestion: 'What does this record establish about the Caribbean before contact?',
    citation: 'Library of Congress, “What Came To Be Called ‘America’,” 1492: An Ongoing Voyage, “The Caribbean—Island Society.”',
    sourceUrl: 'https://www.loc.gov/exhibits/1492/america.html',
    visual: 'context'
  },
  {
    id: 'columbus-letter',
    signalLabel: 'European letter',
    sourceType: 'Primary source · Letter',
    title: 'Letter Reporting on the First Voyage',
    creator: 'Christopher Columbus',
    date: '1493',
    provenance: 'Letter to Rafael Sánchez, written on the return from the first voyage',
    excerpt: '“They are so ingenuous and free with all they have, that no one would believe it without seeing it.”',
    context: 'This excerpt comes from Columbus’s report after his first voyage. It is evidence of a European expedition leader’s observations and goals, not a neutral account of Indigenous life.',
    sourceQuestion: 'How do the creator and intended audience shape what this letter emphasizes?',
    citation: 'Christopher Columbus, Letter to Rafael Sánchez, 1493; facsimile and English translation held by the Library of Congress.',
    sourceUrl: 'https://www.loc.gov/item/18018461/',
    visual: 'letter'
  },
  {
    id: 'waldseemuller-map',
    signalLabel: 'Atlantic map',
    sourceType: 'Primary source · Map',
    title: 'Universalis cosmographia',
    creator: 'Martin Waldseemüller',
    date: '1507',
    provenance: 'Printed world map; Library of Congress Geography and Map Division',
    excerpt: 'A printed European world map made after early Atlantic voyages. It depicts a separate Western Hemisphere and labels the new lands “America.”',
    context: 'This visual source was created years after Columbus’s first voyage. Use it to ask how European geographic knowledge was changing—not to treat it as a direct picture of Caribbean life in 1493.',
    sourceQuestion: 'What does a map reveal about the mapmaker’s knowledge and assumptions?',
    citation: 'Martin Waldseemüller, Universalis cosmographia secundum Ptholomaei traditionem et Americi Vespucii aliorumque lustrationes, 1507. Library of Congress.',
    sourceUrl: 'https://www.loc.gov/item/2003626426/',
    visual: 'map',
    imageUrl: 'https://tile.loc.gov/image-services/iiif/service:gmd:gmd385:g3850:g3850:ct000725/full/pct:15/0/default.jpg'
  }
];
