const KEY = "republic-builder.chronicle.unit-01.v2";
export const DEFAULT_PROGRESS = {
  profile: { name: "Chronicler", appearance: "a" },
  currentScreen: "institute",
  currentHubRoom: "main",
  // Which interior of the active field map the player is standing in, or null for outdoors. The
  // field equivalent of currentHubRoom: FIELD_MAPS[unit].interiors is keyed by this, and
  // activeFieldMap() resolves through it, so an interior is read by exactly the code an outdoor
  // map is. `fieldReturn` is where to put them back when they step out — captured on entry rather
  // than recomputed from the door, so leaving lands them where they came in from.
  currentFieldRoom: null,
  fieldReturn: null,
  selectedUnitId: "unit-01",
  selectedCaseId: "case-001",
  activeCaseId: null,
  unlocked: ["case-001"],
  completedCases: [],
  caseEvidence: { "case-001": [] },
  responses: {},
  revealedContexts: [],
  reconstruction: {},
  exchangeLedger: {},
  foundingLedger: {},
  empireConnections: {},
  empireOrder: [],
  pendingUploadCaseId: null,
  review: { answers: {}, saq: {} },
  unitComplete: false,
  hubNotice: "",
  fieldNotice: "",
  // Per-source activity state: { [sourceId]: { state, completed, briefed } }, where `state` belongs
  // to whichever activity engine that source routes to (engine/activities/). A scalar sibling below
  // remembers which one is open, because main.js's openSourceId is module-local and dies on
  // reload — the three screens this replaced only resumed by hardcoding one source apiece.
  // `briefed` is whether the Mission Instructions screen has been cleared for that record; it is
  // absent on pre-Phase-71 saves, which is why it is read as falsy rather than merged in here.
  sourceActivities: {},
  activeActivitySourceId: null,
  // Where the Codex screen's "← Return" goes back to: "hub", "field", or "source". Persisted for
  // the same reason `activeActivitySourceId` above is — main.js holds it in a module-local that
  // dies on reload, and the Codex, unlike the source reader, has no recovery path to fall into. A
  // refresh on the Codex therefore used to leave the Institute for the field, which is Spine
  // Review Part 9's finding 7, fixed in Part 11 (decision log 0087). A scalar, so the shallow
  // spread in readProgress() carries it and it needs no merge line of its own.
  codexOrigin: "field",
  // The Codex: one entry per mission filed with a conclusion its evidence could carry, keyed by
  // activity id and kept permanently. Unlike everything above it, this is not scoped to a case — it
  // is the only save state that survives leaving one, which is the whole point of it. Entries are
  // snapshots taken at filing time (see engine/codex-archive.js), so nothing here has to be kept in
  // sync with the activity state that produced it. Needs its merge entry in readProgress() below.
  codex: {},
  archiveChallenges: {},
  submissions: {},
  activityState: {},
  completedUnits: [],
  questResponses: {},
  // One entry per graded quest item that has ever been answered, keyed by
  // the quest's id (or `<questId>::<sourceId>` for evidence-organizing's
  // per-source outcomes — see quest-types/index.js's questSkillOutcomes()).
  // Overwritten (not appended to) each time that item is re-graded, so it
  // reflects current mastery state rather than an ever-growing attempt log —
  // a student who fixes a wrong answer sees that item flip to correct.
  skillMastery: {},
  // Phase 49C ("The Archive Rotation") — a daily spaced-repetition loop over
  // the existing mcq/sequencing/hipp pool. itemStates is keyed by
  // "<questType>::<questId>" (see engine/spaced-repetition.js); queue/
  // queueDate/position are today's drawn items and where the player is in
  // them; streakDays/lastCompletedDate are cosmetic only — none of this
  // feeds skillMastery weighting or unlocks/badges.
  archiveRotation: {
    itemStates: {},
    queueDate: null,
    queue: [],
    position: 0,
    streakDays: 0,
    lastCompletedDate: null,
  },
  // The frame story's only persisted state. `liaisonTrust` is a small bounded integer that selects
  // which of the Field Liaison's lines plays — tone, never which scenes exist, and never anything
  // curricular (docs/design/THE-FIELD-LIAISON.md §5). `flags` holds one-shot narrative booleans and
  // is deliberately empty: a flag goes in when something reads it, not before.
  story: { liaisonTrust: 0, flags: {} },
  // `trackerCollapsed`: whether the field's Mission Tracker checklist is folded to its header.
  // Persisted rather than ephemeral so collapsing it once holds across screen changes and sessions.
  settings: { miniGamesEnabled: true, trackerCollapsed: false },
  miniGameScores: { stormNavigationBest: 0 },
  tutorial: { step: "not-started", completed: false, skipped: false },
  // Stamped on every save — the seam progress-repository.js's
  // resolveProgressConflict() compares against a remote copy's updated_at to
  // decide which is newer. Not itself synced anywhere; purely local metadata.
  lastSavedAt: null,
};
export function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null") || {};
    // A saved blob with keys at all means this is a returning player, not a brand-new profile —
    // used below so pre-existing saves (which predate the tutorial system) aren't forced through
    // a tutorial they've already effectively completed.
    const hadPriorSave = Object.keys(saved).length > 0;
    return {
      ...structuredClone(DEFAULT_PROGRESS),
      ...saved,
      profile: { ...DEFAULT_PROGRESS.profile, ...(saved.profile || {}) },
      caseEvidence: { ...DEFAULT_PROGRESS.caseEvidence, ...(saved.caseEvidence || {}) },
      responses: { ...DEFAULT_PROGRESS.responses, ...(saved.responses || {}) },
      reconstruction: { ...DEFAULT_PROGRESS.reconstruction, ...(saved.reconstruction || {}) },
      exchangeLedger: { ...DEFAULT_PROGRESS.exchangeLedger, ...(saved.exchangeLedger || {}) },
      foundingLedger: { ...DEFAULT_PROGRESS.foundingLedger, ...(saved.foundingLedger || {}) },
      sourceActivities: { ...DEFAULT_PROGRESS.sourceActivities, ...(saved.sourceActivities || {}) },
      // Not optional. The spread above is shallow, so an object-valued key with no line here is
      // replaced wholesale by `saved` — which is fine until the day the default stops being empty,
      // and is silently wrong the moment anything is read from it before a save has ever happened.
      codex: { ...DEFAULT_PROGRESS.codex, ...(saved.codex || {}) },
      archiveChallenges: {
        ...DEFAULT_PROGRESS.archiveChallenges,
        ...(saved.archiveChallenges || {}),
      },
      submissions: { ...DEFAULT_PROGRESS.submissions, ...(saved.submissions || {}) },
      activityState: { ...DEFAULT_PROGRESS.activityState, ...(saved.activityState || {}) },
      questResponses: { ...DEFAULT_PROGRESS.questResponses, ...(saved.questResponses || {}) },
      skillMastery: { ...DEFAULT_PROGRESS.skillMastery, ...(saved.skillMastery || {}) },
      archiveRotation: {
        ...DEFAULT_PROGRESS.archiveRotation,
        ...(saved.archiveRotation || {}),
        itemStates: {
          ...DEFAULT_PROGRESS.archiveRotation.itemStates,
          ...(saved.archiveRotation?.itemStates || {}),
        },
        queue: Array.isArray(saved.archiveRotation?.queue) ? saved.archiveRotation.queue : [],
      },
      story: {
        ...DEFAULT_PROGRESS.story,
        ...(saved.story || {}),
        flags: { ...DEFAULT_PROGRESS.story.flags, ...(saved.story?.flags || {}) },
      },
      settings: { ...DEFAULT_PROGRESS.settings, ...(saved.settings || {}) },
      miniGameScores: {
        ...DEFAULT_PROGRESS.miniGameScores,
        ...(saved.miniGameScores || {}),
      },
      completedUnits: Array.isArray(saved.completedUnits) ? saved.completedUnits : [],
      selectedUnitId: saved.selectedUnitId || "unit-01",
      empireConnections: {
        ...DEFAULT_PROGRESS.empireConnections,
        ...(saved.empireConnections || {}),
      },
      empireOrder: Array.isArray(saved.empireOrder) ? saved.empireOrder : [],
      pendingUploadCaseId: saved.pendingUploadCaseId || null,
      review: {
        ...DEFAULT_PROGRESS.review,
        ...(saved.review || {}),
        answers: { ...(saved.review?.answers || {}) },
        saq: { ...(saved.review?.saq || {}) },
      },
      unlocked: Array.isArray(saved.unlocked) ? saved.unlocked : ["case-001"],
      completedCases: Array.isArray(saved.completedCases) ? saved.completedCases : [],
      revealedContexts: Array.isArray(saved.revealedContexts) ? saved.revealedContexts : [],
      // Pre-existing saves predate the tutorial system and are already onboarded — do not force
      // them through it retroactively. Only a genuinely fresh profile (no prior save at all)
      // gets the not-started default. Deliberately not the same shape as the other merges above.
      tutorial: saved.tutorial
        ? { ...DEFAULT_PROGRESS.tutorial, ...saved.tutorial }
        : hadPriorSave
          ? { step: "complete", completed: true, skipped: false }
          : { ...DEFAULT_PROGRESS.tutorial },
    };
  } catch {
    return structuredClone(DEFAULT_PROGRESS);
  }
}
export function saveProgress(next) {
  next.lastSavedAt = Date.now();
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
export function resetProgress() {
  localStorage.removeItem(KEY);
  return structuredClone(DEFAULT_PROGRESS);
}
export function hasSavedProgress() {
  return localStorage.getItem(KEY) !== null;
}
