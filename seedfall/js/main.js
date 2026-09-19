/* SEEDFALL: wiring. Owns the one mutable `state` object and the `api`
   surface that scene data (data.js) calls into. */

let state = loadState();

function sync() {
  saveState(state);
  renderAll(state, handlers);
}

const api = {
  giveItem(itemId) { state.inventory.push(itemId); sync(); },
  consumeArmedItem() {
    const idx = state.inventory.indexOf(state.armedItem);
    if (idx !== -1) state.inventory.splice(idx, 1);
    state.armedItem = null;
    sync();
  },
  setFlag(name, value) { state.flags[name] = value; sync(); },
  unlockEra(eraId, planetId) {
    state.unlockedEras[planetId || state.planet][eraId] = true;
    sync();
  },
  unlockPlanet(planetId) { state.unlockedPlanets[planetId] = true; sync(); },
  markDirty(eraId, planetId) {
    const pid = planetId || state.planet;
    const key = pid + ':' + eraId;
    if (!(pid === state.planet && eraId === state.eraByPlanet[state.planet])) {
      state.dirtyEras[key] = true;
    }
    sync();
  },
  addCodex(title, text) { state.codex.push({ title, text }); sync(); },
  toast(text) { showToast(text); },
  examine(text) { showDialogue('', text); },
  dialogue(speaker, text) { showDialogue(speaker, text); },
  confirm(text, onYes) { showConfirm(text, onYes); },
  showItemCard(itemId) { showItemCard(itemId); },
  itemInfo(itemId, descOverride, actions) { showItemInfo(itemId, descOverride, actions); }
};

const handlers = {
  onHotspot(hs) { hs.onTap(state, api); },
  onJump(eraId) {
    if (!state.unlockedEras[state.planet][eraId]) return;
    state.eraByPlanet[state.planet] = eraId;
    delete state.dirtyEras[state.planet + ':' + eraId];
    state.armedItem = null;
    sync();
  },
  onInventoryTap(itemId) {
    state.armedItem = (state.armedItem === itemId) ? null : itemId;
    sync();
  },
  onTravel(planetId) {
    if (!state.unlockedPlanets[planetId]) return;
    state.planet = planetId;
    state.armedItem = null;
    el('map-panel').classList.add('hidden');
    sync();
  }
};

el('inventory-tab').addEventListener('click', () => {
  el('inventory-tray').classList.toggle('open');
});

el('codex-btn').addEventListener('click', () => {
  renderCodex(state);
  el('codex-panel').classList.remove('hidden');
});
el('codex-close').addEventListener('click', () => {
  el('codex-panel').classList.add('hidden');
});

el('map-btn').addEventListener('click', () => {
  renderSystemMap(state, handlers);
  el('map-panel').classList.remove('hidden');
});
el('map-close').addEventListener('click', () => {
  el('map-panel').classList.add('hidden');
});

renderAll(state, handlers);
