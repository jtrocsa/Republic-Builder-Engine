import './styles/global.css';
import { CHRONICLE_CONTENT, CASE_001_SOURCES } from './content/chronicle-case-001.js';
import { readProgress, saveProgress, resetProgress } from './engine/chronicle-progress-store.js';

const app = document.querySelector('#app');
const playerSprite = new URL('./assets/chronicle-sprites/field/chronicler-a-down-idle.png', import.meta.url).href;
const mentorSprite = new URL('./assets/chronicle-sprites/field/field-mentor-idle.png', import.meta.url).href;

let progress = readProgress();
let activeSourceId = null;
let authorMode = false;
let field = { x: 3, y: 6, moving: false, queued: null };
let travelTimer = null;

const FIELD = [
  'wwwwwwwwwwwwwwww',
  'wwwwwwsssssswwww',
  'wwwwwssgggggssww',
  'wwwwssgggggggssw',
  'wwwssggppppggssw',
  'wwssgggppppgggsw',
  'wwssgggppppgggsw',
  'wwwssggppppggssw',
  'wwwwssgggggggssw',
  'wwwwwssssgggssww',
  'wwwwwwwwsssswwww'
];
const W = FIELD[0].length;
const H = FIELD.length;
const MENTOR = { x: 10, y: 5 };
const FIELD_SIGNALS = [
  { sourceId: 'taino-context', x: 6, y: 3 },
  { sourceId: 'columbus-letter', x: 8, y: 7 },
  { sourceId: 'waldseemuller-map', x: 12, y: 4 }
];
const BLOCKED = new Set(['w']);

