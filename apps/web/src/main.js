import './styles/global.css';
import { BRAND, UNIT_01, CASE_001_SOURCES, EXCHANGE_RECORDS, EMPIRE_EVIDENCE, EMPIRE_CONNECTIONS, REVIEW } from './content/unit-01-campaign.js';
import { readProgress, saveProgress, resetProgress } from './engine/chronicle-progress-store.js';

const app = document.querySelector('#app');
const atlanticTable = new URL('./assets/maps/atlantic-navigation-table.png', import.meta.url).href;
const waldseemuller = new URL('./assets/documents/source-waldseemuller-1507.jpg', import.meta.url).href;

const fieldSpriteAssets = {
  a: {
    down: { idle: new URL('./assets/chronicle-sprites/field/chronicler-a-down-idle.png', import.meta.url).href, step: new URL('./assets/chronicle-sprites/field/chronicler-a-down-step.png', import.meta.url).href },
    up: { idle: new URL('./assets/chronicle-sprites/field/chronicler-a-up-idle.png', import.meta.url).href, step: new URL('./assets/chronicle-sprites/field/chronicler-a-up-step.png', import.meta.url).href },
    side: { idle: new URL('./assets/chronicle-sprites/field/chronicler-a-side-idle.png', import.meta.url).href, step: new URL('./assets/chronicle-sprites/field/chronicler-a-side-step.png', import.meta.url).href }
  },
  b: {
    down: { idle: new URL('./assets/chronicle-sprites/field/chronicler-b-down-idle.png', import.meta.url).href, step: new URL('./assets/chronicle-sprites/field/chronicler-b-down-step.png', import.meta.url).href },
    up: { idle: new URL('./assets/chronicle-sprites/field/chronicler-b-up-idle.png', import.meta.url).href, step: new URL('./assets/chronicle-sprites/field/chronicler-b-up-step.png', import.meta.url).href },
    side: { idle: new URL('./assets/chronicle-sprites/field/chronicler-b-side-idle.png', import.meta.url).href, step: new URL('./assets/chronicle-sprites/field/chronicler-b-side-step.png', import.meta.url).href }
  }
};
const fieldMentorSprite = new URL('./assets/chronicle-sprites/field/field-mentor-idle.png', import.meta.url).href;
const instituteHubBackground = new URL('./assets/institute/chronicle-institute-hub.png', import.meta.url).href;
const instituteNpcSprites = {
  director: new URL('./assets/institute/director-rowan-hale.png', import.meta.url).href,
  amani: new URL('./assets/institute/researcher-amani-soto.png', import.meta.url).href,
  julian: new URL('./assets/institute/professor-julian-park.png', import.meta.url).href
};
let fieldMovement = { x: 2, y: 5, facing: 'right', moving: false, step: false, queued: null };
const FIELD_GRID = { columns: 14, rows: 9 };
const FIELD_BLOCKS = new Set(['6,4', '7,4', '6,5', '7,5', '4,6', '11,5']);

const HUB_GRID = { columns: 18, rows: 12 };
const HUB_BLOCKS = new Set([
  // perimeter
  ...Array.from({ length: 18 }, (_, x) => [`${x},0`, `${x},11`]).flat(),
  ...Array.from({ length: 12 }, (_, y) => [`0,${y}`, `17,${y}`]).flat(),
  // furniture / shelves / physical map table
  '1,1','2,1','3,1','4,1','5,1','6,1','7,1','8,1','9,1','10,1','11,1','12,1','13,1','14,1','15,1','16,1',
  '2,3','3,3','4,3','6,3','7,3','8,3','9,3','10,3','11,3','12,3','13,3','14,3','15,3',
  '3,6','4,6','10,6','11,6','12,6','13,6','14,6',
  '8,7','9,7','10,7','11,7','12,7','13,7','14,7',
  '2,8','6,8','15,8'
]);
const HUB_TARGETS = {
  director: { x: 4, y: 4, name: 'Director Rowan Hale', role: 'Director of Field Studies', dialogue: () => `History does not need another hero. It needs someone willing to follow the evidence. ${progress.completedCases.length ? `You have archived ${progress.completedCases.length} Unit 1 case${progress.completedCases.length === 1 ? '' : 's'}. Read what the record supports before deciding what it means.` : 'The Institute needs Chroniclers who can separate a compelling story from evidence that can be examined.'}` },
  amani: { x: 2, y: 7, name: 'Dr. Amani Soto', role: 'Archive Researcher', dialogue: () => 'Context is not an answer key. Start with the record, write what you notice, then compare your reasoning with the Archive notes.' },
  julian: { x: 9, y: 5, name: 'Professor Julian Park', role: 'Route Historian', dialogue: () => `The navigation table is ready. ${progress.unlocked.length > 1 ? 'New Unit 1 routes are now available for review.' : 'The Caribbean route is the only active route for now.'}` },
  table: { x: 13, y: 8, name: 'Chronicle Navigation Table', role: 'Archive interface', dialogue: () => `The table displays teacher-unlocked cases geographically. Select a route only after you have reviewed the active investigation.`, action: 'archive' }
};
let instituteMovement = { x: 5, y: 9, facing: 'up', moving: false, step: false, queued: null };
let hubDialogueId = null;

let progress = readProgress();
let sourceOrigin = 'field';
let openSourceId = null;
let authorMode = false;
let activeTravelTimeout = null;

const caseById = (id) => UNIT_01.cases.find((item) => item.id === id);
const sourceById = (id) => CASE_001_SOURCES.find((item) => item.id === id);
const isUnlocked = (id) => progress.unlocked.includes(id);
const isComplete = (id) => progress.completedCases.includes(id);
const evidenceFor = (id) => progress.caseEvidence[id] || [];
const hasEvidence = (caseId, sourceId) => evidenceFor(caseId).includes(sourceId);
const countEvidence = (caseId) => evidenceFor(caseId).length;
const esc = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const save = () => saveProgress(progress);

