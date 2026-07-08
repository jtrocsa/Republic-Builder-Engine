import './styles/global.css';
import { BRAND, UNIT_01, CASE_001_SOURCES, EXCHANGE_RECORDS, EMPIRE_EVIDENCE, EMPIRE_CONNECTIONS, REVIEW } from './content/unit-01-campaign.js';
import { readProgress, saveProgress, resetProgress } from './engine/chronicle-progress-store.js';

const app = document.querySelector('#app');
const atlanticTable = new URL('./assets/maps/atlantic-navigation-table.png', import.meta.url).href;
const waldseemuller = new URL('./assets/documents/source-waldseemuller-1507.jpg', import.meta.url).href;

const recallBeaconBlue = new URL('./assets/chronicle-sprites/field/recall-beacon-blue.png', import.meta.url).href;
const fieldNpcSprites = {
  'taino-elder': new URL('./assets/chronicle-sprites/field/npc-taino-elder.png', import.meta.url).href,
  'taino-gardener': new URL('./assets/chronicle-sprites/field/npc-taino-gardener.png', import.meta.url).href,
  'taino-fisher': new URL('./assets/chronicle-sprites/field/npc-taino-fisher.png', import.meta.url).href,
  'spanish-sailor': new URL('./assets/chronicle-sprites/field/npc-spanish-sailor.png', import.meta.url).href,
  'columbus': new URL('./assets/chronicle-sprites/field/npc-columbus.png', import.meta.url).href,
  'spanish-scribe': new URL('./assets/chronicle-sprites/field/npc-scribe.png', import.meta.url).href
};

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
const instituteHubBackground = new URL('./assets/institute/chronicle-institute-hub.png', import.meta.url).href;
const instituteNpcSprites = {
  director: new URL('./assets/institute/director-rowan-hale.png', import.meta.url).href,
  amani: new URL('./assets/institute/researcher-amani-soto.png', import.meta.url).href,
  julian: new URL('./assets/institute/professor-julian-park.png', import.meta.url).href
};

