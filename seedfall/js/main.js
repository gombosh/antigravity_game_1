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
  unlockEra(eraId) { state.unlockedEras[eraId] = true; sync(); },
  markDirty(eraId) {
    state.dirtyEras = state.dirtyEras || {};
    if (eraId !== state.era) state.dirtyEras[eraId] = true;
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
    if (!state.unlockedEras[eraId]) return;
    state.era = eraId;
    if (state.dirtyEras) delete state.dirtyEras[eraId];
    state.armedItem = null;
    sync();
  },
  onInventoryTap(itemId) {
    state.armedItem = (state.armedItem === itemId) ? null : itemId;
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

renderAll(state, handlers);
