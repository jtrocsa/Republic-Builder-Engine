const PLAYER_PROFILE_KEY = 'republic-builder.chronicle.player-profile.v1';

export const EMPTY_PLAYER_PROFILE = Object.freeze({
  name: '',
  appearance: 'a',
  codexIssued: false,
  fieldArrivalSeen: false
});

export function readPlayerProfile() {
  try {
    const raw = window.localStorage.getItem(PLAYER_PROFILE_KEY);
    if (!raw) return { ...EMPTY_PLAYER_PROFILE };
    const parsed = JSON.parse(raw);
    return {
      ...EMPTY_PLAYER_PROFILE,
      ...parsed,
      appearance: parsed?.appearance === 'b' ? 'b' : 'a',
      name: typeof parsed?.name === 'string' ? parsed.name.slice(0, 14) : ''
    };
  } catch {
    return { ...EMPTY_PLAYER_PROFILE };
  }
}

export function writePlayerProfile(profile) {
  const next = {
    ...EMPTY_PLAYER_PROFILE,
    ...profile,
    name: String(profile?.name ?? '').replace(/\s+/g, ' ').trim().slice(0, 14),
    appearance: profile?.appearance === 'b' ? 'b' : 'a'
  };
  window.localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify(next));
  return next;
}

export function clearPlayerProfile() {
  window.localStorage.removeItem(PLAYER_PROFILE_KEY);
}
