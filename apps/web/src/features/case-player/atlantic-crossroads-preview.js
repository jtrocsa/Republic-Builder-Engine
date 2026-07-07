import { ATLANTIC_CROSSROADS_CASE as CASE } from '../../content/cases/case-atlantic-crossroads.preview.js';

const assets = {
  mentor: new URL('../../assets/chronicle-sprites/field/field-mentor-idle.png', import.meta.url).href,
  palm: new URL('../../assets/chronicle-sprites/field/palm.png', import.meta.url).href,
  tent: new URL('../../assets/chronicle-sprites/field/field-tent.png', import.meta.url).href,
  beacon: new URL('../../assets/chronicle-sprites/field/arrival-beacon.png', import.meta.url).href,
  crate: new URL('../../assets/chronicle-sprites/field/supply-crate.png', import.meta.url).href,
  lantern: new URL('../../assets/chronicle-sprites/field/field-lantern.png', import.meta.url).href,
  rowboat: new URL('../../assets/chronicle-sprites/field/rowboat.png', import.meta.url).href,
  rocks: new URL('../../assets/chronicle-sprites/field/shore-rocks.png', import.meta.url).href,
  playerA: {
    down: new URL('../../assets/chronicle-sprites/field/chronicler-a-down-idle.png', import.meta.url).href,
    up: new URL('../../assets/chronicle-sprites/field/chronicler-a-up-idle.png', import.meta.url).href,
    side: new URL('../../assets/chronicle-sprites/field/chronicler-a-side-idle.png', import.meta.url).href
  },
  playerB: {
    down: new URL('../../assets/chronicle-sprites/field/chronicler-b-down-idle.png', import.meta.url).href,
    up: new URL('../../assets/chronicle-sprites/field/chronicler-b-up-idle.png', import.meta.url).href,
    side: new URL('../../assets/chronicle-sprites/field/chronicler-b-side-idle.png', import.meta.url).href
  }
};

const MAP = [
  'wwwwwwwwwwwwww',
  'wwwwssssswwwwww',
  'wwwssgggggsswww',
  'wwssgggggggssww',
  'wssgggppggggssw',
  'wssgggpppgggssw',
  'wssggggpggggssw',
  'wwssgggggggssww',
  'wwwssgggggsswww',
  'wwwwwssssswwwww'
];
const COLS = MAP[0].length;
const ROWS = MAP.length;
const MENTOR = { x: 7, y: 5 };
const SIGNALS = [
  { evidenceId: 'community-context', x: 4, y: 3, icon: '✦' },
  { evidenceId: 'columbus-letter', x: 10, y: 4, icon: '▤' },
  { evidenceId: 'visual-record', x: 11, y: 7, icon: '◈' }
];
const PROPS = [
  { kind: 'palm', x: 3, y: 2, scale: 1.15, block: true },
  { kind: 'palm', x: 11, y: 3, scale: 1.08, block: true },
  { kind: 'palm', x: 4, y: 7, scale: 1.08, block: true },
  { kind: 'palm', x: 9, y: 8, scale: 1.10, block: true },
  { kind: 'tent', x: 7, y: 4, scale: 1.2, block: true },
  { kind: 'crate', x: 8, y: 6, scale: .84, block: true },
  { kind: 'lantern', x: 6, y: 6, scale: .75, block: false },
  { kind: 'beacon', x: 5, y: 7, scale: .95, block: false },
  { kind: 'rowboat', x: 3, y: 8, scale: 1.05, block: true },
  { kind: 'rocks', x: 11, y: 6, scale: 1.05, block: true }
];

