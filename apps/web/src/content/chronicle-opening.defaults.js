/**
 * Chronicle opening copy.
 *
 * This file is the canonical default copy committed to the repository.
 * Author Mode creates browser-local drafts on top of these defaults and can
 * export a JSON snapshot when a wording pass is ready to publish.
 *
 * REWRITTEN IN PHASE 81B against docs/design/CHRONICLE-CANON.md, which was written six phases
 * after this copy and contradicted it on the first screen a player reads. What was here before:
 *
 *   - The premise was named for *drift* and defined as "fragments of the past changing, vanishing,
 *     or contradicting each other." That is the exact list canon §6 exists to keep that word away
 *     from. A source can be incomplete, biased, unverified or contradicted by another source
 *     without anyone having travelled anywhere, and teaching a student that those are symptoms of
 *     a temporal event teaches them something false about history.
 *     `tests/unit/chronicle-canon.test.js` now fails on the two-word phrase, which is why it is
 *     described here rather than quoted — the scanner cannot tell a ban from a use, the same
 *     reason it skips docs/.
 *   - Travel described as date-led — "a Chronicler travels to the moment." Canon §2 is object-led:
 *     you pick a surviving thing and arrive where it was. That is *why* the Navigation Table is a
 *     table with records on it rather than a dial, and the old copy left the prop unexplained.
 *   - No anchor glass, no temporal imprints, no Original Drift, and only three of the operational
 *     rule's four clauses.
 *
 * Two authoring rules from canon §8 govern edits here. **Introduce a term once, then stop
 * explaining it** — every lore word below appears in the briefing and is then used plainly
 * forever after. And **no sentence stacks three lore terms before naming the academic task**;
 * the briefing is four screens of two lines precisely so each idea gets its own box.
 */