function chrome() {
  return `<header class="chrome"><button class="brand" data-action="home" aria-label="Return to Chronicle Institute"><span class="brand-mark">✦</span><span><small>${esc(BRAND.engine)}</small><strong>${esc(BRAND.campaign)}</strong></span></button><div class="chrome-right"><span class="link-status"><i></i>${esc(BRAND.status)}</span><button class="author-toggle ${authorMode ? 'active' : ''}" data-action="author">✦ ${authorMode ? 'Author Mode On' : 'Author Mode'}</button></div></header>`;
}

function authorPanel() {
  if (!authorMode) return '';
  return `<aside class="author-panel"><button class="close-author" data-action="author">×</button><p class="kicker">Development-only controls</p><h2>Author Mode</h2><p>Adjust front-facing copy without touching route rules, answer keys, historical metadata, or progression.</p><label>Unit title<input data-copy="unit-title" value="${esc(UNIT_01.title)}"></label><label>Unit question<textarea data-copy="unit-question">${esc(UNIT_01.centralQuestion)}</textarea></label><label>Student name<input data-profile="name" value="${esc(progress.profile.name)}"></label><p class="author-note">Current version saves drafts locally. Exportable content management comes later; the permanent source records live in <code>src/content</code>.</p></aside>`;
}

function institutePositionStyle() {
  return `left:${(((instituteMovement.x + .5) / HUB_GRID.columns) * 100).toFixed(3)}%;top:${(((instituteMovement.y + .54) / HUB_GRID.rows) * 100).toFixed(3)}%;`;
}
function instituteSpriteUrl() {
  const appearance = progress.profile.appearance === 'b' ? 'b' : 'a';
  const direction = instituteMovement.facing === 'left' || instituteMovement.facing === 'right' ? 'side' : instituteMovement.facing;
  return fieldSpriteAssets[appearance][direction][instituteMovement.moving ? 'step' : 'idle'];
}
function targetDistance(target) {
  return Math.abs(instituteMovement.x - target.x) + Math.abs(instituteMovement.y - target.y);
}
function nearestHubTarget() {
  return Object.entries(HUB_TARGETS).find(([, target]) => targetDistance(target) <= 1) || null;
}
function updateInstitutePlayer() {
  const player = document.getElementById('institutePlayer');
  const sprite = document.getElementById('institutePlayerSprite');
  const prompt = document.getElementById('hubInteractPrompt');
  if (!player || !sprite) return;
  player.style.cssText = institutePositionStyle();
  player.dataset.facing = instituteMovement.facing;
  player.classList.toggle('is-walking', instituteMovement.moving);
  sprite.src = instituteSpriteUrl();
  const nearby = nearestHubTarget();
  if (prompt) {
    prompt.hidden = !nearby;
    prompt.textContent = nearby ? `Press E to interact: ${nearby[1].name}` : '';
  }
}
function isHubBlocked(x, y) {
  const npcPositions = Object.entries(HUB_TARGETS).filter(([id]) => id !== 'table').map(([, target]) => `${target.x},${target.y}`);
  return x < 0 || y < 0 || x >= HUB_GRID.columns || y >= HUB_GRID.rows || HUB_BLOCKS.has(`${x},${y}`) || npcPositions.includes(`${x},${y}`);
}
function moveInstitutePlayer(dx, dy) {
  if (progress.currentScreen !== 'institute') return;
  if (instituteMovement.moving) { instituteMovement.queued = [dx, dy]; return; }
  const nx = instituteMovement.x + dx;
  const ny = instituteMovement.y + dy;
  instituteMovement.facing = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down';
  if (isHubBlocked(nx, ny)) { updateInstitutePlayer(); return; }
  instituteMovement.x = nx; instituteMovement.y = ny; instituteMovement.moving = true; instituteMovement.step = !instituteMovement.step;
  updateInstitutePlayer();
  window.setTimeout(() => {
    instituteMovement.moving = false; updateInstitutePlayer();
    if (instituteMovement.queued) { const next = instituteMovement.queued; instituteMovement.queued = null; moveInstitutePlayer(...next); }
  }, 170);
}
function interactWithHubTarget(id) {
  const target = HUB_TARGETS[id];
  if (!target) return;
  if (id === 'table') { progress.currentScreen = 'archive'; save(); render(); return; }
  hubDialogueId = id; render();
}
function instituteNpc(targetId, sprite, label) {
  const target = HUB_TARGETS[targetId];
  const isNear = targetDistance(target) <= 1;
  return `<button class="hub-npc hub-npc--${targetId} ${isNear ? 'is-near' : ''}" style="left:${((target.x+.5)/HUB_GRID.columns*100).toFixed(3)}%;top:${((target.y+.51)/HUB_GRID.rows*100).toFixed(3)}%" data-action="hub-interact" data-target="${targetId}" aria-label="Speak with ${esc(target.name)}"><img src="${sprite}" alt=""><span>${esc(label)}</span>${isNear ? '<i>!</i>' : ''}</button>`;
}
function instituteScreen() {
  const nearby = nearestHubTarget();
  const dialogue = hubDialogueId ? HUB_TARGETS[hubDialogueId] : null;
  const status = progress.hubNotice || (progress.completedCases.length ? `${progress.completedCases.length}/3 Unit 1 cases archived.` : 'Your first active route awaits at the Navigation Table.');
  return `${chrome()}<main class="hub-shell"><section class="hub-intro"><p class="kicker">Present day · Chronicle Institute</p><h1>Institute Foyer & Archive</h1><p class="hub-subtitle">A living home base for every investigation.</p><p>Walk through the Institute with arrow keys or WASD. Speak with the Director and researchers, then approach the navigation table in the Archive room to open the map.</p><div class="hub-meta"><span>Unit 1 · ${esc(UNIT_01.title)}</span><span>${esc(status)}</span></div></section><section class="institute-map" id="instituteMap" aria-label="Playable Chronicle Institute interior"><img class="institute-map__art" src="${instituteHubBackground}" alt="Top-down interior of the Chronicle Institute showing a foyer and Archive room"><div class="hub-zone hub-zone--foyer">Foyer</div><div class="hub-zone hub-zone--archive">Archive Room</div>${instituteNpc('director', instituteNpcSprites.director, 'Director Hale')}${instituteNpc('amani', instituteNpcSprites.amani, 'Dr. Soto')}${instituteNpc('julian', instituteNpcSprites.julian, 'Prof. Park')}<button class="hub-table ${targetDistance(HUB_TARGETS.table)<=1?'is-near':''}" style="left:${((HUB_TARGETS.table.x+.5)/HUB_GRID.columns*100).toFixed(3)}%;top:${((HUB_TARGETS.table.y+.5)/HUB_GRID.rows*100).toFixed(3)}%" data-action="hub-interact" data-target="table" aria-label="Open Chronicle Navigation Table"><span>✦</span><b>Navigation Table</b></button><div class="hub-player" id="institutePlayer" data-facing="${instituteMovement.facing}" style="${institutePositionStyle()}"><span></span><img id="institutePlayerSprite" src="${instituteSpriteUrl()}" alt="${esc(progress.profile.name || 'Chronicler')}"></div><div class="hub-interact-prompt" id="hubInteractPrompt" ${nearby ? '' : 'hidden'}>${nearby ? `Press E to interact: ${esc(nearby[1].name)}` : ''}</div></section><aside class="hub-sidepanel"><p class="kicker">Institute status</p><h2>${esc(progress.profile.name || 'Chronicler')}</h2><p class="role">Active researcher · Unit 1</p><div class="hub-progress"><span><b>${progress.completedCases.length}</b> / 3 cases archived</span><span><b>${countEvidence('case-001')}</b> evidence records secured</span></div><div class="hub-actions"><button class="btn btn-gold" data-action="hub-open-table">Open Navigation Table →</button><button class="btn btn-outline" data-action="codex" data-origin="hub">Open Codex <b>${countEvidence('case-001')}</b></button><button class="text-button" data-action="reset">Reset Unit 1 demo</button></div><p class="hub-controls">Move: Arrow keys / WASD<br>Interact: E or click a character/table</p></aside>${dialogue ? `<div class="hub-dialogue" role="dialog" aria-modal="true" aria-labelledby="hubDialogueTitle"><article><button class="hub-dialogue__close" data-action="hub-dialogue-close" aria-label="Close dialogue">×</button><div class="hub-dialogue__portrait"><img src="${instituteNpcSprites[hubDialogueId]}" alt=""></div><div><p class="kicker">${esc(dialogue.role)}</p><h2 id="hubDialogueTitle">${esc(dialogue.name)}</h2><p>${esc(dialogue.dialogue())}</p>${hubDialogueId === 'director' ? '<p class="hub-dialogue__quote">“History does not need another hero. It needs someone willing to follow the evidence.”</p>' : ''}${hubDialogueId === 'julian' ? '<button class="btn btn-gold" data-action="hub-open-table">Open Navigation Table →</button>' : ''}</div></article></div>` : ''}</main>${authorPanel()}`;
}

