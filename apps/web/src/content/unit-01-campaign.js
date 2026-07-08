export const BRAND = {
  engine: 'Republic Builder Engine',
  campaign: 'Chronicle',
  status: 'Archive connection secure'
};

export const UNIT_01 = {
  id: 'unit-01',
  title: 'The Atlantic World',
  period: '1491–1607',
  description: 'Investigate the societies, exchanges, and colonial systems that reshaped the Atlantic world after 1492.',
  centralQuestion: 'How did contact among Europe, Africa, and the Americas reshape societies on both sides of the Atlantic?',
  cases: [
    {
      id: 'case-001',
      shortTitle: 'Caribbean',
      title: 'Case 1.01 — The Atlantic Crossroads',
      date: '1493',
      mapPosition: { left: '28.5%', top: '64.5%' },
      location: 'Caribbean · 1493',
      question: 'How did early contact begin to reshape societies on both sides of the Atlantic?',
      mechanic: 'Record Reconstruction',
      route: 'field',
      summary: 'Establish what existed before contact, analyze a European account, and trace how early voyages changed the historical record.'
    },
    {
      id: 'case-002',
      shortTitle: 'Atlantic Routes',
      title: 'Case 1.02 — The Exchange Ledger',
      date: '1493–1540',
      mapPosition: { left: '48.5%', top: '51%' },
      location: 'Atlantic Ocean · c. 1493–1540',
      question: 'How did the movement of crops, diseases, animals, and people transform the Atlantic world?',
      mechanic: 'Atlantic Route Puzzle',
      route: 'ledger',
      summary: 'Build a route ledger that distinguishes movement across the Atlantic from its historical consequences.'
    },
    {
      id: 'case-003',
      shortTitle: 'Hispaniola',
      title: 'Case 1.03 — Empire’s Foundations',
      date: '1502',
      mapPosition: { left: '31.7%', top: '67.5%' },
      location: 'Spanish Caribbean · c. 1502',
      question: 'How did conquest and colonization create new systems of labor, power, and social hierarchy?',
      mechanic: 'Colonial System Builder',
      route: 'empire',
      summary: 'Connect evidence about conquest, labor, forced migration, hierarchy, resistance, and cultural exchange.'
    }
  ]
};

export const CASE_001_SOURCES = [
  {
    id: 'taino-context',
    type: 'Secondary context',
    title: 'The Caribbean—Island Society',
    creator: 'Library of Congress exhibition text',
    date: '1991 exhibition text',
    record: '1492: An Ongoing Voyage, Library of Congress',
    visual: 'context',
    excerpt: 'The largest group of people living in the islands of the Caribbean were the Taínos. Their villages were governed by chieftains, or caciques. Related families lived together in large houses built of poles, mats, and thatch.',
    prompt: 'What does this record establish about Caribbean societies before contact? Use one specific detail.',
    feedback: 'The record establishes that Caribbean societies were organized and longstanding before European arrival. It is useful context, but it is not a Taíno-authored primary source.',
    citation: 'Library of Congress, “What Came To Be Called ‘America’,” 1492: An Ongoing Voyage, “The Caribbean—Island Society.”',
    externalUrl: 'https://www.loc.gov/exhibits/1492/america.html',
    reconstruction: 'precontact'
  },
  {
    id: 'columbus-letter',
    type: 'Primary source · letter',
    title: 'Letter Reporting on the First Voyage',
    creator: 'Christopher Columbus',
    date: '1493',
    record: 'Letter to Rafael Sánchez, written after the first voyage',
    visual: 'letter',
    excerpt: '“They are so ingenuous and free with all they have, that no one would believe it without seeing it.”',
    prompt: 'How do the creator and intended audience shape what this letter emphasizes?',
    feedback: 'Columbus wrote as the leader of a Spanish expedition reporting to a royal official. His word choices and claims can reveal his goals, assumptions, and effort to justify further support.',
    citation: 'Christopher Columbus, Letter to Rafael Sánchez, 1493; Library of Congress digital collections.',
    externalUrl: 'https://www.loc.gov/item/18018461/',
    reconstruction: 'encounter'
  },
  {
    id: 'waldseemuller-map',
    type: 'Primary source · map',
    title: 'Universalis cosmographia',
    creator: 'Martin Waldseemüller',
    date: '1507',
    record: 'Printed world map; Library of Congress Geography and Map Division',
    visual: 'map',
    excerpt: 'A printed European world map made after early Atlantic voyages. It depicts a separate Western Hemisphere and labels the new lands “America.”',
    prompt: 'What does this map reveal about changing European geographic knowledge after early Atlantic voyages?',
    feedback: 'The map helps show that European geographic knowledge was changing after contact. It should not be treated as a direct picture of Caribbean life in 1493.',
    citation: 'Martin Waldseemüller, Universalis cosmographia secundum Ptholomaei traditionem et Americi Vespucii aliorumque lustrationes, 1507. Library of Congress.',
    externalUrl: 'https://www.loc.gov/item/2003626426',
    localAsset: 'source-waldseemuller-1507.jpg',
    reconstruction: 'knowledge'
  }
];

