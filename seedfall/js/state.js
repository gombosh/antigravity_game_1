/* SEEDFALL game state: persistence + pure mutation helpers. */

const SAVE_KEY = 'seedfall_save_v1';

function defaultState() {
  return {
    planet: 'ondine',
    era: 'present',
    flags: {},
    unlockedEras: { present: true, ruin: false, genesis: false, rise: false },
    seenEras: { present: true, ruin: false, genesis: false, rise: false },
    inventory: [],
    armedItem: null,
    codex: []
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) { /* ignore corrupt save */ }
  return defaultState();
}

function saveState(state) {
  try {
    const { armedItem, ...persisted } = state; // don't persist transient "armed" selection
    localStorage.setItem(SAVE_KEY, JSON.stringify(persisted));
  } catch (e) { /* storage unavailable, e.g. private mode */ }
}