function caseMarker(c) {
  const state = isComplete(c.id) ? 'complete' : (isUnlocked(c.id) ? 'available' : 'locked');
  return `<button class="route-marker route-marker--${state} ${progress.selectedCaseId === c.id ? 'is-selected' : ''}" style="left:${c.mapPosition.left};top:${c.mapPosition.top}" data-action="select-case" data-case="${c.id}" ${state === 'locked' ? 'disabled' : ''} aria-label="${esc(c.title)}"><span>${state === 'complete' ? '✓' : '✦'}</span><b>${esc(c.shortTitle)}</b></button>`;
}

function archiveScreen() {
  const selected = caseById(progress.selectedCaseId) || UNIT_01.cases[0];
  const availability = isComplete(selected.id) ? 'Case archived' : (isUnlocked(selected.id) ? 'Teacher unlocked' : 'Teacher locked');
  return `${chrome()}<main class="shell archive-layout"><section class="archive-copy"><button class="back-link" data-action="home">← Institute foyer</button><p class="kicker">The Archive</p><h1>Chronicle Navigation Table</h1><p>Teacher-unlocked cases appear as markers on the Atlantic world. Select a marker to inspect its route; the full details stay in the route panel so the map itself remains readable.</p><div class="archive-legend"><span class="legend-active">✦ Available</span><span class="legend-complete">✓ Archived</span><span class="legend-locked">○ Teacher locked</span></div></section><section class="atlas-table" aria-label="Atlantic navigation map"><img src="${atlanticTable}" alt="Map of the Atlantic world showing eastern North America, Caribbean, Europe, Africa, and the Atlantic Ocean"><div class="atlas-label label-atlantic">ATLANTIC OCEAN</div>${UNIT_01.cases.map(caseMarker).join('')}<div class="route-thread ${progress.selectedCaseId === 'case-002' ? 'route-thread--atlantic' : ''}"></div></section><aside class="route-panel"><p class="kicker">${esc(availability)}</p><span class="case-date">${esc(selected.date)}</span><h2>${esc(selected.title)}</h2><p>${esc(selected.summary)}</p><div class="route-meta"><span>${esc(selected.location)}</span><span>${esc(selected.mechanic)}</span><span>${isComplete(selected.id) ? 'Archived' : 'In progress'}</span></div><button class="btn btn-gold" data-action="travel" data-case="${selected.id}" ${!isUnlocked(selected.id) ? 'disabled' : ''}>Initiate Chronotravel <span>→</span></button><p class="route-hint">${selected.id === 'case-001' ? `${countEvidence('case-001')}/3 evidence records secured` : selected.question}</p></aside></main>${authorPanel()}`;
}