export const CHRONICLE_OPENING_DEFAULTS = {
  brand: {
    productName: "Chronicle",
  },
  status: {
    text: "Institute link stable",
  },
  footer: {
    left: "Chronicle Institute orientation build",
    right: "Field protocol · Chronicler registration",
  },
  // Not currently rendered anywhere — kept because it is the shape a future Archive Signal surface
  // would take, and corrected in Phase 81B so that if it is ever wired up it does not reintroduce
  // the phrase this phase removed. "Temporal anomaly" is canon §8's term for the one thing this
  // panel describes: Codex-protected evidence and the surviving archive disagreeing.
  archiveSignal: {
    kicker: "Archive Signal",
    year: "1491",
    title: "Codex and archive disagree",
    body: "An Atlantic record the Codex protected no longer matches the one that survived. The Institute requires a Chronicler.",
    tag: "Case 1.01 queued",
  },
  scenes: {
    // The eyebrow was "Republic Builder Engine" — a retired project identity on the game's first
    // screen. Dropped in Phase 81B. It is the subtitle rather than empty because
    // `directorSceneMarkup()` renders the kicker element unconditionally, so a blank string leaves
    // an empty `<p>` and a gap above the title. The teacher screens' `BRAND.engine` is a separate
    // surface and deliberately untouched — see CLAUDE.md on product branding.
    welcome: {
      eyebrow: "An AP U.S. History Adventure",
      title: "Chronicle",
      subtitle: "The Institute has been waiting for you.",
      body: [{ text: "Welcome, Chronicler." }, { text: "The Institute has been waiting for you." }],
      action: "Begin Orientation",
      secondary: "What is Chronicle?",
    },
    oath: {
      eyebrow: "Chronicle Institute — Field Protocol",
      title: "Four rules, and then the work.",
      subtitle: "Enter carefully. Observe freely. Preserve evidence.",
      body: [
        { text: "Every Chronicler works to the same four rules." },
        { text: "Learn them here. I will not be repeating them in the field." },
      ],
      action: "Create Chronicler",
      secondary: "Review Director briefing",
    },
    character: {
      eyebrow: "Chronicle Institute — Identity Registry",
      title: "Identity registry online.",
      subtitle: "Your field record is ready for registration.",
      body: "This transition is now handled by the Chronicle Identity feature, where the player chooses an appearance and name before receiving a Codex.",
      action: "Create Chronicler",
      secondary: "Review field protocol",
    },
    // Spoken in the Entrance Hall, in world, with the Director standing in front of the player —
    // not on the director stage. The player walks up to him and presses E, and the last beat sets
    // him walking to the Main Hall doors with the player following. Four beats: greet them by name,
    // say what the room is, say what is through the doors, then go.
    hallway: {
      body: [
        {
          text: "{{chroniclerName}}. You found it. Most new Chroniclers stand in the entry a while first.",
        },
        {
          text: "This hall is the oldest part of the Institute. Every record we have recovered came back through it.",
        },
        {
          text: "Through those doors is the Institute Archive — where the work gets checked, and where it gets kept.",
        },
        { text: "Walk with me." },
      ],
    },
  },
  tour: {
    intro: {
      name: "Director Rowan Hale",
      role: "Director of Field Studies",
      body: "This is the Institute Archive — your home base between investigations. Dr. Amani Soto and Professor Julian Park keep the record straight; lean on both of them once real casework begins.",
      cta: "Next →",
    },
    table: {
      name: "Director Rowan Hale",
      role: "Director of Field Studies",
      body: "The Chronicle Navigation Table. Those are not destinations — they are objects that survived, and each one opens onto wherever it was. You'll return here between cases to choose which one the record needs next.",
      cta: "Next →",
    },
    archiveDoor: {
      name: "Director Rowan Hale",
      role: "Director of Field Studies",
      body: "Through there is the Archive Room, where recovered records are organized, reviewed, and preserved.",
      cta: "Next →",
    },
    trophy: {
      name: "Director Rowan Hale",
      role: "Director of Field Studies",
      body: "And that's your Preservation Case. Every investigation you complete earns its place there.",
      cta: "Got it →",
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
            reveal: {
              type: "badge",
              icon: "✦",
              label: "The Institute",
              sublabel: "Where Chroniclers work",
            },
          },
          {
            text: "We recover historical evidence, and we keep it somewhere it cannot be altered.",
          },
        ],
        action: "Continue briefing",
        secondary: "Return to title",
      },
      {
        // Canon §5: the explanation the player is given early is truthful and incomplete. Chronicle
        // admits the first expedition and that it caused the change. What it conceals — the
        // specifics of the incident and of how it was contained — is not on this screen and is not
        // hinted at. The Director is not lying here, which is what makes Units 5-6 land.
        eyebrow: "Director’s briefing · 02 / 04",
        title: "What we did.",
        subtitle: "Chronicle’s first expedition changed something. It has not stopped.",
        body: [
          {
            text: "Chronicle’s first expedition changed something in the past. It is still moving forward — through the people it touched, what they decided, and the records that outlived them.",
            reveal: {
              type: "chips",
              items: [
                "Testimony · eyewitness accounts",
                "Artifacts · recovered objects",
                "Images · period art and photographs",
                "Laws · statutes and charters",
                "Journals · firsthand writing",
              ],
            },
          },
          {
            text: "We call that continuing consequence temporal drift. Ours is the Original Drift, and it is the reason this Institute still sends people out.",
          },
        ],
        action: "Continue briefing",
        secondary: "Previous message",
      },
      {
        // Canon §2's object-led rule, which the previous copy inverted. This is the only screen in
        // the game that explains the Navigation Table, and without it the prop the player walks to
        // every session is a dial with no stated mechanism.
        eyebrow: "Director’s briefing · 03 / 04",
        title: "How you’ll get there.",
        subtitle: "You will not choose a year. You will choose something that survived.",
        body: [
          {
            text: "You will not choose a year. You will choose something that survived.",
          },
          {
            text: "An object keeps an imprint of what it was present for. Anchor glass makes that imprint readable, and the Navigation Table opens a passage through a strong one.",
            reveal: {
              type: "badge",
              icon: "◈",
              label: "Anchor glass",
              sublabel: "Makes an imprint readable",
            },
          },
        ],
        action: "Continue briefing",
        secondary: "Previous message",
      },
      {
        // Canon §2's second consequence — observation is free — is what makes the job possible at
        // all, and the old copy never said it. And canon rule 5: the Codex is the one fixed point.
        // Never write it as unstable, corrupted or at risk; the premise collapses if the player
        // cannot trust it.
        eyebrow: "Director’s briefing · 04 / 04",
        title: "What the work is.",
        subtitle: "Not to change history. To come back with evidence that holds up.",
        body: [
          {
            text: "Standing in a moment changes nothing. Watch it as long as you need to.",
          },
          {
            text: "You are not there to fix anything — you are there to come back with evidence that holds up. What you secure goes into the Codex, and drift does not reach it.",
            reveal: { type: "image", src: "codex", label: "The Codex" },
          },
        ],
        action: "Accept field protocol",
        secondary: "Previous message",
      },
    ],
  },
  // Canon §3's operational rule, all four clauses. It was a three-card Observe/Source/Report
  // triad, which dropped the fourth entirely.
  //
  // The fourth clause is stated flatly and deliberately left unexplained. Canon §4 calls the gap
  // between "Chronicle authorises intervention in principle" and "no shipped mission has ever
  // required it" the most useful thing the canon does, because it makes Chronicle's own doctrine
  // an object of suspicion rather than a description of gameplay. Planting it at recruitment, in
  // the same plain register as the other three, is what makes it cost nothing now and pay off in
  // Units 5-6. Do not add a gloss here later; the flatness is the point.
  // Bodies are kept to a single wrapped line each. The panel is a fixed-height scroll column, and
  // at four cards a two-line body pushes the First Assignment block below the fold — measured, not
  // guessed, against the `director-protocol-scene` baseline.
  protocol: [
    {
      number: "01",
      title: "Enter carefully",
      body: "Let the moment go on without you.",
    },
    {
      number: "02",
      title: "Observe freely",
      body: "Watching costs the record nothing.",
    },
    {
      number: "03",
      title: "Preserve evidence",
      body: "Return with what can be examined.",
    },
    {
      number: "04",
      title: "Change only what is necessary",
      body: "And only to stop an outside alteration.",
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