let fieldMovement = { x: 8.3, y: 13.6, facing: 'right', moving: false, step: false, queued: null };
const FIELD_GRID = { columns: 40, rows: 24, tile: 40 };
const FIELD_STEP = 0.18;
const FIELD_BLOCKS = [
  // The field uses a Pokémon-style physics layer: feet collide with bases, not decorative overlap.
  { x1: 2.9, y1: 7.2, x2: 9.9, y2: 9.7, kind: 'ship hull' },
  { x1: 17.6, y1: 5.1, x2: 22.8, y2: 7.8, kind: 'garden' },
  { x1: 22.6, y1: 8.0, x2: 26.3, y2: 10.8, kind: 'bohio one' },
  { x1: 26.5, y1: 8.7, x2: 30.3, y2: 11.4, kind: 'bohio two' },
  { x1: 24.1, y1: 11.3, x2: 27.9, y2: 14.2, kind: 'bohio three' },
  { x1: 28.6, y1: 13.1, x2: 32.2, y2: 14.2, kind: 'canoe' },
  { x1: 31.2, y1: 14.4, x2: 32.8, y2: 15.8, kind: 'campfire' },
  { x1: 33.1, y1: 15.0, x2: 35.4, y2: 16.7, kind: 'crate' },
  { x1: 31.6, y1: 16.5, x2: 35.4, y2: 19.2, kind: 'tent' },
  { x1: 12.7, y1: 16.4, x2: 15.4, y2: 20.3, kind: 'southwest palm' },
  { x1: 13.2, y1: 6.5, x2: 15.3, y2: 9.9, kind: 'north palm' },
  { x1: 20.0, y1: 4.1, x2: 22.4, y2: 7.4, kind: 'garden palm' },
  { x1: 34.0, y1: 10.8, x2: 36.0, y2: 14.5, kind: 'east palm' }
];
const FIELD_NPCS = [
  { id: 'taino-elder', x: 27.4, y: 13.6, group: 'taino', name: 'Taíno community elder', label: 'Community elder', sprite: 'taino-elder', text: 'This dramatized field dialogue represents a community perspective. Preserve the observation: the village has houses, gardens, canoes, leadership, and daily work before European records describe it.' },
  { id: 'taino-gardener', x: 21.6, y: 6.9, group: 'taino', name: 'Taíno gardener', label: 'Garden worker', sprite: 'taino-gardener', text: 'The field is not empty wilderness. Cassava, maize, and other cultivated foods are part of the record you are preserving.' },
  { id: 'taino-fisher', x: 29.2, y: 15.6, group: 'taino', name: 'Taíno canoe worker', label: 'Canoe worker', sprite: 'taino-fisher', text: 'Canoes and shoreline work connect the village to water, travel, and exchange. Use observations like this before accepting outside descriptions at face value.' },
  { id: 'spanish-sailor', x: 33.7, y: 16.2, group: 'spanish', name: 'Spanish sailor', label: 'Spanish sailor', sprite: 'spanish-sailor', text: 'The camp sees the island through voyage, crown, conversion, and profit. Compare that point of view with what you observe in the village.' },
  { id: 'columbus', x: 5.8, y: 8.4, group: 'spanish', name: 'Christopher Columbus', label: 'Columbus', sprite: 'columbus', text: 'Dramatized encounter: Columbus is not a neutral narrator. His report was written for Spanish officials whose support mattered.' },
  { id: 'spanish-scribe', x: 32.1, y: 18.0, group: 'spanish', name: 'Spanish scribe', label: 'Scribe', sprite: 'spanish-scribe', text: 'The written record can preserve evidence, but it also carries the writer’s purpose, audience, and assumptions.' }
];
const FIELD_SOURCE_POINTS = {
  'taino-context': { x: 27.7, y: 15.2, label: 'Village investigation', kind: 'Observe + interview' },
  'columbus-letter': { x: 6.6, y: 9.6, label: 'Columbus account', kind: 'Source encounter' },
  'waldseemuller-map': { x: 11.0, y: 12.7, label: 'Map fragments', kind: 'Jigsaw reconstruction' }
};
const VILLAGE_OBSERVATIONS = [
  { id: 'elder', title: 'Community elder', scene: 'Near the center of the village, an elder directs a dispute and points toward the shore where workers prepare canoes.', note: 'Leadership and social organization existed before Europeans arrived.' },
  { id: 'bohio', title: 'Bohío homes', scene: 'Families move between rounded houses, stored food, and shared work spaces. The settlement is organized, occupied, and lived in.', note: 'Homes, family life, and settlement patterns contradict the idea of an empty island.' },
  { id: 'garden', title: 'Garden and canoe work', scene: 'A garden worker and canoe worker coordinate food, water travel, and shoreline labor before the Spanish camp appears in the written record.', note: 'Food production and shoreline activity show a society with work, skill, and exchange.' }
];
const MAP_PIECES = [
  { id: 'p1', label: 'Fragment A', col: 0, row: 0 },
  { id: 'p2', label: 'Fragment B', col: 1, row: 0 },
  { id: 'p3', label: 'Fragment C', col: 2, row: 0 },
  { id: 'p4', label: 'Fragment D', col: 3, row: 0 },
  { id: 'p5', label: 'Fragment E', col: 4, row: 0 },
  { id: 'p6', label: 'Fragment F', col: 0, row: 1 },
  { id: 'p7', label: 'Fragment G', col: 1, row: 1 },
  { id: 'p8', label: 'Fragment H', col: 2, row: 1 },
  { id: 'p9', label: 'Fragment I', col: 3, row: 1 },
  { id: 'p10', label: 'Fragment J', col: 4, row: 1 }
];
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
const VOLATILE_SCREENS = new Set(['source']);
const VALID_SCREENS = new Set(['institute','archive','travel','field','village-activity','columbus-activity','map-jigsaw','source','codex','reconstruction','ledger','empire','upload','review','completion']);
if (!VALID_SCREENS.has(progress.currentScreen) || VOLATILE_SCREENS.has(progress.currentScreen) || (progress.currentScreen === 'travel' && !progress.activeCaseId)) {
  progress.currentScreen = progress.activeCaseId ? 'field' : 'institute';
  saveProgress(progress);
}
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
  return `left:${(fieldMovement.x * FIELD_GRID.tile).toFixed(1)}px;top:${(fieldMovement.y * FIELD_GRID.tile).toFixed(1)}px;`;
}
function fieldSpriteUrl() {
  const appearance = progress.profile.appearance === 'b' ? 'b' : 'a';
  const direction = fieldMovement.facing === 'left' || fieldMovement.facing === 'right' ? 'side' : fieldMovement.facing;
  return fieldSpriteAssets[appearance][direction][fieldMovement.moving ? 'step' : 'idle'];
}
function ellipse(x, y, cx, cy, rx, ry) { return (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2) <= 1; }
function isCaribbeanLand(x, y) {
  const mainBeach = ellipse(x, y, 20, 12.5, 17.5, 9.4);
  const westCove = ellipse(x, y, 8.2, 12.8, 6.2, 5.9);
  const eastPoint = ellipse(x, y, 31.7, 13.1, 7.4, 6.8);
  const northVillage = ellipse(x, y, 23.2, 8.6, 7.1, 5.8);
  return mainBeach || westCove || eastPoint || northVillage;
}
function rectsOverlap(a, b) {
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
}
function footBoxFor(x, y) {
  const footY = y + 0.54;
  return { x1: x - 0.26, x2: x + 0.26, y1: footY - 0.16, y2: footY + 0.18 };
}
function npcFootBox(npc) {
  return { x1: npc.x - 0.34, x2: npc.x + 0.34, y1: npc.y + 0.18, y2: npc.y + 0.84 };
}
function isFieldBlocked(x, y) {
  if (x < 1.2 || y < 0.9 || x > FIELD_GRID.columns - 1.2 || y > FIELD_GRID.rows - 1.0) return true;
  const foot = footBoxFor(x, y);
  const landChecks = [
    [foot.x1, foot.y1], [foot.x2, foot.y1],
    [foot.x1, foot.y2], [foot.x2, foot.y2],
    [(foot.x1 + foot.x2) / 2, foot.y2]
  ];
  if (!landChecks.every(([px, py]) => isCaribbeanLand(px, py))) return true;
  if (FIELD_BLOCKS.some(block => rectsOverlap(foot, block))) return true;
  return FIELD_NPCS.some(npc => rectsOverlap(foot, npcFootBox(npc)));
}
function updateFieldPlayer() {
  const player = document.getElementById('caseFieldPlayer');
  const sprite = document.getElementById('caseFieldPlayerSprite');
  const world = document.getElementById('caribbeanWorld');
  if (!player || !sprite) return;
  player.style.cssText = fieldPositionStyle();
  player.dataset.facing = fieldMovement.facing;
  player.classList.toggle('is-walking', fieldMovement.moving);
  sprite.src = fieldSpriteUrl();
  if (world) {
    const viewport = world.parentElement.getBoundingClientRect();
    const worldWidth = FIELD_GRID.columns * FIELD_GRID.tile;
    const worldHeight = FIELD_GRID.rows * FIELD_GRID.tile;
    const px = fieldMovement.x * FIELD_GRID.tile;
    const py = fieldMovement.y * FIELD_GRID.tile;
    const minX = Math.min(0, viewport.width - worldWidth);
    const minY = Math.min(0, viewport.height - worldHeight);
    const camX = Math.max(minX, Math.min(0, viewport.width / 2 - px));
    const camY = Math.max(minY, Math.min(0, viewport.height / 2 - py));
    world.style.transform = `translate(${camX}px, ${camY}px)`;
  }
}
function moveFieldPlayer(dx, dy) {
  if (progress.currentScreen !== 'field') return;
  if (fieldMovement.moving) { fieldMovement.queued = [dx, dy]; return; }
  const nx = Number((fieldMovement.x + dx * FIELD_STEP).toFixed(2));
  const ny = Number((fieldMovement.y + dy * FIELD_STEP).toFixed(2));
  fieldMovement.facing = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down';
  if (isFieldBlocked(nx, ny)) { updateFieldPlayer(); return; }
  fieldMovement.x = nx; fieldMovement.y = ny; fieldMovement.moving = true; fieldMovement.step = !fieldMovement.step; updateFieldPlayer();
  window.setTimeout(() => {
    fieldMovement.moving = false; updateFieldPlayer();
    if (fieldMovement.queued) { const next = fieldMovement.queued; fieldMovement.queued = null; moveFieldPlayer(...next); }
  }, 42);
}