function travelScreen() {
  const active = caseById(progress.activeCaseId);
  const position = active.mapPosition;
  return `${chrome()}<main class="chronotravel-screen"><section class="chronotravel-map"><div class="map-camera" style="--dest-left:${position.left};--dest-top:${position.top}"><img src="${atlanticTable}" alt="Atlantic map zooming toward destination"><div class="travel-route travel-route--${active.id}"></div><div class="travel-destination">${esc(active.shortTitle)}<small>${esc(active.date)}</small></div><div class="warp-rings"><i></i><i></i><i></i></div></div></section><section class="travel-copy"><p class="kicker">Chronotravel sequence</p><h1>Route in motion.</h1><p>The Archive is following the selected point across the navigation table. The map will resolve into its historical setting; the Codex will remain synchronized with this case.</p><div class="travel-progress"><span></span></div><p class="travel-status">Do not alter the moment. Follow the evidence.</p><button class="btn btn-outline" data-action="skip-travel">Skip transition</button></section></main>`;
}

function fieldPositionStyle() {
  return `left:${(((fieldMovement.x + .5) / FIELD_GRID.columns) * 100).toFixed(3)}%;top:${(((fieldMovement.y + .52) / FIELD_GRID.rows) * 100).toFixed(3)}%;`;
}
function fieldSpriteUrl() {
  const appearance = progress.profile.appearance === 'b' ? 'b' : 'a';
  const direction = fieldMovement.facing === 'left' || fieldMovement.facing === 'right' ? 'side' : fieldMovement.facing;
  return fieldSpriteAssets[appearance][direction][fieldMovement.moving ? 'step' : 'idle'];
}
function isFieldBlocked(x, y) {
  return x < 0 || y < 0 || x >= FIELD_GRID.columns || y >= FIELD_GRID.rows || FIELD_BLOCKS.has(`${x},${y}`);
}
function updateFieldPlayer() {
  const player = document.getElementById('caseFieldPlayer');
  const sprite = document.getElementById('caseFieldPlayerSprite');
  if (!player || !sprite) return;
  player.style.cssText = fieldPositionStyle();
  player.dataset.facing = fieldMovement.facing;
  player.classList.toggle('is-walking', fieldMovement.moving);
  sprite.src = fieldSpriteUrl();
}
function moveFieldPlayer(dx, dy) {
  if (progress.currentScreen !== 'field') return;
  if (fieldMovement.moving) { fieldMovement.queued = [dx, dy]; return; }
  const nx = fieldMovement.x + dx;
  const ny = fieldMovement.y + dy;
  fieldMovement.facing = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down';
  if (isFieldBlocked(nx, ny)) { updateFieldPlayer(); return; }
  fieldMovement.x = nx; fieldMovement.y = ny; fieldMovement.moving = true; fieldMovement.step = !fieldMovement.step; updateFieldPlayer();
  window.setTimeout(() => {
    fieldMovement.moving = false; updateFieldPlayer();
    if (fieldMovement.queued) { const next = fieldMovement.queued; fieldMovement.queued = null; moveFieldPlayer(...next); }
  }, 190);
}

function fieldScreen() {
  const allSecured = countEvidence('case-001') === CASE_001_SOURCES.length;
  return `${chrome()}<main class="shell case-field"><section class="field-intro"><button class="back-link" data-action="home">← Recall to Institute</button><p class="kicker">Caribbean · 1493</p><h1>The Atlantic Crossroads</h1><p class="field-question">${esc(caseById('case-001').question)}</p><p>Move through the field with arrow keys or WASD. Open each record signal and submit your own reading before the Institute reveals added context.</p></section><section class="field-scene field-scene--interactive" id="caseFieldMap"><div class="shoreline"></div><div class="sandbank"></div><div class="grassland"></div><div class="pathing"></div><div class="field-arrival-marker"><span>Temporal arrival point</span></div><div class="field-prop prop-tree tree-one"></div><div class="field-prop prop-tree tree-two"></div><div class="field-prop prop-lantern"></div><div class="field-prop prop-boat"></div><div class="field-mentor field-mentor--png"><span>!</span><img src="${fieldMentorSprite}" alt="Maren Vale, Field Mentor"></div>${CASE_001_SOURCES.map((source, index) => `<button class="source-signal ${hasEvidence('case-001',source.id) ? 'is-secured' : ''} signal-${index+1}" data-action="open-source" data-source="${source.id}"><i>${hasEvidence('case-001',source.id) ? '✓' : '✦'}</i><b>${esc(source.type.split('·')[0])}</b><small>${esc(source.title)}</small></button>`).join('')}<div class="case-field-player" id="caseFieldPlayer" data-facing="${fieldMovement.facing}" style="${fieldPositionStyle()}"><span></span><img id="caseFieldPlayerSprite" src="${fieldSpriteUrl()}" alt="${esc(progress.profile.name || 'Chronicler')}"></div></section><aside class="field-channel"><p class="kicker">Field Channel</p><h2>Maren Vale</h2><p class="role">Senior Chronicler · Field Mentor</p><p>The record is made of different kinds of evidence. Do not let one account speak for everyone. Read each source for what it can establish—and what it cannot.</p><button class="btn btn-outline" data-action="codex" data-origin="field">Open Codex <b>${countEvidence('case-001')}</b></button>${allSecured ? `<button class="btn btn-gold" data-action="reconstruction">Open Reconstruction Table →</button>` : `<p class="channel-progress">Secure all three records to reconstruct the first-contact sequence.</p>`}</aside></main>`;
}

