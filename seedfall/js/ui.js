/* SEEDFALL rendering: DOM in, state in, no game logic decisions here. */

const el = (id) => document.getElementById(id);

function renderStatusbar(state) {
  const planet = PLANETS[state.planet];
  const era = planet.eras[state.era];
  el('planet-name').textContent = planet.name;
  el('era-name').textContent = era.label;
}

function renderScene(state, handlers) {
  const scene = el('scene');
  const planet = PLANETS[state.planet];
  const era = planet.eras[state.era];

  scene.className = 'era-' + state.era;
  if (state.era === 'present' && !state.flags.reedPlanted) scene.classList.add('crisis');

  scene.innerHTML = '';
  era.hotspots.forEach((hs) => {
    if (hs.visible && !hs.visible(state)) return;
    const div = document.createElement('div');
    div.className = 'hotspot';
    if (hs.glow && hs.glow(state)) div.classList.add('glow');
    if (hs.armedTarget && hs.armedTarget(state)) div.classList.add('armed-target');
    div.style.left = hs.x + '%';
    div.style.top = hs.y + '%';
    div.innerHTML = `<div class="icon">${hs.icon}</div><div class="hs-label">${hs.label}</div>`;
    div.addEventListener('click', () => handlers.onHotspot(hs));
    scene.appendChild(div);
  });
}

function renderTimelineBar(state, handlers) {
  const bar = el('timeline-bar');
  const planet = PLANETS[state.planet];
  bar.innerHTML = '';
  planet.eraOrder.forEach((eraId) => {
    const unlocked = !!state.unlockedEras[eraId];
    const btn = document.createElement('button');
    btn.className = 'era-btn' + (unlocked ? ' unlocked' : ' locked') +
      (eraId === state.era ? ' active' : '') +
      (state.dirtyEras && state.dirtyEras[eraId] && eraId !== state.era ? ' changed' : '');
    const icon = { genesis: '\u{1F331}', rise: '\u{1F3D8}️', present: '\u{1F3D9}️', ruin: '\u{1F30A}' }[eraId] || '•';
    btn.innerHTML = `<div class="era-icon">${icon}</div><div>${unlocked ? planet.eras[eraId].label : '???'}</div>`;
    btn.disabled = !unlocked;
    btn.addEventListener('click', () => handlers.onJump(eraId));
    bar.appendChild(btn);
  });
}

function renderInventory(state, handlers) {
  el('inventory-count').textContent = state.inventory.length;
  const box = el('inventory-items');
  box.innerHTML = '';
  if (state.inventory.length === 0) {
    box.innerHTML = '<div style="opacity:0.5;font-size:13px;padding:8px;">Nothing carried right now.</div>';
    return;
  }
  state.inventory.forEach((itemId) => {
    const item = ITEMS[itemId];
    const div = document.createElement('div');
    div.className = 'inv-item' + (state.armedItem === itemId ? ' armed' : '');
    div.textContent = item.icon;
    div.addEventListener('click', () => handlers.onInventoryTap(itemId));
    box.appendChild(div);
  });
}

function renderAll(state, handlers) {
  renderStatusbar(state);
  renderScene(state, handlers);
  renderTimelineBar(state, handlers);
  renderInventory(state, handlers);
}

/* ---- Overlays ---- */

function showDialogue(speaker, text, onNext) {
  el('dialogue-speaker').textContent = speaker;
  el('dialogue-text').textContent = text;
  el('dialogue-overlay').classList.remove('hidden');
  const next = el('dialogue-next');
  const handler = () => { el('dialogue-overlay').classList.add('hidden'); next.removeEventListener('click', handler); if (onNext) onNext(); };
  next.addEventListener('click', handler);
}

function showItemCard(itemId, onClose) {
  const item = ITEMS[itemId];
  el('item-card-icon').textContent = item.icon;
  el('item-card-name').textContent = item.name;
  el('item-card-desc').textContent = item.desc;
  el('item-card-actions').innerHTML = '';
  el('item-card-close').classList.remove('hidden');
  el('item-card-modal').classList.remove('hidden');
  const close = el('item-card-close');
  const handler = () => { el('item-card-modal').classList.add('hidden'); close.removeEventListener('click', handler); if (onClose) onClose(); };
  close.addEventListener('click', handler);
}

function showItemInfo(itemId, descOverride, actions) {
  const item = ITEMS[itemId];
  el('item-card-icon').textContent = item.icon;
  el('item-card-name').textContent = item.name;
  el('item-card-desc').textContent = descOverride || item.desc;
  const actionsBox = el('item-card-actions');
  actionsBox.innerHTML = '';
  el('item-card-close').classList.add('hidden');
  actions.forEach((a, i) => {
    const btn = document.createElement('button');
    btn.className = 'btn' + (i > 0 ? ' btn-secondary' : '');
    btn.textContent = a.label;
    btn.addEventListener('click', () => { el('item-card-modal').classList.add('hidden'); a.action(); });
    actionsBox.appendChild(btn);
  });
  el('item-card-modal').classList.remove('hidden');
}

function showConfirm(text, onYes) {
  el('confirm-text').textContent = text;
  el('confirm-modal').classList.remove('hidden');
  const yes = el('confirm-yes'), no = el('confirm-no');
  const cleanup = () => { el('confirm-modal').classList.add('hidden'); yes.removeEventListener('click', yesHandler); no.removeEventListener('click', noHandler); };
  const yesHandler = () => { cleanup(); onYes(); };
  const noHandler = () => { cleanup(); };
  yes.addEventListener('click', yesHandler);
  no.addEventListener('click', noHandler);
}

let toastTimer = null;
function showToast(text) {
  const t = el('toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

function renderCodex(state) {
  const box = el('codex-entries');
  box.innerHTML = '';
  if (state.codex.length === 0) {
    box.innerHTML = '<div style="opacity:0.5;font-size:14px;">Nothing recorded yet.</div>';
    return;
  }
  [...state.codex].reverse().forEach((entry) => {
    const div = document.createElement('div');
    div.className = 'codex-entry';
    div.innerHTML = `<div class="codex-title">${entry.title}</div><div>${entry.text}</div>`;
    box.appendChild(div);
  });
}