function ensureSourceActivity(sourceId) {
  progress.sourceActivities ??= {};
  progress.sourceActivities[sourceId] ??= { observed: [], choice: null, placed: {}, completed: false };
  return progress.sourceActivities[sourceId];
}
function sourceActivityRoute(sourceId) {
  if (sourceId === 'taino-context') return 'village-activity';
  if (sourceId === 'columbus-letter') return 'columbus-activity';
  if (sourceId === 'waldseemuller-map') return 'map-jigsaw';
  return 'source';
}
function sourcePointStyle(sourceId) {
  const point = FIELD_SOURCE_POINTS[sourceId] || { x: 10, y: 10 };
  return `left:${(point.x * FIELD_GRID.tile).toFixed(1)}px;top:${(point.y * FIELD_GRID.tile).toFixed(1)}px`;
}
function fieldSourceSignal(source, index) {
  const secured = hasEvidence('case-001',source.id);
  const point = FIELD_SOURCE_POINTS[source.id] || { label: source.title, kind: source.type };
  const action = secured ? 'open-source' : 'start-source-activity';
  return `<button class="source-signal source-signal--world ${secured ? 'is-secured' : ''} signal-${index+1}" style="${sourcePointStyle(source.id)}" data-action="${action}" data-source="${source.id}" data-origin="field"><i>${secured ? '✓' : '✦'}</i><b>${esc(point.kind)}</b><small>${esc(point.label)}</small></button>`;
}
function fieldNpcButton(npc) {
  const sprite = fieldNpcSprites[npc.sprite] || fieldNpcSprites['taino-elder'];
  return `<button class="field-npc field-npc--${esc(npc.group)}" style="left:${(npc.x * FIELD_GRID.tile).toFixed(1)}px;top:${(npc.y * FIELD_GRID.tile).toFixed(1)}px" data-action="field-talk" data-npc="${esc(npc.id)}" aria-label="Talk with ${esc(npc.name)}"><img src="${sprite}" alt=""><span>${esc(npc.label)}</span></button>`;
}
function recallBeacon() {
  return `<button class="recall-beacon" style="left:${(8.1 * FIELD_GRID.tile).toFixed(1)}px;top:${(13.2 * FIELD_GRID.tile).toFixed(1)}px" data-action="field-recall" aria-label="Recall to Archive room"><img src="${recallBeaconBlue}" alt=""><span>Recall to Archive</span></button>`;
}
function fieldScreen() {
  const allSecured = countEvidence('case-001') === CASE_001_SOURCES.length;
  const fieldNotice = progress.fieldNotice || 'Use E / Enter near the blue recall beacon to return to the Institute. Interact with people and source sites to rebuild the record.';
  return `${chrome()}<main class="shell case-field case-field--living"><section class="field-intro"><button class="back-link" data-action="home">← Recall to Institute</button><p class="kicker">Caribbean · 1493</p><h1>The Atlantic Crossroads</h1><p class="field-question">${esc(caseById('case-001').question)}</p><p>You are the only Chronicler in the field. Explore the village, shoreline, ship area, and Spanish camp. Evidence is earned through interaction, not floating collection.</p><p class="field-notice" id="fieldNotice">${esc(fieldNotice)}</p></section><section class="field-viewport field-scene--interactive" id="caseFieldMap"><div class="caribbean-world" id="caribbeanWorld" style="width:${FIELD_GRID.columns * FIELD_GRID.tile}px;height:${FIELD_GRID.rows * FIELD_GRID.tile}px"><div class="ocean-layer"></div><div class="island-sand island-main"></div><div class="island-sand island-west"></div><div class="island-sand island-east"></div><div class="island-grass grass-main"></div><button class="arrival-cove recall-cove" data-action="field-recall" aria-label="Return to Archive room"><span>Archive recall point</span></button>${recallBeacon()}<div class="spanish-ship"><span class="mast"></span><span class="sail sail-one"></span><span class="sail sail-two"></span><b>✚</b></div><div class="ship-shadow"></div><div class="village"><div class="bohio hut-one"><span></span></div><div class="bohio hut-two"><span></span></div><div class="bohio hut-three"><span></span></div><div class="canoe canoe-one"></div><div class="garden garden-one"></div></div><div class="spanish-camp"><div class="campfire"></div><div class="crate crate-one"></div><div class="tent-small"></div></div><div class="palm p1"></div><div class="palm p2"></div><div class="palm p3"></div><div class="palm p4"></div>${FIELD_NPCS.map(fieldNpcButton).join('')}${CASE_001_SOURCES.map(fieldSourceSignal).join('')}<div class="case-field-player" id="caseFieldPlayer" data-facing="${fieldMovement.facing}" style="${fieldPositionStyle()}"><span></span><img id="caseFieldPlayerSprite" src="${fieldSpriteUrl()}" alt="${esc(progress.profile.name || 'Chronicler')}"></div></div></section><aside class="field-channel"><p class="kicker">Codex field link</p><h2>Evidence Channel</h2><p class="role">Archive connection · portable</p><p>Institute staff remain in the Archive. In the field, your Codex preserves source readings, observation notes, and the final transmission back to the Navigation Table.</p><button class="btn btn-outline" data-action="codex" data-origin="field">Open Codex <b>${countEvidence('case-001')}</b></button>${allSecured ? `<button class="btn btn-gold" data-action="reconstruction">Open Reconstruction Table →</button>` : `<p class="channel-progress">Complete the village investigation, Columbus source encounter, and map reconstruction.</p>`}</aside></main>`;
}