function sourceVisual(source) {
  if (source.visual === 'letter') return `<div class="document-paper"><span>Primary-source transcript · 1493</span><blockquote>${esc(source.excerpt)}</blockquote><small>Textual record. Read for perspective, audience, purpose, and language.</small></div>`;
  if (source.visual === 'context') return `<div class="document-paper document-paper--context"><span>Secondary context record</span><p>${esc(source.excerpt)}</p><small>Background evidence, not a Taíno-authored primary source.</small></div>`;
  return `<figure class="document-image"><img src="${waldseemuller}" alt="Local course copy of Martin Waldseemüller’s 1507 world map"><figcaption>Local course copy of a Library of Congress scan. Zoom is intentionally preserved in the reader; students do not need to leave Chronicle to view it.</figcaption></figure>`;
}

function sourceReader() {
  const source = sourceById(openSourceId);
  const response = progress.responses[source.id] || '';
  const revealed = progress.revealedContexts.includes(source.id);
  const secured = hasEvidence('case-001', source.id);
  return `${chrome()}<main class="reader-shell"><section class="reader-art">${sourceVisual(source)}</section><section class="reader-copy"><div class="reader-nav"><button class="back-link" data-action="return-source">← Back to ${sourceOrigin === 'codex' ? 'Codex' : 'field'}</button><button class="codex-button" data-action="codex" data-origin="source">Codex <b>${countEvidence('case-001')}</b></button></div><p class="kicker">${esc(source.type)}</p><h1>${esc(source.title)}</h1><dl><div><dt>Creator</dt><dd>${esc(source.creator)}</dd></div><div><dt>Date</dt><dd>${esc(source.date)}</dd></div><div><dt>Record</dt><dd>${esc(source.record)}</dd></div></dl><section class="reader-prompt"><h2>Chronicler prompt</h2><p>${esc(source.prompt)}</p><label class="response-label">Your initial reading<textarea id="sourceResponse" placeholder="Write your evidence-based interpretation before opening Institute Context…">${esc(response)}</textarea></label><button class="btn btn-gold" data-action="submit-source" data-source="${source.id}">Submit initial reading →</button></section>${revealed ? `<section class="reader-context"><h2>Institute Context</h2><p>${esc(source.feedback)}</p></section>` : `<section class="context-locked"><span>✦</span><div><b>Institute Context sealed</b><p>Submit a source-based interpretation first. The context note will then help you compare your thinking with the record.</p></div></section>`}<p class="citation">${esc(source.citation)}</p><a class="source-link" href="${esc(source.externalUrl)}" target="_blank" rel="noreferrer">View original archive record ↗</a><button class="btn ${secured ? 'btn-complete' : 'btn-outline'}" data-action="secure-source" data-source="${source.id}" ${!revealed ? 'disabled' : ''}>${secured ? 'Secured in Codex ✓' : 'Secure in Codex →'}</button></section></main>`;
}

function codexScreen() {
  const entries = CASE_001_SOURCES.map((source) => {
    const secured = hasEvidence('case-001',source.id);
    return `<article class="codex-entry ${secured ? '' : 'locked'}"><span>${esc(source.type)}</span><h2>${esc(source.title)}</h2><p>${secured ? esc(progress.responses[source.id] || 'Evidence record secured.') : 'Secure this record in the field to add it to the Codex.'}</p>${secured ? `<button class="text-button" data-action="open-source" data-source="${source.id}" data-origin="codex">Open record →</button>` : ''}</article>`;
  }).join('');
  return `${chrome()}<main class="shell codex-shell"><section class="codex-head"><button class="back-link" data-action="return-codex">← Return</button><p class="kicker">Chronicle Codex</p><h1>Evidence Satchel</h1><p>Temporary records for the current case. Your initial notes stay attached to the evidence you secured.</p></section><section class="codex-grid">${entries}</section></main>`;
}

function reconstructionScreen() {
  const selections = progress.reconstruction;
  const types = [ ['precontact','Before contact'], ['encounter','Early encounter'], ['knowledge','Changing geographic knowledge'] ];
  return `${chrome()}<main class="shell puzzle-shell"><section class="puzzle-copy"><button class="back-link" data-action="field">← Return to field</button><p class="kicker">Case 1.01 signature activity</p><h1>Record Reconstruction</h1><p>Place each record where it most directly belongs in the emerging Atlantic story. The purpose is not to create one tidy narrative—it is to distinguish the different kinds of evidence.</p><div class="puzzle-lanes">${types.map(([key,label])=>`<div><b>${label}</b><span>${key==='precontact'?'Established societies and conditions before European arrival.':key==='encounter'?'A source created during or immediately after contact.':'A later record showing transformed European knowledge.'}</span></div>`).join('')}</div></section><section class="reconstruction-board">${CASE_001_SOURCES.map(source => `<article><span>${esc(source.type)}</span><h2>${esc(source.title)}</h2><p>${esc(source.excerpt)}</p><label>Place record<select data-reconstruction="${source.id}"><option value="">Choose a lane</option>${types.map(([key,label])=>`<option value="${key}" ${selections[source.id]===key?'selected':''}>${label}</option>`).join('')}</select></label></article>`).join('')}<button class="btn btn-gold board-submit" data-action="check-reconstruction">Test reconstruction →</button><p id="reconstructionFeedback" class="feedback"></p></section></main>`;
}