export const EXCHANGE_RECORDS = [
  {
    id: 'maize', label: 'Maize', icon: '🌽',
    sourceTitle: 'José de Acosta, Natural and Moral History of the Indies',
    sourceMeta: 'Spanish Jesuit observer · 1590 · primary-source excerpt',
    excerpt: '“The principal grain of the Indies is maize … whereof the Indians make their bread.”',
    sourceNote: 'Acosta wrote after contact, but his wording identifies maize as a staple cultivated in the Americas rather than a European introduction.',
    question: 'Which claim is best supported by this record?',
    choices: ['Maize was already an important American crop before European contact.', 'Maize entered the Americas only after Spanish conquest.', 'Maize caused the first epidemics in the Caribbean.', 'Maize was transported through forced migration from Africa.'],
    answer: 0,
    citation: 'José de Acosta, The Natural and Moral History of the Indies (1590), public-domain English translation; wording varies by translation.'
  },
  {
    id: 'smallpox', label: 'Smallpox', icon: '✦',
    sourceTitle: 'Toribio de Benavente “Motolinía,” History of the Indians of New Spain',
    sourceMeta: 'Franciscan chronicler · c. 1541 · primary-source excerpt',
    excerpt: '“In the year 1520 came the smallpox … and a very great many Indians died of it.”',
    sourceNote: 'Motolinía’s account records an epidemic after European contact. It must be read as a colonial observer’s testimony, not as an Indigenous voice.',
    question: 'Which development most directly explains the devastation described?',
    choices: ['Indigenous communities had long-established immunity to the disease.', 'Many American populations lacked prior exposure to Old World pathogens.', 'Smallpox spread only among European settlers.', 'The epidemic was caused by the expansion of maize cultivation.'],
    answer: 1,
    citation: 'Toribio de Benavente “Motolinía,” History of the Indians of New Spain, c. 1541, public-domain English translation; wording varies by translation.'
  },
  {
    id: 'horses', label: 'Horses', icon: '♞',
    sourceTitle: 'Bernal Díaz del Castillo, True History of the Conquest of New Spain',
    sourceMeta: 'Spanish conquistador · completed c. 1568 · primary-source excerpt',
    excerpt: '“The sight of the horses caused them great wonder.”',
    sourceNote: 'Díaz wrote from the viewpoint of a Spanish participant. His account can help document early encounter, but it does not justify treating Indigenous societies as passive or uniform.',
    question: 'Which interpretation best follows from the introduction of horses?',
    choices: ['Horses had no effect outside Spanish military units.', 'Horses reshaped mobility, hunting, warfare, and transportation in some American societies over time.', 'Horses were native to the Americas before 1492.', 'Horses caused the immediate transfer of European political systems to Indigenous communities.'],
    answer: 1,
    citation: 'Bernal Díaz del Castillo, True History of the Conquest of New Spain, completed c. 1568; public-domain English translations vary.'
  },
  {
    id: 'enslaved-africans', label: 'Enslaved Africans', icon: '⛓',
    sourceTitle: 'Spanish Crown license for African captives to the Indies',
    sourceMeta: 'Royal authorization · 1518 · primary administrative record',
    excerpt: 'The Crown authorized the transport of African captives to “the Indies” under royal license.',
    sourceNote: 'The administrative language hides the human violence of forced migration. Read it alongside the effects of colonial labor demands and racial hierarchy.',
    question: 'Which conclusion is best supported by this record?',
    choices: ['Atlantic slavery was a voluntary exchange among equal societies.', 'Colonial governments treated enslaved Africans as a labor force to be moved for imperial economies.', 'African migration to the Americas began only after the United States became independent.', 'The Crown license ended coercive labor systems in the Spanish Caribbean.'],
    answer: 1,
    citation: 'Spanish Crown license authorizing the transport of African captives to the Indies, 1518; see early Atlantic slavery source collections and transcriptions.'
  }
];