function villageActivityScreen() {
  const source = sourceById('taino-context');
  const activity = ensureSourceActivity(source.id);
  const observed = new Set(activity.observed || []);
  const activeId = activity.activeObservation || VILLAGE_OBSERVATIONS.find(item => !observed.has(item.id))?.id || VILLAGE_OBSERVATIONS[0].id;
  const active = VILLAGE_OBSERVATIONS.find(item => item.id === activeId) || VILLAGE_OBSERVATIONS[0];
  const complete = VILLAGE_OBSERVATIONS.every(item => observed.has(item.id));
  const cards = VILLAGE_OBSERVATIONS.map(item => `<button class="investigation-card ${observed.has(item.id) ? 'is-complete' : ''} ${active.id===item.id?'is-active':''}" data-action="observe-village" data-observe="${item.id}"><b>${esc(item.title)}</b><span>${esc(item.scene)}</span><i>${observed.has(item.id) ? 'Observation saved ✓' : 'Investigate this scene'}</i></button>`).join('');
  return `${chrome()}<main class="shell activity-shell village-investigation-shell"><section class="activity-copy"><button class="back-link" data-action="field">← Back to Caribbean field</button><p class="kicker">Case 1.01 interaction</p><h1>Village Investigation</h1><p>Do not begin with the European written record. Watch the village first, collect observations, and then use the context record to test what your field evidence suggests.</p><div class="activity-rule"><b>Goal:</b> investigate all three scenes, then open the context record and write your own interpretation.</div></section><section class="activity-board village-board"><div class="village-scene village-scene--animated"><div class="mini-garden"></div><div class="bohio mini-hut"><span></span></div><div class="mini-canoe"></div><img src="${fieldNpcSprites['taino-elder']}" alt="" class="mini-person elder"><img src="${fieldNpcSprites['taino-gardener']}" alt="" class="mini-person gardener"><img src="${fieldNpcSprites['taino-fisher']}" alt="" class="mini-person fisher"><div class="scene-dialogue"><b>${esc(active.title)}</b><p>${esc(active.scene)}</p><span>${esc(active.note)}</span></div></div><div class="investigation-grid">${cards}</div>${complete ? `<p class="activity-feedback success">Village record stabilized. You observed leadership, settlement, cultivated work, and shoreline activity before opening the secondary context note.</p><button class="btn btn-gold" data-action="open-activity-source" data-source="${source.id}">Open context record →</button>` : `<p class="activity-feedback">${observed.size}/3 field scenes investigated. Click each scene to preserve what you observed.</p>`}</section></main>`;
}