function exchangeLedgerScreen() {
  const answers = progress.exchangeLedger.answers || {};
  const allAnswered = EXCHANGE_RECORDS.every(record => answers[record.id] !== undefined);
  return `${chrome()}<main class="shell ledger-shell ledger-shell--source-driven"><section class="ledger-copy"><button class="back-link" data-action="archive">← Archive map</button><p class="kicker">Case 1.02 · Atlantic routes</p><h1>The Exchange Ledger</h1><p>${esc(caseById('case-002').question)}</p><p>Every entry begins with a record. Read the short source card, then answer one evidence-based question. Each question tests a different historical claim—there is no shared answer bank to eliminate.</p><div class="atlantic-mini"><img src="${atlanticTable}" alt="Atlantic map used for Exchange Ledger"><div class="ledger-route"></div></div></section><section class="ledger-list ledger-list--sources">${EXCHANGE_RECORDS.map((record, index) => `<article class="ledger-card ledger-card--source"><header><div class="ledger-icon">${record.icon}</div><div><p class="kicker">${esc(record.label)} · Record ${index+1}</p><h2>${esc(record.sourceTitle)}</h2><span>${esc(record.sourceMeta)}</span></div></header><blockquote>${esc(record.excerpt)}</blockquote><p class="source-note">${esc(record.sourceNote)}</p><fieldset><legend>${esc(record.question)}</legend>${record.choices.map((choice, ci) => `<label class="ledger-choice"><input type="radio" name="ledger-${record.id}" data-ledger-question="${record.id}" value="${ci}" ${String(answers[record.id]) === String(ci) ? 'checked' : ''}><span>${String.fromCharCode(65 + ci)}</span>${esc(choice)}</label>`).join('')}</fieldset><small>${esc(record.citation)}</small></article>`).join('')}<button class="btn btn-gold" data-action="check-ledger" ${allAnswered ? '' : ''}>Validate Evidence Ledger →</button><p class="feedback" id="ledgerFeedback"></p></section></main>`;
}

function empireScreen() {
  const order = progress.empireOrder || [];
  const byId = Object.fromEntries(EMPIRE_EVIDENCE.map(card => [card.id, card]));
  const remaining = EMPIRE_EVIDENCE.filter(card => !order.includes(card.id));
  const slots = Array.from({ length: EMPIRE_EVIDENCE.length }, (_, index) => {
    const card = byId[order[index]];
    return `<div class="system-slot ${card ? 'is-filled' : ''}" data-drop-index="${index}">${card ? `<article class="system-card" draggable="true" data-empire-card="${card.id}"><span>${esc(card.source)}</span><h3>${esc(card.label)}</h3><p>${esc(card.detail)}</p></article>` : `<span>Drop a record here</span>`}</div>${index < EMPIRE_EVIDENCE.length - 1 ? '<i class="system-arrow">→</i>' : ''}`;
  }).join('');
  return `${chrome()}<main class="shell empire-shell empire-shell--drag"><section class="empire-copy"><button class="back-link" data-action="archive">← Archive map</button><p class="kicker">Case 1.03 · Spanish Caribbean</p><h1>Empire’s Foundations</h1><p>${esc(caseById('case-003').question)}</p><p>Move the evidence records into a defensible order. Each connection should show how conquest, labor, forced migration, hierarchy, resistance, and cultural interaction shaped colonial society.</p><div class="empire-prompt"><b>Chronicler reflection</b><textarea id="empireReflection" placeholder="Explain one connection using evidence from two records…">${esc(progress.responses['empire-reflection'] || '')}</textarea></div></section><section class="empire-board empire-board--drag"><div class="evidence-bank"><div class="bank-heading"><h2>Evidence records</h2><button class="text-button" data-action="clear-empire">Reset layout</button></div><div class="bank-cards">${remaining.map(card => `<article class="system-card" draggable="true" data-empire-card="${card.id}"><span>${esc(card.source)}</span><h3>${esc(card.label)}</h3><p>${esc(card.detail)}</p></article>`).join('') || '<p class="bank-empty">All records are on the system table. Drag any card to a new position to revise it.</p>'}</div></div><section class="system-table"><div class="system-table__head"><h2>Build the colonial system</h2><p>Drag records into the sequence. The arrows represent a claim you can defend, not a claim that history was simple.</p></div><div class="system-track">${slots}</div><button class="btn btn-gold" data-action="check-empire">Submit system to Archive →</button><p class="feedback" id="empireFeedback"></p></section></section></main>`;
}

function uploadScreen() {
  const active = caseById(progress.pendingUploadCaseId || progress.activeCaseId || 'case-001');
  return `${chrome()}<main class="upload-shell"><section class="upload-core"><p class="kicker">Archive connection secure</p><h1>Field record transmitting.</h1><p>Your Codex is relaying the completed ${esc(active.shortTitle)} record to the Chronicle Institute. The Archive will preserve your evidence, notes, and completed investigation before the next route opens.</p><div class="upload-beam"><div class="upload-codex">✦</div><i></i><i></i><i></i><div class="upload-archive">⌁</div></div><div class="upload-status"><span>Codex encrypted</span><span>Evidence verified</span><span>Record archived</span></div><button class="btn btn-gold" data-action="return-archive">Case archived — Return to Institute →</button></section></main>`;
}

