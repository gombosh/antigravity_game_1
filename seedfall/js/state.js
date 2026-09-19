/* SEEDFALL game state: persistence + pure mutation helpers.
   Multi-planet: era progress, unlocks, and "what's changed" tracking are
   all keyed per-planet. Inventory and flags are global by design — items
   physically carry between planets, which is the whole point. */

const SAVE_KEY = 'seedfall_save_v2';

function defaultState() {
  return {
    planet: 'ondine',
    eraByPlanet: {
      ondine: 'present',
      caer: 'rise'
    },
    unlockedEras: {
      ondine: { present: true, ruin: false, genesis: false, rise: false },
      // Caer has no internal era-gating puzzle of its own — the whole
      // point of this planet is the cross-planet item exchange with
      // Ondine, so all three of its eras are open as soon as it's reached.
      caer: { genesis: true, rise: true, present: true }
    },
    unlockedPlanets: { ondine: true, caer: false },
    dirtyEras: {}, // keyed "planet:era"
    flags: {},
    inventory: [],
    armedItem: null,
    codex: []
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const base = defaultState();
      return {
        ...base,
        ...saved,
        eraByPlanet: { ...base.eraByPlanet, ...(saved.eraByPlanet || {}) },
        unlockedEras: {
          ondine: { ...base.unlockedEras.ondine, ...((saved.unlockedEras || {}).ondine || {}) },
          caer: { ...base.unlockedEras.caer, ...((saved.unlockedEras || {}).caer || {}) }
        },
        unlockedPlanets: { ...base.unlockedPlanets, ...(saved.unlockedPlanets || {}) }
      };
    }
  } catch (e) { /* ignore corrupt save */ }
  return defaultState();
}

function saveState(state) {
  try {
    const { armedItem, ...persisted } = state; // don't persist transient "armed" selection
    localStorage.setItem(SAVE_KEY, JSON.stringify(persisted));
  } catch (e) { /* storage unavailable, e.g. private mode */ }
}
