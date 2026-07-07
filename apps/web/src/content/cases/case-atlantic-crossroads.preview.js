export const ATLANTIC_CROSSROADS_CASE = {
  id: 'case-atlantic-crossroads',
  title: 'The Atlantic Crossroads',
  label: 'Case 1.01 · Unit 1 · Period 1: 1491–1607',
  location: 'Caribbean field setting · 1492',
  centralQuestion: 'How did contact between Europe, Africa, and the Americas begin to reshape societies on both sides of the Atlantic?',
  entryMessage: 'Before you trace exchange, establish what already existed. The Caribbean was already home to complex Indigenous communities before European expeditions arrived.',
  objectives: [
    'Establish context: identify evidence of Caribbean societies before contact.',
    'Source a European account: determine whose perspective it reflects.',
    'Recognize a visual-source warning: images can misrepresent the places they claim to show.'
  ],
  evidence: [
    {
      id: 'community-context',
      label: 'Community context',
      location: 'Community path',
      type: 'Context record',
      title: 'Taíno communities in the Greater Antilles',
      excerpt: 'Taíno communities had their own language, political organization, arts, ceremonial practices, staple crops, and canoe travel before European contact.',
      whyItMatters: 'The historical setting did not begin with Europeans. This evidence helps establish what already existed in the Caribbean.',
      citation: 'Virgin Islands National Park, “St. John History Timeline,” AD 1200–1500.',
      sourceUrl: 'https://www.nps.gov/viis/learn/timeline.htm',
      prompt: 'What does this record help you establish before evaluating European accounts?'
    },
    {
      id: 'columbus-letter',
      label: 'European account',
      location: 'Survey table',
      type: 'Primary source',
      title: 'Christopher Columbus’s 1493 letter',
      excerpt: '“There I found very many islands, filled with innumerable people …”',
      whyItMatters: 'This is an account written by an expedition leader for the Spanish monarchy. It is evidence of Columbus’s claims and point of view—not a complete account of Indigenous experience.',
      citation: 'Christopher Columbus, letter reporting on the 1492 voyage, printed 1493; Library of Congress.',
      sourceUrl: 'https://www.loc.gov/exhibits/exploring-the-early-americas/columbus-and-the-taino.html',
      prompt: 'Whose perspective is most visible in this account, and why does that matter?'
    },
    {
      id: 'visual-record',
      label: 'Visual-source warning',
      location: 'Archive signal',
      type: 'Visual source note',
      title: 'An image does not automatically show what it claims to show',
      excerpt: 'A 1494 printed edition of Columbus’s letter used woodcuts that were largely adapted from Mediterranean settings rather than direct depictions of the Caribbean.',
      whyItMatters: 'Source analysis includes images. Before using a visual source as evidence, investigate where it came from and how it was made.',
      citation: 'Library of Congress, “Columbus’s Voyage and the New World.”',
      sourceUrl: 'https://www.loc.gov/exhibits/exploring-the-early-americas/columbus-and-the-taino.html',
      prompt: 'What question should you ask before treating a historical image as a reliable depiction?'
    }
  ],
  sourceCheck: {
    question: 'Columbus’s letter most directly reflects the perspective of:',
    answers: [
      'A Taíno community member describing local life before contact',
      'A European expedition leader reporting to Spanish monarchs',
      'A twentieth-century archaeologist interpreting artifacts',
      'A printer who created an imaginary Caribbean landscape'
    ],
    correct: 1,
    feedback: 'Correct. The letter was written by Columbus after the voyage for Spain’s rulers. That makes it valuable evidence of European goals and claims, while also limiting what it can tell us about Indigenous experience.'
  }
};
