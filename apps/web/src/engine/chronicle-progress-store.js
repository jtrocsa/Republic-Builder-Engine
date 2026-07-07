const KEY = 'republic-builder.chronicle.progress.v1';
export const DEFAULT_PROGRESS = {
  profile: { name: 'Chronicler', appearance: 'a' },
  currentScreen: 'institute',
  unlocked: ['case-001'],
  activeCase: null,
  evidence: [],
  completedCases: []
};

export function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    return { ...structuredClone(DEFAULT_PROGRESS), ...(saved || {}), profile: { ...DEFAULT_PROGRESS.profile, ...(saved?.profile || {}) } };
  } catch { return structuredClone(DEFAULT_PROGRESS); }
}
export function saveProgress(next) { localStorage.setItem(KEY, JSON.stringify(next)); return next; }
export function resetProgress() { localStorage.removeItem(KEY); return structuredClone(DEFAULT_PROGRESS); }