export const EMPIRE_EVIDENCE = [
  {
    id: 'claim', label: 'Conquest and Spanish claims', source: 'Requerimiento, 1513',
    detail: 'Spanish officials asserted authority over Indigenous communities and demanded submission to the Spanish crown and Christianity.'
  },
  {
    id: 'encomienda', label: 'Encomienda labor', source: 'Spanish colonial labor system',
    detail: 'Spanish colonists received the right to demand labor and tribute from Indigenous communities.'
  },
  {
    id: 'slavery', label: 'Expansion of African slavery', source: 'Atlantic forced migration',
    detail: 'Colonial demand for labor accelerated the forced migration of Africans to the Americas.'
  },
  {
    id: 'hierarchy', label: 'Caste and social hierarchy', source: 'Colonial social order',
    detail: 'Colonial rule developed systems that ranked people by ancestry, legal status, and place of birth.'
  },
  {
    id: 'resistance', label: 'Resistance and adaptation', source: 'Indigenous and African communities',
    detail: 'People resisted exploitation, preserved practices, adapted to change, and created new cultural forms.'
  },
  {
    id: 'exchange', label: 'Cultural interaction', source: 'Atlantic communities',
    detail: 'Language, religion, foodways, and customs changed through conflict, coercion, adaptation, and exchange.'
  }
];

export const EMPIRE_CONNECTIONS = [
  { from: 'claim', to: 'encomienda', clue: 'Spanish claims of authority helped justify demands for tribute and labor.' },
  { from: 'encomienda', to: 'slavery', clue: 'Labor demands and Indigenous population losses contributed to a growing reliance on enslaved Africans.' },
  { from: 'slavery', to: 'hierarchy', clue: 'Colonial labor systems were tied to legal and racialized social hierarchy.' },
  { from: 'hierarchy', to: 'resistance', clue: 'People subjected to colonial rule acted within and against these systems.' },
  { from: 'resistance', to: 'exchange', clue: 'Cultural interaction developed through conflict, survival, adaptation, and exchange.' }
];

export const REVIEW = {
  mcq: [
    {
      prompt: 'The Taíno context record most directly challenges which interpretation of the Caribbean before 1492?',
      choices: ['The islands lacked organized communities before European arrival.', 'Caribbean societies depended entirely on European leadership.', 'European colonization began before Indigenous settlement.', 'Indigenous peoples had no political or social structures.'],
      answer: 0,
      explanation: 'The record describes caciques, villages, and related families living in large houses, supporting the existence of organized societies before European arrival.'
    },
    {
      prompt: 'Columbus’s intended audience most likely influenced his 1493 letter because he was writing to',
      choices: ['a Taíno community that asked him to describe Spain', 'a Spanish royal official whose support could affect future expeditions', 'a mapmaker who had already visited the Caribbean', 'an African leader negotiating Atlantic trade'],
      answer: 1,
      explanation: 'The letter was addressed to Rafael Sánchez, treasurer to the Spanish monarchs, so the report could help justify future royal support.'
    },
    {
      prompt: 'Which development best explains the immediate demographic effect of smallpox in the Americas?',
      choices: ['Indigenous communities had already developed widespread immunity.', 'Smallpox only spread among European settlers.', 'Many Indigenous populations had no previous exposure to the disease.', 'The disease entered the Americas only after 1800.'],
      answer: 2,
      explanation: 'Lack of previous exposure contributed to devastating epidemics among Indigenous communities.'
    },
    {
      prompt: 'The forced migration of enslaved Africans to the Americas was most directly connected to',
      choices: ['colonial demand for labor in expanding Atlantic economies', 'the disappearance of all Indigenous labor systems before 1492', 'a voluntary exchange of workers among equal states', 'an effort to reduce social hierarchy in Spanish colonies'],
      answer: 0,
      explanation: 'Colonial demand for labor, especially in plantation and mining economies, drove the expansion of Atlantic slavery.'
    },
    {
      prompt: 'The Waldseemüller map is most useful for historians studying',
      choices: ['the exact daily routines of Taíno villages in 1493', 'changes in European geographic knowledge after Atlantic voyages', 'the final boundaries of modern Latin American nation-states', 'the first English settlement at Jamestown'],
      answer: 1,
      explanation: 'The 1507 map reflects changing European geographic knowledge after early voyages.'
    },
    {
      prompt: 'Which statement best describes cultural interaction in the early Atlantic world?',
      choices: ['It was limited to peaceful trade among equal groups.', 'It occurred only after the United States became independent.', 'It involved conflict, coercion, adaptation, and the creation of new practices.', 'It eliminated all Indigenous and African cultural traditions.'],
      answer: 2,
      explanation: 'Early Atlantic interaction included violence and coercion as well as adaptation and cultural persistence.'
    }
  ],
  saq: {
    stimulus: '“They are so ingenuous and free with all they have, that no one would believe it without seeing it.” — Christopher Columbus, 1493',
    prompts: [
      'A. Identify one feature of Columbus’s position or audience that shaped this document.',
      'B. Explain one way the Columbian Exchange changed societies in either the Americas or the Old World between 1491 and 1607.',
      'C. Explain one way Spanish colonial labor systems contributed to a new social hierarchy in the Americas.'
    ],
    rubric: 'SAQ practice rubric: 3 points total. Earn 1 point for each response that gives a historically defensible claim and supports it with accurate, relevant historical information.'
  }
};
