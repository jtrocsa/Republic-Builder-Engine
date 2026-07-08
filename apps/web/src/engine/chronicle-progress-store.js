const KEY = 'republic-builder.chronicle.unit-01.v2';
export const DEFAULT_PROGRESS = {
  profile: { name: 'Chronicler', appearance: 'a' },
  currentScreen: 'institute',
  selectedCaseId: 'case-001',
  activeCaseId: null,
  unlocked: ['case-001'],
  completedCases: [],
  caseEvidence: { 'case-001': [] },
  responses: {},
  revealedContexts: [],
  reconstruction: {},
  exchangeLedger: {},
  empireConnections: {},
  empireOrder: [],
  pendingUploadCaseId: null,
  review: { answers: {}, saq: {} },
  unitComplete: false
};
export function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null') || {};
    return {
      ...structuredClone(DEFAULT_PROGRESS), ...saved,
      profile: { ...DEFAULT_PROGRESS.profile, ...(saved.profile || {}) },
      caseEvidence: { ...DEFAULT_PROGRESS.caseEvidence, ...(saved.caseEvidence || {}) },
      responses: { ...DEFAULT_PROGRESS.responses, ...(saved.responses || {}) },
      reconstruction: { ...DEFAULT_PROGRESS.reconstruction, ...(saved.reconstruction || {}) },
      exchangeLedger: { ...DEFAULT_PROGRESS.exchangeLedger, ...(saved.exchangeLedger || {}) },
      empireConnections: { ...DEFAULT_PROGRESS.empireConnections, ...(saved.empireConnections || {}) },
      empireOrder: Array.isArray(saved.empireOrder) ? saved.empireOrder : [],
      pendingUploadCaseId: saved.pendingUploadCaseId || null,
      review: { ...DEFAULT_PROGRESS.review, ...(saved.review || {}), answers: { ...(saved.review?.answers || {}) }, saq: { ...(saved.review?.saq || {}) } },
      unlocked: Array.isArray(saved.unlocked) ? saved.unlocked : ['case-001'],
      completedCases: Array.isArray(saved.completedCases) ? saved.completedCases : [],
      revealedContexts: Array.isArray(saved.revealedContexts) ? saved.revealedContexts : []
    };
  } catch { return structuredClone(DEFAULT_PROGRESS); }
}
export function saveProgress(next) { localStorage.setItem(KEY, JSON.stringify(next)); return next; }
export function resetProgress() { localStorage.removeItem(KEY); return structuredClone(DEFAULT_PROGRESS); }