function esc(v) { return String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'", '&#039;'); }
function sourceById(id) { return CASE_001_SOURCES.find((item) => item.id === id); }
function hasEvidence(id) { return progress.evidence.includes(id); }
function completeCount() { return progress.evidence.length; }
function sourceVisual(source) {
  if (source.visual === 'letter') return `<div class="source-paper source-paper--letter"><span>Letter fragment · 1493</span><p>${esc(source.excerpt)}</p><small>Read this as a report shaped by its writer, audience, and purpose.</small></div>`;
  if (source.visual === 'context') return `<div class="source-paper source-paper--context"><span>Context record</span><p>${esc(source.excerpt)}</p><small>Secondary context · not a primary source</small></div>`;
  return `<div class="source-map-card"><img src="${esc(source.imageUrl)}" alt="Historic 1507 world map by Martin Waldseemüller" onerror="this.closest('.source-map-card').classList.add('is-unavailable')" /><div class="source-map-fallback"><span>1507 map visual</span><b>Waldseemüller’s world map</b><p>Original visual linked in the source record.</p></div></div>`;
}
function chrome() {
  const c = CHRONICLE_CONTENT.brand;
  return `<header class="chrome"><div class="brand"><span class="brand-mark">✦</span><div><p>${esc(c.engine)}</p><strong>${esc(c.campaign)}</strong></div></div><div class="chrome-right"><span class="link-status"><i></i>${esc(c.status)}</span><button class="author-toggle ${authorMode ? 'active':''}" data-action="author">✦ ${authorMode ? 'Author Mode On':'Author Mode'}</button></div></header>`;
}
function authorPanel() {
  if (!authorMode) return '';
  return `<aside class="author-panel"><button class="close-author" data-action="author">×</button><p class="kicker">Development only</p><h2>Author Mode</h2><p>Text and content labels are editable; game structure and progression rules remain protected in code.</p><label>Institute title<input data-edit="institute.title" value="${esc(CHRONICLE_CONTENT.institute.title)}"></label><label>Current case title<input data-edit="institute.currentTitle" value="${esc(CHRONICLE_CONTENT.institute.currentTitle)}"></label><label>Case central question<textarea data-edit="case.centralQuestion">${esc(CHRONICLE_CONTENT.case.centralQuestion)}</textarea></label><label>Mentor note<textarea data-edit="case.mentorNote">${esc(CHRONICLE_CONTENT.case.mentorNote)}</textarea></label><p class="author-note">Draft changes save only in this browser during this session. The permanent source content remains in <code>src/content/chronicle-case-001.js</code>.</p></aside>`;
}
function instituteScreen() {
  const c = CHRONICLE_CONTENT.institute;
  return `${chrome()}<main class="shell institute-screen"><section class="intro"><p class="kicker">Present day · Home Base</p><h1>${esc(c.title)}</h1><p class="subtitle">${esc(c.subtitle)}</p><p>${esc(c.body)}</p><div class="actions"><button class="btn btn-gold" data-action="enter-archive">${esc(c.enter)} <span>→</span></button><button class="btn btn-outline" data-action="reset-progress">Reset demo progress</button></div></section><section class="institute-visual" aria-label="Illustrated Chronicle Institute foyer"><div class="institute-lamps"></div><div class="institute-stairs"></div><div class="institute-door" data-action="enter-archive" role="button" tabindex="0"><span>Archive</span></div><div class="institute-globe"></div><div class="institute-card"><p>Current record</p><strong>${esc(c.currentTitle)}</strong><span>Map table online</span></div></section></main>${authorPanel()}`;
}
function archiveScreen() {
  const c = CHRONICLE_CONTENT.institute;
  return `${chrome()}<main class="shell archive-screen"><section class="archive-copy"><button class="back-link" data-action="home">← Institute foyer</button><p class="kicker">The Archive</p><h1>${esc(c.mapTitle)}</h1><p>${esc(c.mapBody)}</p><div class="archive-legend"><span class="legend-active">● Active route</span><span class="legend-locked">○ Teacher locked</span></div></section><section class="map-table" aria-label="Interactive Atlantic map table"><div class="map-grid"></div><div class="continent continent-na"></div><div class="continent continent-sa"></div><div class="continent continent-eu"></div><div class="route-line route-one"></div><div class="route-line route-two"></div><button class="map-node map-node-active" data-action="open-case"><span>1493</span><b>Caribbean</b><small>Case 1.01</small></button><button class="map-node map-node-locked" disabled><span>1607</span><b>Chesapeake</b><small>${esc(c.locked)}</small></button><button class="map-node map-node-locked map-node-lower" disabled><span>1776</span><b>Philadelphia</b><small>${esc(c.locked)}</small></button></section><aside class="case-card"><p class="kicker">Active route</p><h2>${esc(c.currentTitle)}</h2><p>${esc(c.currentDescription)}</p><div class="case-stats"><span>Period 1</span><span>1491–1607</span><span>${completeCount()}/${CASE_001_SOURCES.length} evidence secured</span></div><button class="btn btn-gold" data-action="open-case">${esc(c.travel)} <span>→</span></button></aside></main>${authorPanel()}`;
}
function travelScreen() {
  return `${chrome()}<main class="travel-screen"><div class="travel-map"><span class="travel-origin">Chronicle Institute</span><i></i><span class="travel-destination">Caribbean · 1493</span><div class="traveler"></div></div><section><p class="kicker">Chronotravel Sequence</p><h1>Route confirmed.</h1><p>The Archive is opening a field connection to the Caribbean. We observe; we do not interfere.</p><div class="travel-progress"><span></span></div><p class="travel-status">Synchronizing the Codex with this case record…</p></section></main>${authorPanel()}`;
}
function tileMarkup() {
  return FIELD.flatMap((row,y) => row.split('').map((tile,x) => `<span class="field-tile field-tile-${tile}" style="grid-column:${x+1};grid-row:${y+1}"></span>`)).join('');
}
function pos({x,y}) { return `left:${((x+.5)/W*100).toFixed(3)}%;top:${((y+.5)/H*100).toFixed(3)}%;`; }
function near(a,b) { return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)<=1; }
function signalMarkup() { return FIELD_SIGNALS.map(signal => `<button class="evidence-signal ${hasEvidence(signal.sourceId)?'is-secured':''}" data-action="open-source" data-source="${signal.sourceId}" style="${pos(signal)}" ${near(field,signal)?'data-near="true"':''}><i>${hasEvidence(signal.sourceId)?'✓':'✦'}</i><span>${esc(sourceById(signal.sourceId).signalLabel)}</span></button>`).join(''); }
function fieldScreen() {
  const c = CHRONICLE_CONTENT.case;
  const all = completeCount() === CASE_001_SOURCES.length;
  return `${chrome()}<main class="field-shell"><section class="field-top"><div><button class="back-link" data-action="archive">← Archive map</button><p class="kicker">${esc(c.location)}</p><h1>${esc(c.title)}</h1><p class="field-question">${esc(c.centralQuestion)}</p></div><button class="codex-button" data-action="codex">Codex <b>${completeCount()}</b></button></section><section class="field-layout"><div class="historic-map" id="historicMap" style="--cols:${W};--rows:${H}">${tileMarkup()}<div class="field-tent"></div><div class="field-palm palm-a"></div><div class="field-palm palm-b"></div><div class="field-lantern"></div><div class="field-boat"></div>${signalMarkup()}<div class="mentor" style="${pos(MENTOR)}"><img src="${mentorSprite}" alt="Maren Vale" /><span>!</span></div><div class="player ${field.moving?'is-moving':''}" id="player" style="${pos(field)}"><img src="${playerSprite}" alt="Chronicler" /></div></div><aside class="field-channel"><p class="kicker">Field Channel</p><h2>${esc(c.mentor)}</h2><p class="role">${esc(c.mentorRole)}</p><p>${esc(c.mentorNote)}</p><div class="field-actions">${near(field,MENTOR)?'<button class="btn btn-gold" data-action="mentor">Speak →</button>':''}<button class="btn btn-outline" data-action="codex">Open Codex</button>${all?`<button class="btn btn-gold" data-action="submit">${esc(c.finish)} →</button>`:''}</div><p class="move-help">Movement: Arrow keys or WASD. Walk next to a signal, then click it or press E.</p></aside></section></main>${authorPanel()}`;
}
function sourceReader(source) {
  return `${chrome()}<main class="reader-shell"><header class="reader-head"><button class="back-link" data-action="field">← Back to field</button><button class="codex-button" data-action="codex">Codex <b>${completeCount()}</b></button></header><section class="source-reader"><div class="source-visual">${sourceVisual(source)}</div><article class="source-copy"><p class="kicker">${esc(source.sourceType)}</p><h1>${esc(source.title)}</h1><dl><div><dt>Creator</dt><dd>${esc(source.creator)}</dd></div><div><dt>Date</dt><dd>${esc(source.date)}</dd></div><div><dt>Record</dt><dd>${esc(source.provenance)}</dd></div></dl><section class="reader-context"><h2>Historical context</h2><p>${esc(source.context)}</p></section><section class="reader-prompt"><h2>Chronicler prompt</h2><p>${esc(source.sourceQuestion)}</p></section><p class="citation">${esc(source.citation)}</p><a class="source-link" href="${esc(source.sourceUrl)}" target="_blank" rel="noreferrer">View original source record ↗</a><button class="btn btn-gold" data-action="secure-source" data-source="${source.id}">${hasEvidence(source.id)?'Secured in Codex':'Secure in Codex'} <span>→</span></button></article></section></main>${authorPanel()}`;
}
function codexScreen() {
  return `${chrome()}<main class="codex-shell"><header class="reader-head"><button class="back-link" data-action="field">← Back to field</button><span class="codex-label">Chronicle Codex · Current Case</span></header><section class="codex-main"><div><p class="kicker">Evidence Satchel</p><h1>${esc(CHRONICLE_CONTENT.case.title)}</h1><p>Evidence remains in this case until you submit the field record. Then the completed case moves into the permanent Archive.</p></div><div class="evidence-grid">${CASE_001_SOURCES.map(s => `<article class="evidence-entry ${hasEvidence(s.id)?'secured':'locked'}"><span>${hasEvidence(s.id)?'Secured':'Signal not secured'}</span><h2>${esc(s.title)}</h2><p>${hasEvidence(s.id)?esc(s.context):'Locate this record in the historical setting, then secure it in the Codex.'}</p>${hasEvidence(s.id)?`<button class="text-btn" data-action="open-source" data-source="${s.id}">Open source reader →</button>`:''}</article>`).join('')}</div>${completeCount()===CASE_001_SOURCES.length?'<button class="btn btn-gold" data-action="submit">Submit field record →</button>':''}</section></main>${authorPanel()}`;
}
function reportScreen() {
  return `${chrome()}<main class="report-shell"><section><p class="kicker">Case 1.01 · Field Record</p><h1>Return what the evidence can support.</h1><p class="subtitle">Before you leave the Caribbean, state what each record shows and what it cannot prove alone.</p><div class="report-grid">${CASE_001_SOURCES.map((s,i)=>`<article><span>Record ${i+1}</span><h2>${esc(s.title)}</h2><p>${esc(s.sourceQuestion)}</p><textarea aria-label="Notes for ${esc(s.title)}" placeholder="Evidence notes (practice only)…"></textarea></article>`).join('')}</div><button class="btn btn-gold" data-action="submit-complete">Transmit to the Archive →</button></section></main>${authorPanel()}`;
}
function completionScreen() {
  return `${chrome()}<main class="completion-shell"><section><p class="kicker">Archive transmission received</p><h1>The first field record is preserved.</h1><p class="subtitle">Your evidence has returned to the Chronicle Institute. Case 1.01 is now marked as complete in the permanent Archive.</p><div class="completion-stats"><span>✓ 3 sources secured</span><span>✓ Codex record transmitted</span><span>✓ Case archive updated</span></div><button class="btn btn-gold" data-action="home">Return to Chronicle Institute →</button></section></main>${authorPanel()}`;
}
function render() {
  const screen = progress.currentScreen;
  if (screen === 'institute') app.innerHTML = instituteScreen();
  else if (screen === 'archive') app.innerHTML = archiveScreen();
  else if (screen === 'travel') app.innerHTML = travelScreen();
  else if (screen === 'field') app.innerHTML = fieldScreen();
  else if (screen === 'reader') app.innerHTML = sourceReader(sourceById(activeSourceId));
  else if (screen === 'codex') app.innerHTML = codexScreen();
  else if (screen === 'report') app.innerHTML = reportScreen();
  else app.innerHTML = completionScreen();
  bind();
}
function to(screen) { progress.currentScreen = screen; saveProgress(progress); render(); }
function startTravel() { to('travel'); clearTimeout(travelTimer); travelTimer = setTimeout(()=>to('field'), 1600); }
function blocked(x,y) { return x<0||y<0||x>=W||y>=H||BLOCKED.has(FIELD[y][x])||(x===MENTOR.x&&y===MENTOR.y); }
function move(dx,dy) {
  if (progress.currentScreen !== 'field') return;
  if (field.moving) { field.queued = [dx,dy]; return; }
  const next={x:field.x+dx,y:field.y+dy}; if (blocked(next.x,next.y)) return;
  field.moving=true; field.x=next.x; field.y=next.y;
  const el = app.querySelector('#player'); if (el) { el.style.cssText=pos(field); el.classList.add('is-moving'); }
  setTimeout(()=>{ field.moving=false; app.querySelector('#player')?.classList.remove('is-moving'); if(field.queued){const q=field.queued;field.queued=null;move(...q);} }, 180);
}
function bind() {
  app.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click', ()=>{
    const a=el.dataset.action; const source=el.dataset.source;
    if(a==='author'){authorMode=!authorMode;render();}
    else if(a==='home')to('institute'); else if(a==='enter-archive')to('archive'); else if(a==='archive')to('archive'); else if(a==='open-case')startTravel(); else if(a==='field')to('field'); else if(a==='codex')to('codex'); else if(a==='open-source'){activeSourceId=source;to('reader');} else if(a==='secure-source'){if(!hasEvidence(source)) progress.evidence=[...progress.evidence,source]; saveProgress(progress);to('field');} else if(a==='submit')to('report'); else if(a==='submit-complete'){progress.completedCases=[...new Set([...progress.completedCases,'case-001'])];progress.activeCase=null;saveProgress(progress);to('complete');} else if(a==='reset-progress'){progress=resetProgress();field={x:3,y:6,moving:false,queued:null};to('institute');}
  }));
  app.querySelectorAll('[data-edit]').forEach(el=>el.addEventListener('input',()=>{ const [section,key]=el.dataset.edit.split('.'); CHRONICLE_CONTENT[section][key]=el.value; }));
}
window.addEventListener('keydown',(event)=>{
  const map={ArrowUp:[0,-1],w:[0,-1],W:[0,-1],ArrowDown:[0,1],s:[0,1],S:[0,1],ArrowLeft:[-1,0],a:[-1,0],A:[-1,0],ArrowRight:[1,0],d:[1,0],D:[1,0]};
  if (progress.currentScreen!=='field') return;
  const vector=map[event.key];
  if(vector){event.preventDefault();move(...vector);} else if ((event.key==='e'||event.key==='E')) { const nearby=FIELD_SIGNALS.find(s=>near(field,s)); if(nearby){activeSourceId=nearby.sourceId;to('reader');} }
});
render();