function reviewScreen() {
  const answers = progress.review.answers || {};
  const saq = progress.review.saq || {};
  return `${chrome()}<main class="shell review-shell"><section class="review-copy"><button class="back-link" data-action="archive">← Archive map</button><p class="kicker">Unit 1 Archive Review</p><h1>${esc(UNIT_01.title)}</h1><p>Practice with AP-style historical thinking: source analysis, causation, and evidence-based explanation.</p><div class="rubric-note"><b>Structured SAQ practice · 3 points total</b><p>${esc(REVIEW.saq.rubric)}</p></div></section><section class="review-work"><div class="mcq-block"><h2>Multiple-choice checkpoint</h2>${REVIEW.mcq.map((q, qi)=>`<article><p><b>${qi+1}.</b> ${esc(q.prompt)}</p>${q.choices.map((choice, ci)=>`<label class="choice"><input type="radio" name="mcq-${qi}" data-mcq="${qi}" value="${ci}" ${String(answers[qi])===String(ci)?'checked':''}><span>${String.fromCharCode(65+ci)}</span>${esc(choice)}</label>`).join('')}</article>`).join('')}</div><div class="saq-block"><h2>Short Answer Question</h2><blockquote>${esc(REVIEW.saq.stimulus)}</blockquote>${REVIEW.saq.prompts.map((prompt,index)=>`<label>${esc(prompt)}<textarea data-saq="${index}" placeholder="Write an evidence-based response…">${esc(saq[index]||'')}</textarea></label>`).join('')}</div><button class="btn btn-gold" data-action="submit-review">Submit Unit 1 Archive Review →</button><p class="feedback" id="reviewFeedback"></p></section></main>`;
}

function completionScreen() {
  const correct = REVIEW.mcq.filter((q,index)=>Number(progress.review.answers[index])===q.answer).length;
  const saqCount = Object.values(progress.review.saq||{}).filter(v=>String(v).trim().length>0).length;
  return `${chrome()}<main class="shell completion-shell"><section><p class="kicker">Unit record complete</p><h1>Unit 1 archived.</h1><p>Your Codex now preserves the Atlantic World investigation. The Institute has logged your sources, practice responses, and completed case records.</p><div class="completion-stats"><span>Cases archived: ${progress.completedCases.length}/3</span><span>MCQ checkpoint: ${correct}/6</span><span>SAQ responses drafted: ${saqCount}/3</span></div><div class="completion-actions"><button class="btn btn-gold" data-action="home">Return to Institute →</button><button class="btn btn-outline" data-action="review">Review Unit 1 work</button></div></section></main>`;
}

function render() {
  clearTimeout(activeTravelTimeout);
  let html = '';
  switch (progress.currentScreen) {
    case 'archive': html = archiveScreen(); break;
    case 'travel': html = travelScreen(); activeTravelTimeout=setTimeout(()=>{ const c=caseById(progress.activeCaseId); progress.currentScreen=c.route; save(); render(); }, 2100); break;
    case 'field': html = fieldScreen(); break;
    case 'source': html = sourceReader(); break;
    case 'codex': html = codexScreen(); break;
    case 'reconstruction': html = reconstructionScreen(); break;
    case 'ledger': html = exchangeLedgerScreen(); break;
    case 'empire': html = empireScreen(); break;
    case 'upload': html = uploadScreen(); break;
    case 'review': html = reviewScreen(); break;
    case 'completion': html = completionScreen(); break;
    default: html = instituteScreen();
  }
  app.innerHTML = html;
}

function unlockNext(caseId) {
  const index = UNIT_01.cases.findIndex(c=>c.id===caseId);
  if (!progress.completedCases.includes(caseId)) progress.completedCases.push(caseId);
  const next=UNIT_01.cases[index+1];
  if (next && !progress.unlocked.includes(next.id)) progress.unlocked.push(next.id);
  save();
}

function goToCase(caseId) {
  progress.activeCaseId=caseId;
  progress.currentScreen='travel';
  save(); render();
}

function showFeedback(id, message, type='success') { const el=document.getElementById(id); if(el){el.textContent=message;el.className=`feedback ${type}`;} }