function columbusActivityScreen() {
  const source = sourceById('columbus-letter');
  const activity = ensureSourceActivity(source.id);
  const selected = activity.choice;
  const choiceText = selected === 'audience'
    ? 'Correct. POV is shaped by audience and purpose: Columbus emphasizes what would matter to Spanish sponsors and officials.'
    : selected
      ? 'Reconsider the speaker’s audience and purpose. A primary source is evidence, but it is not automatically neutral.'
      : '';
  return `${chrome()}<main class="shell activity-shell spanish-encounter-shell"><section class="activity-copy"><button class="back-link" data-action="field">← Back to Caribbean field</button><p class="kicker">Case 1.01 interaction</p><h1>Spanish Camp Source Encounter</h1><p>The dialogue below is dramatized and historically grounded. Use it to think about point of view before opening the actual letter excerpt.</p><div class="camp-dialogue quote-dialogue"><img src="${fieldNpcSprites.columbus}" alt=""><div><b>Christopher Columbus</b><p>“The sovereigns will want to know what this voyage can bring them: land, souls, trade, and another crossing.”</p></div></div><div class="camp-dialogue quote-dialogue"><img src="${fieldNpcSprites['spanish-scribe']}" alt=""><div><b>Spanish scribe</b><p>“Then the account must persuade as well as record. We write for the court, not only for ourselves.”</p></div></div></section><section class="activity-board"><h2>POV checkpoint</h2><p>Which statement best explains how point of view should shape a Chronicler’s reading of Columbus’s 1493 letter?</p><div class="choice-stack"><label><input type="radio" name="columbus-choice" data-action="columbus-choose" value="audience" ${selected==='audience'?'checked':''}> Columbus’s claims should be read alongside his audience and purpose because he was reporting to Spanish officials whose support mattered.</label><label><input type="radio" name="columbus-choice" data-action="columbus-choose" value="neutral" ${selected==='neutral'?'checked':''}> The letter should be treated as neutral because firsthand accounts do not contain assumptions or motives.</label><label><input type="radio" name="columbus-choice" data-action="columbus-choose" value="taino" ${selected==='taino'?'checked':''}> The letter mainly reveals the point of view of Taíno communities because it records their exact words.</label><label><input type="radio" name="columbus-choice" data-action="columbus-choose" value="map" ${selected==='map'?'checked':''}> The letter is best used as a map source because it shows later European geographic labeling.</label></div>${choiceText ? `<p class="activity-feedback ${selected==='audience'?'success':'error'}">${esc(choiceText)}</p>` : ''}${selected==='audience' ? `<button class="btn btn-gold" data-action="open-activity-source" data-source="${source.id}">Open Columbus letter →</button>` : ''}</section></main>`;
}

