/**
 * Chronicle opening copy.
 *
 * This is the version committed to the repository: the canonical default copy.
 * Author Mode can create a browser-local draft on top of it, and export that
 * draft as JSON when a wording pass is ready to be committed.
 */
export const CHRONICLE_OPENING_DEFAULTS = {
  brand: {
    engineName: 'Republic Builder Engine',
    productName: 'Chronicle'
  },
  status: {
    text: 'Institute link stable'
  },
  footer: {
    left: 'Chronicle Institute orientation build',
    right: 'Milestone 1 · Opening sequence'
  },
  archiveSignal: {
    kicker: 'Archive Signal',
    year: '1491',
    title: 'New record detected',
    body: 'The Atlantic world is about to change. The Institute requires a Chronicler.',
    tag: 'Case 1.01 queued'
  },
  scenes: {
    welcome: {
      eyebrow: 'Republic Builder Engine',
      title: 'Chronicle',
      subtitle: 'An AP U.S. History Adventure',
      body: 'The past is not a list of dates. It is a record waiting to be investigated.',
      action: 'Begin Orientation',
      secondary: 'What is Chronicle?'
    },
    briefing: {
      eyebrow: 'Chronicle Institute — Orientation Briefing',
      title: 'The archive needs a Chronicler.',
      subtitle: 'A historical investigation begins with a question.',
      body: 'The Chronicle Institute preserves humanity’s understanding of the past. The Archive has detected instability in the historical record. Your task is not to change history, but to investigate it, collect evidence, and report what can be proven.',
      action: 'Continue Briefing',
      secondary: 'Return to title'
    },
    oath: {
      eyebrow: 'Chronicle Institute — Field Protocol',
      title: 'Welcome, Chronicler.',
      subtitle: 'Listen. Investigate. Report.',
      body: 'Your first assignment will open in Unit 1: The Atlantic Crossroads. Before you travel, the Institute must prepare your field identity.',
      action: 'Create Chronicler',
      secondary: 'Review briefing'
    },
    character: {
      eyebrow: 'Milestone 2 Preview',
      title: 'Your Chronicle identity comes next.',
      subtitle: 'Character creation is the next build milestone.',
      body: 'In the completed version, this is where a student will choose a name, pronouns, and basic appearance before receiving their Chronicle Codex. For now, this confirms that the opening flow is wired correctly.',
      action: 'Return to Orientation',
      secondary: 'View first assignment'
    }
  },
  director: {
    kicker: 'Institute Director',
    title: 'The Director',
    quote: '“History does not need another hero. It needs a careful witness.”'
  },
  protocol: [
    {
      number: '01',
      title: 'Observe',
      body: 'Enter historical settings without altering them.'
    },
    {
      number: '02',
      title: 'Source',
      body: 'Ask who created each record, why, and for whom.'
    },
    {
      number: '03',
      title: 'Report',
      body: 'Use evidence to explain what can be proven.'
    }
  ],
  assignment: {
    kicker: 'First Assignment',
    unit: 'Unit 1 · Period 1: 1491–1607',
    title: 'The Atlantic Crossroads',
    description: 'Investigate how contact between Europe, Africa, and the Americas began to reshape societies on both sides of the Atlantic.',
    details: [
      'Chronicle Institute briefing',
      'Field arrival in the Caribbean',
      'Evidence collection',
      'Exchange Ledger activity',
      'AP-style MCQ + SAQ report'
    ]
  }
};
