/**
 * Chronicle opening copy.
 *
 * This file is the canonical default copy committed to the repository.
 * Author Mode creates browser-local drafts on top of these defaults and can
 * export a JSON snapshot when a wording pass is ready to publish.
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
    right: 'Milestone 2 · Chronicle Identity'
  },
  archiveSignal: {
    kicker: 'Archive Signal',
    year: '1491',
    title: 'Record drift detected',
    body: 'The Atlantic world is about to change. The Institute requires a Chronicler.',
    tag: 'Case 1.01 queued'
  },
  scenes: {
    welcome: {
      eyebrow: 'Republic Builder Engine',
      title: 'Chronicle',
      subtitle: 'An AP U.S. History Adventure',
      body: 'The past does not speak for itself. You must investigate the evidence it leaves behind.',
      action: 'Begin Orientation',
      secondary: 'What is Chronicle?'
    },
    oath: {
      eyebrow: 'Chronicle Institute — Field Protocol',
      title: 'Welcome, Chronicler.',
      subtitle: 'Observe. Source. Report.',
      body: 'Your first assignment is ready. These rules protect the historical record—and define the work of a Chronicler.',
      action: 'Create Chronicler',
      secondary: 'Review Director briefing'
    },
    character: {
      eyebrow: 'Milestone 2 · Chronicle Identity',
      title: 'Identity registry online.',
      subtitle: 'Your field record is ready for registration.',
      body: 'This transition is now handled by the Chronicle Identity feature, where the player chooses an appearance and name before receiving a Codex.',
      action: 'Create Chronicler',
      secondary: 'Review field protocol'
    }
  },
  director: {
    kicker: 'Institute Director',
    title: 'Director of the Archive',
    quote: '“History does not need another hero. It needs someone willing to follow the evidence.”'
  },
  directorBriefing: {
    entries: [
      {
        eyebrow: 'Director’s briefing · 01 / 04',
        title: 'The record is changing.',
        subtitle: 'The Chronicle Institute preserves humanity’s understanding of the past.',
        body: 'We have detected a record drift: an anomaly in the historical record. At first, it appeared small—a sentence missing from a letter, a date altered in a newspaper, a map that no longer matched the world it was meant to describe.',
        action: 'Continue briefing',
        secondary: 'Return to title'
      },
      {
        eyebrow: 'Director’s briefing · 02 / 04',
        title: 'The past survives in fragments.',
        subtitle: 'Testimony. Artifacts. Images. Laws. Journals. The voices people left behind.',
        body: 'When those fragments change, disappear, or begin to contradict what they once revealed, humanity loses more than information. It loses its ability to understand itself.',
        action: 'Continue briefing',
        secondary: 'Previous message'
      },
      {
        eyebrow: 'Director’s briefing · 03 / 04',
        title: 'That is why the Institute needs Chroniclers.',
        subtitle: 'A Chronicler does not travel into the past to become its hero.',
        body: 'You do not alter events. You investigate the evidence: who created it, why they created it, who was meant to see it, and what it can truly prove. You gather the record before it is lost.',
        action: 'Continue briefing',
        secondary: 'Previous message'
      },
      {
        eyebrow: 'Director’s briefing · 04 / 04',
        title: 'Follow the evidence.',
        subtitle: 'Return with an account others can examine, challenge, and understand.',
        body: 'The Archive needs a Chronicler. We need you.',
        action: 'Accept field protocol',
        secondary: 'Previous message'
      }
    ]
  },
  protocol: [
    {
      number: '01',
      title: 'Observe',
      body: 'Enter the moment. Leave history untouched.'
    },
    {
      number: '02',
      title: 'Source',
      body: 'Interrogate the record: creator, audience, purpose.'
    },
    {
      number: '03',
      title: 'Report',
      body: 'Return with evidence. Preserve what can be proven.'
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