function mapJigsawScreen() {
  const source = sourceById('waldseemuller-map');
  const activity = ensureSourceActivity(source.id);
  activity.placed ??= {};
  const complete = MAP_PIECES.every(piece => activity.placed[piece.id] === piece.id);
  const placedIds = new Set(Object.values(activity.placed));
  const slots = MAP_PIECES.map(piece => {
    const placed = activity.placed[piece.id];
    const pieceInfo = MAP_PIECES.find(p=>p.id===placed);
    return `<div class="map-slot map-slot--${piece.id} ${placed ? 'has-piece' : ''}" data-map-slot="${piece.id}">${pieceInfo ? `<div class="map-piece map-piece--${pieceInfo.id}" draggable="true" data-map-piece="${pieceInfo.id}"><span>${esc(pieceInfo.label)}</span></div>` : `<span>Place fragment</span>`}</div>`;
  }).join('');
  const tray = MAP_PIECES.filter(piece => !placedIds.has(piece.id)).sort((a,b)=>a.label.localeCompare(b.label)).map(piece => `<div class="map-piece map-piece--${piece.id}" draggable="true" data-map-piece="${piece.id}"><span>${esc(piece.label)}</span></div>`).join('');
  return `${chrome()}<main class="shell activity-shell activity-shell--wide"><section class="activity-copy"><button class="back-link" data-action="field">← Back to Caribbean field</button><p class="kicker">Case 1.01 interaction</p><h1>Map Reconstruction</h1><p>Reassemble ten fragments of the European world map. Some pieces have straight outer edges; others use puzzle-cut shapes. When the image resolves, decide what kind of evidence this map can provide.</p><div class="activity-rule"><b>Goal:</b> use the image details to place all ten fragments, then open the visual source reader.</div></section><section class="activity-board jigsaw-board jigsaw-board--ten"><div class="jigsaw-grid jigsaw-grid--ten">${slots}</div><div class="piece-tray piece-tray--ten">${tray || '<p>All fragments placed.</p>'}</div>${complete ? `<p class="activity-feedback success">Map reconstructed. This source is useful for changing European geographic knowledge, not for direct evidence of Taíno daily life.</p><button class="btn btn-gold" data-action="open-activity-source" data-source="${source.id}">Open map source →</button>` : `<p class="activity-feedback">Drag each fragment into the matching place by image continuity, coastlines, text blocks, and straight outside edges.</p>`}</section></main>`;
}

