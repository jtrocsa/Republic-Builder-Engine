/**
 * Chronicle opening copy.
 *
 * This file is the canonical default copy committed to the repository.
 * Author Mode creates browser-local drafts on top of these defaults and can
 * export a JSON snapshot when a wording pass is ready to publish.
 */
export const CHRONICLE_OPENING_DEFAULTS = {
  brand: {
    engineName: "Republic Builder Engine",
    productName: "Chronicle",
  },
  status: {
    text: "Institute link stable",
  },
  footer: {
    left: "Chronicle Institute orientation build",
    right: "Milestone 2 · Chronicle Identity",
  },
  archiveSignal: {
    kicker: "Archive Signal",
    year: "1491",
    title: "Record drift detected",
    body: "The Atlantic world is about to change. The Institute requires a Chronicler.",
    tag: "Case 1.01 queued",
  },
  scenes: {
    welcome: {
      eyebrow: "Republic Builder Engine",
      title: "Chronicle",
      subtitle: "An AP U.S. History Adventure",
      body: [
        { text: "Welcome, Chronicler." },
        { text: "The Institute has been waiting for you." },
      ],
      action: "Begin Orientation",
      secondary: "What is Chronicle?",
    },
    oath: {
      eyebrow: "Chronicle Institute — Field Protocol",
      title: "Welcome, Chronicler.",
      subtitle: "Observe. Source. Report.",
      body: [
        { text: "Your first assignment is ready." },
        {
          text: "These rules protect the historical record—and define the work of a Chronicler.",
        },
      ],
      action: "Create Chronicler",
      secondary: "Review Director briefing",
    },
    character: {
      eyebrow: "Milestone 2 · Chronicle Identity",
      title: "Identity registry online.",
      subtitle: "Your field record is ready for registration.",
      body: "This transition is now handled by the Chronicle Identity feature, where the player chooses an appearance and name before receiving a Codex.",
      action: "Create Chronicler",
      secondary: "Review field protocol",
    },
  },
  director: {
    kicker: "Institute Director",
    title: "Director of the Archive",
    quote: "“History does not need another hero. It needs someone willing to follow the evidence.”",
  },
  directorBriefing: {
    entries: [
      {
        eyebrow: "Director’s briefing · 01 / 04",
        title: "Who we are.",
        subtitle: "I’m Director Rowan Hale. I run the Chronicle Institute.",
        body: [
          {
            text: "I’m Director Rowan Hale. I run the Chronicle Institute.",
            reveal: { type: "badge", icon: "✦", label: "The Institute" },
          },
          {
            text: "We preserve the historical record—and right now, part of it is disappearing.",
          },
        ],
        action: "Continue briefing",
        secondary: "Return to title",
      },
      {
        eyebrow: "Director’s briefing · 02 / 04",
        title: "What’s wrong.",
        subtitle: "We call it record drift.",
        body: [
          {
            text: "We call it record drift: fragments of the past changing, vanishing, or contradicting each other.",
            reveal: {
              type: "chips",
              items: ["Testimony", "Artifacts", "Images", "Laws", "Journals"],
            },
          },
          {
            text: "If we lose them, we lose the ability to understand what really happened.",
          },
        ],
        action: "Continue briefing",
        secondary: "Previous message",
      },
      {
        eyebrow: "Director’s briefing · 03 / 04",
        title: "What a Chronicler does.",
        subtitle: "A Chronicler travels to the moment and secures the record before it’s lost.",
        body: [
          {
            text: "A Chronicler travels to the moment and secures the record before it’s lost.",
          },
          {
            text: "Not to change history—to prove it. This is your Codex.",
            reveal: { type: "image", src: "codex", label: "The Codex" },
          },
        ],
        action: "Continue briefing",
        secondary: "Previous message",
      },
      {
        eyebrow: "Director’s briefing · 04 / 04",
        title: "Why you.",
        subtitle: "Every record you secure updates your Codex.",
        body: [
          {
            text: "Every record you secure updates your Codex—the Archive’s memory.",
            reveal: { type: "badge", icon: "⌁", label: "The Archive" },
          },
          { text: "I’ll show you how this works. Follow me." },
        ],
        action: "Accept field protocol",
        secondary: "Previous message",
      },
    ],
  },
  protocol: [
    {
      number: "01",
      title: "Observe",
      body: "Enter the moment. Leave history untouched.",
    },
    {
      number: "02",
      title: "Source",
      body: "Interrogate the record: creator, audience, purpose.",
    },
    {
      number: "03",
      title: "Report",
      body: "Return with evidence. Preserve what can be proven.",
    },
  ],
  assignment: {
    kicker: "First Assignment",
    unit: "Unit 1 · Period 1: 1491–1607",
    title: "The Atlantic Crossroads",
    description:
      "Investigate how contact between Europe, Africa, and the Americas began to reshape societies on both sides of the Atlantic.",
    details: [
      "Chronicle Institute briefing",
      "Field arrival in the Caribbean",
      "Evidence collection",
      "Exchange Ledger activity",
      "AP-style MCQ + SAQ report",
    ],
  },
};
