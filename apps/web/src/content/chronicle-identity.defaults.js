export const CHRONICLE_IDENTITY_DEFAULTS = {
  topbar: {
    eyebrow: "Chronicle Institute",
    title: "Field identity registry",
    status: "Archive connection secure",
  },
  identity: {
    eyebrow: "Milestone 2 · Chronicle Identity",
    title: "Create your Chronicle identity.",
    subtitle:
      "Before entering the field, every Chronicler establishes an identity within the Archive.",
    nameLabel: "What name should the Archive use?",
    namePlaceholder: "Enter your name",
    nameHelp: "Up to 14 characters. Your name is used in dialogue and on your Codex.",
    // One line, above the control, and it used to be two bracketing it: "Choose your appearance"
    // over the two portraits and "Choose the field sprite that feels most like your Chronicler."
    // under them. The same instruction twice, and the second one cost 45px on a screen whose
    // Confirm button did not fit at 1280x720. See decision log 0126.
    appearanceLabel: "Choose the Chronicler you will walk the field as.",
    back: "Return to protocol",
    confirm: "Confirm identity",
    selectionHint: "Identity draft saved on this device.",
  },
  registration: {
    eyebrow: "Chronicle Archive · Registration complete",
    title: "Your Codex is linked to the Archive.",
    subtitle: "Let’s put it to use.",
    profileLabel: "Chronicler",
    assignmentLabel: "Assignment",
    assignment: "Case 1.01 · The Atlantic Crossroads",
    codexLabel: "Chronicle Codex",
    codexBody:
      "A field notebook linked to the Archive. It holds current evidence, records your analysis, and transmits your report when the case is complete.",
    back: "Revise identity",
    enter: "Receive Codex & enter field",
  },
  field: {
    eyebrow: "Field entry · Caribbean, 1491",
    title: "Arrival point established.",
    subtitle: "The Atlantic world is on the edge of profound change.",
    body: "Use the arrow keys or WASD to move. Approach the field mentor, then use the interaction button to begin your first assignment.",
    objective: "Objective: Speak with Field Mentor Maren Vale.",
    mentorName: "Maren Vale",
    mentorRole: "Senior Chronicler · Field Mentor",
    mentorDialogue:
      "You made it. Before we enter the historical setting, remember the protocol: observe the moment, interrogate its evidence, and report only what the record can support.",
    interaction: "Speak",
    continue: "Open case briefing",
    return: "Return to identity",
  },
};