function sourceVisual(source) {
  if (source.visual === 'letter') return `<div class="document-paper"><span>Primary-source transcript · 1493</span><blockquote>${esc(source.excerpt)}</blockquote><small>Textual record. Read for perspective, audience, purpose, and language.</small></div>`;
  if (source.visual === 'context') return `<div class="document-paper document-paper--context"><span>Secondary context record</span><p>${esc(source.excerpt)}</p><small>Background evidence, not a Taíno-authored primary source.</small></div>`;
  return `<figure class="document-image"><img src="${waldseemuller}" alt="Local course copy of Martin Waldseemüller’s 1507 world map"><figcaption>Local course copy of a Library of Congress scan. Zoom is intentionally preserved in the reader; students do not need to leave Chronicle to view it.</figcaption></figure>`;
}

function sourceReader() {
  const source = sourceById(openSourceId);
  if (!source) {
    progress.currentScreen = sourceOrigin === 'codex' ? 'codex' : 'field';
    save();
    return `${chrome()}<main class="shell"><section class="empty-state"><p class="kicker">Codex reader reset</p><h1>Source reader restored.</h1><p>The app recovered from a reload while a source reader was open. Return to the field and open the source again.</p><button class="btn btn-gold" data-action="field">Back to Caribbean field →</button></section></main>`;
  }
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
    case 'village-activity': html = villageActivityScreen(); break;
    case 'columbus-activity': html = columbusActivityScreen(); break;
    case 'map-jigsaw': html = mapJigsawScreen(); break;
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
  if (progress.currentScreen === 'field') window.requestAnimationFrame(updateFieldPlayer);
  if (progress.currentScreen === 'institute') window.requestAnimationFrame(updateInstitutePlayer);
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
  if (action==='field-talk') { const npc=FIELD_NPCS.find(item=>item.id===target.dataset.npc); if(npc){progress.fieldNotice=`${npc.name}: ${npc.text}`; save(); const notice=document.getElementById('fieldNotice'); if(notice) notice.textContent=progress.fieldNotice;} return; }
  if (action==='field-recall') { progress.hubNotice='Temporal recall complete. You returned through the Archive room beacon.'; instituteMovement={x:13,y:9,facing:'up',moving:false,step:false,queued:null}; progress.currentScreen='institute'; save(); render(); return; }
  if (action==='start-source-activity') { openSourceId=target.dataset.source; sourceOrigin='field'; ensureSourceActivity(openSourceId); progress.currentScreen=sourceActivityRoute(openSourceId); save(); render(); return; }
  if (action==='open-activity-source') { openSourceId=target.dataset.source; sourceOrigin='field'; ensureSourceActivity(openSourceId).completed=true; progress.currentScreen='source'; save(); render(); return; }
  if (action==='observe-village') { const a=ensureSourceActivity('taino-context'); a.observed ??=[]; a.activeObservation=target.dataset.observe; if(!a.observed.includes(target.dataset.observe)) a.observed.push(target.dataset.observe); save(); render(); return; }
  if (action==='columbus-choose') { const a=ensureSourceActivity('columbus-letter'); a.choice=target.value; save(); render(); return; }
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
  const mapPiece = event.target.closest('[data-map-piece]');
  if (mapPiece) {
    event.dataTransfer.setData('text/map-piece', mapPiece.dataset.mapPiece);
    event.dataTransfer.effectAllowed='move';
    return;
  }
  const card = event.target.closest('[data-empire-card]');
  if (!card) return;
  event.dataTransfer.setData('text/plain', card.dataset.empireCard);
  event.dataTransfer.effectAllowed='move';
});
app.addEventListener('dragover', event => {
  const mapSlot = event.target.closest('[data-map-slot]');
  const zone = event.target.closest('[data-drop-index]');
  if (mapSlot || zone) { event.preventDefault(); (mapSlot||zone).classList.add('is-over'); }
});
app.addEventListener('dragleave', event => { event.target.closest('[data-drop-index]')?.classList.remove('is-over'); event.target.closest('[data-map-slot]')?.classList.remove('is-over'); });
app.addEventListener('drop', event => {
  const mapSlot = event.target.closest('[data-map-slot]');
  if (mapSlot) {
    event.preventDefault();
    const pieceId = event.dataTransfer.getData('text/map-piece');
    if (!pieceId) return;
    const a = ensureSourceActivity('waldseemuller-map');
    a.placed ??= {};
    Object.keys(a.placed).forEach(slot => { if (a.placed[slot] === pieceId) delete a.placed[slot]; });
    a.placed[mapSlot.dataset.mapSlot] = pieceId;
    save(); render(); return;
  }
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
