const KEY = "republic-builder.chronicle.unit-01.v2";
export const DEFAULT_PROGRESS = {
  profile: { name: "Chronicler", appearance: "a" },
  currentScreen: "institute",
  currentHubRoom: "main",
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
  empireConnections: {},
  empireOrder: [],
  pendingUploadCaseId: null,
  review: { answers: {}, saq: {} },
  unitComplete: false,
  hubNotice: "",
  fieldNotice: "",
  sourceActivities: {},
  archiveChallenges: {},
  submissions: {},
  activityState: {},
  completedUnits: [],
  questResponses: {},
  settings: { miniGamesEnabled: true },
  miniGameScores: { stormNavigationBest: 0 },
  tutorial: { step: "not-started", completed: false, skipped: false },
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
      sourceActivities: { ...DEFAULT_PROGRESS.sourceActivities, ...(saved.sourceActivities || {}) },
      archiveChallenges: {
        ...DEFAULT_PROGRESS.archiveChallenges,
        ...(saved.archiveChallenges || {}),
      },
      submissions: { ...DEFAULT_PROGRESS.submissions, ...(saved.submissions || {}) },
      activityState: { ...DEFAULT_PROGRESS.activityState, ...(saved.activityState || {}) },
      questResponses: { ...DEFAULT_PROGRESS.questResponses, ...(saved.questResponses || {}) },
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