function esc(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
function pos({ x, y }) {
  return `left:${(((x + .5) / COLS) * 100).toFixed(3)}%;top:${(((y + .5) / ROWS) * 100).toFixed(3)}%;`;
}
function playerSprite(profile, facing) {
  const group = profile.appearance === 'b' ? assets.playerB : assets.playerA;
  return group[facing === 'left' || facing === 'right' ? 'side' : facing];
}
function terrain(tile) { return tile === 'w' ? 'water' : tile === 's' ? 'sand' : tile === 'p' ? 'path' : 'grass'; }
function tiles() {
  return MAP.flatMap((row, y) => row.split('').map((tile, x) => `<span class="ac-tile ac-tile--${terrain(tile)}" style="grid-column:${x + 1};grid-row:${y + 1}" aria-hidden="true"></span>`)).join('');
}
function props() {
  return PROPS.map((prop) => `<img class="ac-prop ac-prop--${prop.kind}" style="${pos(prop)}--prop-scale:${prop.scale};" src="${assets[prop.kind]}" alt="" aria-hidden="true" />`).join('');
}
function signals(found) {
  return SIGNALS.map((signal) => `<button class="ac-signal ${found.has(signal.evidenceId) ? 'is-collected' : ''}" data-evidence-id="${signal.evidenceId}" style="${pos(signal)}" type="button" aria-label="Investigate ${signal.evidenceId}"><span>${signal.icon}</span></button>`).join('');
}
function evidenceById(id) { return CASE.evidence.find((item) => item.id === id); }
function blocked(x, y) {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true;
  if (MAP[y][x] === 'w') return true;
  if (x === MENTOR.x && y === MENTOR.y) return true;
  return PROPS.some((prop) => prop.block && prop.x === x && prop.y === y);
}
function near(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 1; }

function caseBriefing(profile) {
  return `
  <main class="ac-shell ac-briefing-shell">
    <header class="ac-chrome"><button class="ac-return" type="button" data-ac-action="return">← Return to Field Station</button><p>Chronicle Institute · Case Briefing</p><span>Case 1.01</span></header>
    <section class="ac-briefing">
      <div class="ac-briefing-copy">
        <p class="ac-kicker">${esc(CASE.label)}</p>
        <h1>${esc(CASE.title)}</h1>
        <p class="ac-place">${esc(CASE.location)}</p>
        <p class="ac-lead">${esc(CASE.entryMessage)}</p>
        <section class="ac-question-card"><span>Central question</span><h2>${esc(CASE.centralQuestion)}</h2></section>
        <div class="ac-brief-actions"><button class="ac-button ac-button--gold" data-ac-action="enter-case">Enter historical setting <span>→</span></button><button class="ac-button ac-button--ghost" data-ac-action="open-satchel">Preview evidence satchel</button></div>
      </div>
      <aside class="ac-case-file">
        <p class="ac-kicker">Field protocol</p>
        <h2>Three evidence signals</h2>
        <ol>${CASE.objectives.map((item, index) => `<li><b>0${index + 1}</b><span>${esc(item)}</span></li>`).join('')}</ol>
        <div class="ac-case-file__note"><b>First field experience</b><span>This is a playable preview of the investigation loop. It is not yet the full Unit 1 assessment.</span></div>
      </aside>
    </section>
  </main>`;
}

function fieldMarkup(profile, state) {
  const nearby = SIGNALS.find((signal) => !state.found.has(signal.evidenceId) && near(state.position, signal));
  const active = state.activeEvidence ? evidenceById(state.activeEvidence) : null;
  const allFound = state.found.size === CASE.evidence.length;
  const instruction = active
    ? `Evidence signal secured: ${active.label}.`
    : nearby
      ? `Evidence signal nearby: ${evidenceById(nearby.evidenceId).label}.`
      : allFound
        ? 'All evidence signals secured. Open the Codex review.'
        : 'Move toward a glowing evidence signal. Press E or select the nearby signal.';
  return `
  <main class="ac-shell ac-field-shell">
    <header class="ac-chrome"><button class="ac-return" type="button" data-ac-action="briefing">← Case Briefing</button><p>${esc(CASE.title)} · Caribbean, 1492</p><span>${state.found.size}/${CASE.evidence.length} evidence</span></header>
    <section class="ac-field-head"><div><p class="ac-kicker">First investigation</p><h1>Read the landscape before you explain it.</h1><p>${esc(instruction)}</p></div><button class="ac-satchel-button" data-ac-action="open-satchel">Codex <b>${state.found.size}</b></button></section>
    <section class="ac-field-layout">
      <div class="ac-map-frame" id="acMap" style="--ac-cols:${COLS};--ac-rows:${ROWS};" aria-label="Historical field setting. Use arrow keys or WASD.">
        ${tiles()}<div class="ac-atmosphere ac-atmosphere--one" aria-hidden="true"></div><div class="ac-atmosphere ac-atmosphere--two" aria-hidden="true"></div>${props()}${signals(state.found)}
        <div class="ac-mentor" style="${pos(MENTOR)}"><img src="${assets.mentor}" alt="Field Mentor Maren Vale" /><span>!</span></div>
        <div class="ac-player" id="acPlayer" data-facing="${state.facing}" style="${pos(state.position)}"><i></i><img src="${playerSprite(profile, state.facing)}" alt="${esc(profile.name || 'Chronicler')}" /></div>
      </div>
      <aside class="ac-field-panel">
        <p class="ac-kicker">Field channel</p><h2>Maren Vale</h2><p class="ac-role">Senior Chronicler · Field Mentor</p>
        <p>${state.mentorNote}</p>
        ${nearby ? `<button class="ac-button ac-button--gold" data-ac-action="inspect" data-evidence-id="${nearby.evidenceId}">Inspect nearby evidence <span>→</span></button>` : ''}
        ${allFound ? `<button class="ac-button ac-button--ghost" data-ac-action="source-check">Begin source check</button>` : ''}
        <div class="ac-progress">${CASE.evidence.map((item) => `<span class="${state.found.has(item.id) ? 'is-found' : ''}">${state.found.has(item.id) ? '✓' : '○'} ${esc(item.label)}</span>`).join('')}</div>
      </aside>
    </section>
    ${active ? evidenceOverlay(active) : ''}
  </main>`;
}
function evidenceOverlay(evidence) {
  return `<div class="ac-modal-backdrop"><article class="ac-evidence-card"><button class="ac-close" data-ac-action="close-evidence" aria-label="Close evidence">×</button><p class="ac-kicker">${esc(evidence.type)} · ${esc(evidence.location)}</p><h2>${esc(evidence.title)}</h2><blockquote>${esc(evidence.excerpt)}</blockquote><section><span>Why it matters</span><p>${esc(evidence.whyItMatters)}</p></section><section><span>Source prompt</span><p>${esc(evidence.prompt)}</p></section><p class="ac-citation">${esc(evidence.citation)}</p><a href="${esc(evidence.sourceUrl)}" target="_blank" rel="noreferrer">Open source record ↗</a><button class="ac-button ac-button--gold" data-ac-action="secure-evidence" data-evidence-id="${evidence.id}">Secure in Codex <span>→</span></button></article></div>`;
}
function satchelMarkup(state) {
  return `<main class="ac-shell ac-satchel-shell"><header class="ac-chrome"><button class="ac-return" data-ac-action="back-to-case">← Back</button><p>Chronicle Codex · Current case</p><span>${state.found.size}/${CASE.evidence.length} secured</span></header><section class="ac-satchel"><div><p class="ac-kicker">Evidence Satchel</p><h1>The Atlantic Crossroads</h1><p class="ac-lead">Evidence remains in the current case until you submit a report. Completed cases move their record into the permanent Archive.</p></div><div class="ac-evidence-grid">${CASE.evidence.map((evidence) => state.found.has(evidence.id) ? `<article><span>${esc(evidence.type)}</span><h2>${esc(evidence.title)}</h2><p>${esc(evidence.whyItMatters)}</p><b>Secured</b></article>` : `<article class="is-locked"><span>Signal not yet secured</span><h2>${esc(evidence.label)}</h2><p>Locate this evidence in the historical setting.</p><b>Locked</b></article>`).join('')}</div>${state.found.size === CASE.evidence.length ? `<button class="ac-button ac-button--gold" data-ac-action="source-check">Begin source check <span>→</span></button>` : ''}</section></main>`;
}
function sourceCheckMarkup(state) {
  const answered = Number.isInteger(state.answer);
  return `<main class="ac-shell ac-check-shell"><header class="ac-chrome"><button class="ac-return" data-ac-action="back-to-case">← Evidence Satchel</button><p>Chronicle Codex · Source Check</p><span>Practice mode</span></header><section class="ac-check"><p class="ac-kicker">HIPP preview · Point of View</p><h1>${esc(CASE.sourceCheck.question)}</h1><p class="ac-lead">Use the source record you collected. This is a short practice check, not the final AP-style assessment.</p><div class="ac-answer-list">${CASE.sourceCheck.answers.map((answer,index) => `<button class="ac-answer ${answered ? (index === CASE.sourceCheck.correct ? 'is-correct' : index === state.answer ? 'is-wrong' : '') : ''}" data-ac-action="answer" data-answer="${index}" ${answered ? 'disabled' : ''}><b>${String.fromCharCode(65 + index)}</b><span>${esc(answer)}</span></button>`).join('')}</div>${answered ? `<div class="ac-feedback ${state.answer === CASE.sourceCheck.correct ? 'is-good' : 'is-review'}"><b>${state.answer === CASE.sourceCheck.correct ? 'Evidence-based reading:' : 'Try the source context:'}</b><p>${esc(CASE.sourceCheck.feedback)}</p><button class="ac-button ac-button--gold" data-ac-action="finish-preview">View field-experience recap <span>→</span></button></div>` : ''}</section></main>`;
}
function recapMarkup(state) {
  return `<main class="ac-shell ac-recap-shell"><header class="ac-chrome"><button class="ac-return" data-ac-action="return">← Return to Field Station</button><p>Case 1.01 · Field Experience Preview</p><span>Evidence secured</span></header><section class="ac-recap"><p class="ac-kicker">Field experience complete</p><h1>You have begun to build the record.</h1><p class="ac-lead">You entered a historical setting, gathered context and source notes, and practiced identifying point of view. The next build adds the Exchange Ledger, an AP-style MCQ set, and a Short-Answer Question workspace.</p><div class="ac-recap-grid"><article><span>01</span><h2>Observe</h2><p>Notice what already existed in the setting before contact.</p></article><article><span>02</span><h2>Source</h2><p>Ask who created a record, for whom, and for what purpose.</p></article><article><span>03</span><h2>Report</h2><p>Use evidence to make claims that the record can support.</p></article></div><button class="ac-button ac-button--gold" data-ac-action="return">Return to Field Station <span>→</span></button></section></main>`;
}

export function mountAtlanticCrossroadsPreview(app, { profile, onReturn }) {
  let screen = 'briefing';
  const state = { position: { x: 6, y: 8 }, facing: 'up', moving: false, queued: null, found: new Set(), activeEvidence: null, mentorNote: 'Your first task is not to explain the Atlantic world all at once. Establish context. Learn what the evidence can—and cannot—show.', answer: null };
  const render = () => {
    app.innerHTML = screen === 'briefing' ? caseBriefing(profile) : screen === 'field' ? fieldMarkup(profile, state) : screen === 'satchel' ? satchelMarkup(state) : screen === 'check' ? sourceCheckMarkup(state) : recapMarkup(state);
    bind();
  };
  const move = (dx, dy) => {
    if (screen !== 'field') return;
    if (state.moving) { state.queued = [dx,dy]; return; }
    const next = { x: state.position.x + dx, y: state.position.y + dy };
    if (blocked(next.x, next.y)) return;
    state.facing = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down';
    state.position = next; state.moving = true;
    const player = app.querySelector('#acPlayer');
    if (player) { player.style.cssText = pos(state.position); player.dataset.facing = state.facing; player.classList.add('is-moving'); player.querySelector('img').src = playerSprite(profile, state.facing); }
    window.setTimeout(() => { state.moving = false; app.querySelector('#acPlayer')?.classList.remove('is-moving'); if (state.queued) { const q = state.queued; state.queued = null; move(...q); } }, 180);
  };
  const keys = (event) => {
    const map = { ArrowUp:[0,-1], w:[0,-1], W:[0,-1], ArrowDown:[0,1], s:[0,1], S:[0,1], ArrowLeft:[-1,0], a:[-1,0], A:[-1,0], ArrowRight:[1,0], d:[1,0], D:[1,0] };
    if ((event.key === 'e' || event.key === 'E') && screen === 'field') { const signal = SIGNALS.find((item) => !state.found.has(item.evidenceId) && near(state.position,item)); if (signal) { state.activeEvidence = signal.evidenceId; render(); } return; }
    const vector = map[event.key]; if (!vector || screen !== 'field') return; event.preventDefault(); move(...vector);
  };
  const leave = () => { window.removeEventListener('keydown', keys); onReturn?.(); };
  const bind = () => {
    app.querySelectorAll('[data-ac-action]').forEach((button) => button.addEventListener('click', () => {
      const action = button.dataset.acAction;
      if (action === 'return') leave();
      else if (action === 'briefing') { screen='briefing'; render(); }
      else if (action === 'enter-case') { screen='field'; render(); }
      else if (action === 'open-satchel') { screen='satchel'; render(); }
      else if (action === 'back-to-case') { screen='field'; render(); }
      else if (action === 'inspect') { state.activeEvidence = button.dataset.evidenceId; render(); }
      else if (action === 'close-evidence') { state.activeEvidence = null; render(); }
      else if (action === 'secure-evidence') { state.found.add(button.dataset.evidenceId); state.activeEvidence = null; state.mentorNote = state.found.size === CASE.evidence.length ? 'You have enough evidence for a first source check. Open your Codex and test the record.' : 'Good. Do not rush to a conclusion. Each record reveals something different.'; render(); }
      else if (action === 'source-check') { screen='check'; state.answer = null; render(); }
      else if (action === 'answer') { state.answer = Number(button.dataset.answer); render(); }
      else if (action === 'finish-preview') { screen='recap'; render(); }
    }));
    app.querySelectorAll('.ac-signal').forEach((button) => button.addEventListener('click', () => { const id = button.dataset.evidenceId; const signal = SIGNALS.find((item) => item.evidenceId === id); if (signal && near(state.position, signal) && !state.found.has(id)) { state.activeEvidence = id; render(); } }));
  };
  window.addEventListener('keydown', keys);
  render();
}