app.addEventListener('click', (event)=>{
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action=target.dataset.action;
  if (action==='hub-open-table') { progress.hubNotice='Navigation Table opened. Select a teacher-unlocked route.'; progress.currentScreen='archive'; save(); render(); return; }
  if (action==='hub-interact') { interactWithHubTarget(target.dataset.target); return; }
  if (action==='hub-dialogue-close') { hubDialogueId=null; render(); return; }
  if (action==='home') { progress.currentScreen='institute'; save(); render(); }
  if (action==='archive') { progress.currentScreen='archive'; save(); render(); }
  if (action==='return-archive') { progress.pendingUploadCaseId=null; progress.activeCaseId=null; progress.hubNotice='Field record received. The Archive has preserved your Codex transmission.'; instituteMovement={x:13,y:9,facing:'up',moving:false,step:false,queued:null}; progress.currentScreen='institute'; save(); render(); }
  if (action==='clear-empire') { progress.empireOrder=[]; save(); render(); }
  if (action==='reset') { progress=resetProgress(); render(); }
  if (action==='author') { authorMode=!authorMode; render(); }
  if (action==='select-case') { progress.selectedCaseId=target.dataset.case; save(); render(); }
  if (action==='travel') { goToCase(target.dataset.case); }
  if (action==='skip-travel') { const c=caseById(progress.activeCaseId); progress.currentScreen=c.route; save(); render(); }
  if (action==='field') { progress.currentScreen='field'; save(); render(); }
  if (action==='open-source') { openSourceId=target.dataset.source; sourceOrigin=target.dataset.origin||'field'; progress.currentScreen='source'; save(); render(); }
  if (action==='return-source') { progress.currentScreen=sourceOrigin==='codex'?'codex':'field'; save(); render(); }
  if (action==='codex') { sourceOrigin=target.dataset.origin||'field'; progress.currentScreen='codex'; save(); render(); }
  if (action==='return-codex') { progress.currentScreen=sourceOrigin==='source' ? 'source' : (sourceOrigin==='hub' ? 'institute' : 'field'); save(); render(); }
  if (action==='submit-source') {
    const source=sourceById(target.dataset.source); const value=document.getElementById('sourceResponse')?.value.trim()||'';
    if(value.length<15) { alert('Write a brief evidence-based interpretation before opening Institute Context.'); return; }
    progress.responses[source.id]=value; if(!progress.revealedContexts.includes(source.id)) progress.revealedContexts.push(source.id); save(); render();
  }
  if (action==='secure-source') {
    const id=target.dataset.source; if(!progress.revealedContexts.includes(id)) return;
    const list=progress.caseEvidence['case-001']||[]; if(!list.includes(id)) list.push(id); progress.caseEvidence['case-001']=list;
    sourceOrigin='field'; progress.currentScreen='field'; save(); render();
  }
  if (action==='reconstruction') { progress.currentScreen='reconstruction'; save(); render(); }
  if (action==='check-reconstruction') {
    document.querySelectorAll('[data-reconstruction]').forEach(s=>{progress.reconstruction[s.dataset.reconstruction]=s.value;});
    const correct=CASE_001_SOURCES.every(s=>progress.reconstruction[s.id]===s.reconstruction); save();
    if(correct){unlockNext('case-001'); progress.pendingUploadCaseId='case-001'; progress.currentScreen='upload'; save(); render();}
    else showFeedback('reconstructionFeedback','Revisit the source type and date. Each record belongs in a different evidentiary lane.','error');
  }
  if (action==='check-ledger') {
    progress.exchangeLedger.answers ??= {};
    document.querySelectorAll('[data-ledger-question]:checked').forEach(s=>{ progress.exchangeLedger.answers[s.dataset.ledgerQuestion]=Number(s.value); });
    const unanswered=EXCHANGE_RECORDS.filter(r=>progress.exchangeLedger.answers[r.id] === undefined);
    if(unanswered.length){ save(); showFeedback('ledgerFeedback','Read and answer every source record before validating the Ledger.','error'); return; }
    const correct=EXCHANGE_RECORDS.every(r=>progress.exchangeLedger.answers[r.id]===r.answer); save();
    if(correct){unlockNext('case-002'); progress.pendingUploadCaseId='case-002'; progress.currentScreen='upload'; save(); render();}
    else showFeedback('ledgerFeedback','At least one interpretation needs revision. Re-read the source language and test what claim the evidence supports—not just where an item moved.','error');
  }
  if (action==='check-empire') {
    const reflection=document.getElementById('empireReflection')?.value.trim()||''; progress.responses['empire-reflection']=reflection;
    const expected=['claim','encomienda','slavery','hierarchy','resistance','exchange'];
    const correct=JSON.stringify(progress.empireOrder||[])===JSON.stringify(expected);
    save();
    if(correct && reflection.length>=20){unlockNext('case-003'); progress.pendingUploadCaseId='case-003'; progress.currentScreen='upload'; save(); render();}
    else showFeedback('empireFeedback','Arrange all six evidence records into a defensible sequence, then write a reflection using evidence from at least two cards.','error');
  }
  if(action==='review'){progress.currentScreen='review';save();render();}
  if(action==='submit-review') {
    document.querySelectorAll('[data-mcq]:checked').forEach(i=>{progress.review.answers[i.dataset.mcq]=Number(i.value);});
    document.querySelectorAll('[data-saq]').forEach(t=>{progress.review.saq[t.dataset.saq]=t.value.trim();});
    const filled=Object.values(progress.review.saq).filter(v=>v.length>0).length; save();
    if(filled===3){progress.unitComplete=true;progress.currentScreen='completion';save();render();}
    else showFeedback('reviewFeedback','Draft a response for all three SAQ parts before submitting the Unit 1 archive record.','error');
  }
});

app.addEventListener('change', event=>{
  const field=event.target;
  if(field.matches('[data-profile]')){progress.profile[field.dataset.profile]=field.value;save();}
});


app.addEventListener('dragstart', event => {
  const card = event.target.closest('[data-empire-card]');
  if (!card) return;
  event.dataTransfer.setData('text/plain', card.dataset.empireCard);
  event.dataTransfer.effectAllowed='move';
});
app.addEventListener('dragover', event => {
  const zone = event.target.closest('[data-drop-index]');
  if (zone) { event.preventDefault(); zone.classList.add('is-over'); }
});
app.addEventListener('dragleave', event => event.target.closest('[data-drop-index]')?.classList.remove('is-over'));
app.addEventListener('drop', event => {
  const zone = event.target.closest('[data-drop-index]');
  if (!zone) return;
  event.preventDefault();
  const cardId=event.dataTransfer.getData('text/plain');
  if(!cardId) return;
  const index=Number(zone.dataset.dropIndex);
  const next=(progress.empireOrder||[]).filter(id=>id!==cardId);
  next.splice(index,0,cardId);
  progress.empireOrder=next.slice(0, EMPIRE_EVIDENCE.length); save(); render();
});
window.addEventListener('keydown', event => {
  const key=event.key.toLowerCase();
  const moves={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};
  if (progress.currentScreen === 'institute') {
    if (key === 'e' || key === 'enter') { const nearby=nearestHubTarget(); if (nearby) { event.preventDefault(); interactWithHubTarget(nearby[0]); } return; }
    if(moves[key]) { event.preventDefault(); moveInstitutePlayer(...moves[key]); }
    return;
  }
  if (progress.currentScreen === 'field' && moves[key]) { event.preventDefault(); moveFieldPlayer(...moves[key]); }
});

render();
