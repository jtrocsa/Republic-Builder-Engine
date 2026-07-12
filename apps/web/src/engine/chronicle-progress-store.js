const KEY = "republic-builder.chronicle.unit-01.v2";
export const DEFAULT_PROGRESS = {
  profile: { name: "Chronicler", appearance: "a" },
  currentScreen: "institute",
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
  submissions: {},
  activityState: {},
  completedUnits: [],
  questResponses: {},
  settings: { miniGamesEnabled: true },
};
export function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null") || {};
    return {
      ...structuredClone(DEFAULT_PROGRESS),
      ...saved,
      profile: { ...DEFAULT_PROGRESS.profile, ...(saved.profile || {}) },
      caseEvidence: { ...DEFAULT_PROGRESS.caseEvidence, ...(saved.caseEvidence || {}) },
      responses: { ...DEFAULT_PROGRESS.responses, ...(saved.responses || {}) },
      reconstruction: { ...DEFAULT_PROGRESS.reconstruction, ...(saved.reconstruction || {}) },
      exchangeLedger: { ...DEFAULT_PROGRESS.exchangeLedger, ...(saved.exchangeLedger || {}) },
      sourceActivities: { ...DEFAULT_PROGRESS.sourceActivities, ...(saved.sourceActivities || {}) },
      submissions: { ...DEFAULT_PROGRESS.submissions, ...(saved.submissions || {}) },
      activityState: { ...DEFAULT_PROGRESS.activityState, ...(saved.activityState || {}) },
      questResponses: { ...DEFAULT_PROGRESS.questResponses, ...(saved.questResponses || {}) },
      settings: { ...DEFAULT_PROGRESS.settings, ...(saved.settings || {}) },
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
