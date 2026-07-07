import { CHRONICLE_IDENTITY_DEFAULTS } from '../../content/chronicle-identity.defaults.js';
import {
  clearLocalContent,
  clone,
  downloadContent,
  readImportedContent,
  readLocalContent,
  setAtPath,
  writeLocalContent
} from '../../engine/content/author-content-store.js';
import { readPlayerProfile, writePlayerProfile } from '../../engine/player/player-profile-store.js';

const CONTENT_KEY = 'republic-builder.chronicle.identity.author-content.v1';
const AUTOSAVE_DELAY = 650;
const spriteA = new URL('../../assets/chronicle-sprites/chronicler-a.png', import.meta.url).href;
const spriteB = new URL('../../assets/chronicle-sprites/chronicler-b.png', import.meta.url).href;
const mentorSprite = new URL('../../assets/chronicle-sprites/field-mentor.png', import.meta.url).href;
const codexSprite = new URL('../../assets/chronicle-sprites/chronicle-codex.png', import.meta.url).href;

const FIELD_ASSETS = {
  a: {
    down: { idle: new URL('../../assets/chronicle-sprites/field/chronicler-a-down-idle.png', import.meta.url).href, step: new URL('../../assets/chronicle-sprites/field/chronicler-a-down-step.png', import.meta.url).href },
    up: { idle: new URL('../../assets/chronicle-sprites/field/chronicler-a-up-idle.png', import.meta.url).href, step: new URL('../../assets/chronicle-sprites/field/chronicler-a-up-step.png', import.meta.url).href },
    side: { idle: new URL('../../assets/chronicle-sprites/field/chronicler-a-side-idle.png', import.meta.url).href, step: new URL('../../assets/chronicle-sprites/field/chronicler-a-side-step.png', import.meta.url).href }
  },
  b: {
    down: { idle: new URL('../../assets/chronicle-sprites/field/chronicler-b-down-idle.png', import.meta.url).href, step: new URL('../../assets/chronicle-sprites/field/chronicler-b-down-step.png', import.meta.url).href },
    up: { idle: new URL('../../assets/chronicle-sprites/field/chronicler-b-up-idle.png', import.meta.url).href, step: new URL('../../assets/chronicle-sprites/field/chronicler-b-up-step.png', import.meta.url).href },
    side: { idle: new URL('../../assets/chronicle-sprites/field/chronicler-b-side-idle.png', import.meta.url).href, step: new URL('../../assets/chronicle-sprites/field/chronicler-b-side-step.png', import.meta.url).href }
  }
};
const FIELD_PROP_ASSETS = {
  palm: new URL('../../assets/chronicle-sprites/field/palm.png', import.meta.url).href,
  tent: new URL('../../assets/chronicle-sprites/field/field-tent.png', import.meta.url).href,
  beacon: new URL('../../assets/chronicle-sprites/field/arrival-beacon.png', import.meta.url).href,
  crate: new URL('../../assets/chronicle-sprites/field/supply-crate.png', import.meta.url).href,
  lantern: new URL('../../assets/chronicle-sprites/field/field-lantern.png', import.meta.url).href,
  rowboat: new URL('../../assets/chronicle-sprites/field/rowboat.png', import.meta.url).href,
  rocks: new URL('../../assets/chronicle-sprites/field/shore-rocks.png', import.meta.url).href,
  mentor: new URL('../../assets/chronicle-sprites/field/field-mentor-idle.png', import.meta.url).href
};

const FIELD_MAP = [
  'wwwwwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwwwwww',
  'wwwwwwsssssswwwwww',
  'wwwwwssggggggsswww',
  'wwwwssggggggggssww',
  'wwwssgggpppgggssww',
  'wwssggggpppggggssw',
  'wwssggggpppgggggss',
  'wwwssggggppggggssw',
  'wwwwssggggggggssww',
  'wwwwwssggggggsswww',
  'wwwwwwwsssssswwwww'
];
const FIELD_COLUMNS = FIELD_MAP[0].length;
const FIELD_ROWS = FIELD_MAP.length;
const FIELD_MOVE_DURATION = 185;
const BLOCKED_TILES = new Set(['w', 'r']);
const MENTOR_POSITION = { x: 12, y: 6 };
const FIELD_PROPS = [
  { type: 'beacon', x: 6, y: 8, label: 'Chronicle arrival beacon', scale: 1.08 },
  { type: 'tent', x: 9, y: 5, label: 'Chronicle field tent', block: true, scale: 1.30 },
  { type: 'crate', x: 10, y: 7, label: 'Field supplies', block: true, scale: .84 },
  { type: 'lantern', x: 7, y: 6, label: 'Field lantern', scale: .76 },
  { type: 'palm', x: 6, y: 4, label: 'Coastal palm', block: true, scale: 1.16 },
  { type: 'palm', x: 14, y: 5, label: 'Coastal palm', block: true, scale: 1.12 },
  { type: 'palm', x: 5, y: 8, label: 'Coastal palm', block: true, scale: 1.06 },
  { type: 'palm', x: 13, y: 9, label: 'Coastal palm', block: true, scale: 1.08 },
  { type: 'rowboat', x: 5, y: 10, label: 'Shore boat', block: true, scale: 1.14 },
  { type: 'rocks', x: 14, y: 7, label: 'Shore rocks', block: true, scale: 1.08 }
];

let activeKeyCleanup = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function spriteFor(appearance) {
  return appearance === 'b' ? spriteB : spriteA;
}

function displayName(profile) {
  return profile.name || 'Unregistered';
}

function wordCountHint(value, limit) {
  return value.length > limit ? `Longer than the recommended ${limit} characters. Preview it on a Chromebook.` : '';
}

function contentFields(content) {
  const paths = [
    ['identity.eyebrow', 'Identity eyebrow'],
    ['identity.title', 'Identity title'],
    ['identity.subtitle', 'Identity introduction'],
    ['identity.nameLabel', 'Name prompt'],
    ['identity.namePlaceholder', 'Name placeholder'],
    ['identity.nameHelp', 'Name help'],
    ['identity.appearanceLabel', 'Appearance label'],
    ['identity.appearanceHelp', 'Appearance help'],
    ['identity.back', 'Back button'],
    ['identity.confirm', 'Confirm button'],
    ['registration.eyebrow', 'Registration eyebrow'],
    ['registration.title', 'Registration title'],
    ['registration.subtitle', 'Registration subtitle'],
    ['registration.profileLabel', 'Profile label'],
    ['registration.assignmentLabel', 'Assignment label'],
    ['registration.assignment', 'Assignment title'],
    ['registration.codexLabel', 'Codex label'],
    ['registration.codexBody', 'Codex description'],
    ['registration.back', 'Registration back button'],
    ['registration.enter', 'Enter field button'],
    ['field.eyebrow', 'Field eyebrow'],
    ['field.title', 'Field title'],
    ['field.subtitle', 'Field subtitle'],
    ['field.body', 'Field instructions'],
    ['field.objective', 'Field objective'],
    ['field.mentorName', 'Mentor name'],
    ['field.mentorRole', 'Mentor role'],
    ['field.mentorDialogue', 'Mentor dialogue'],
    ['field.interaction', 'Interaction button'],
    ['field.continue', 'Field completion button'],
    ['field.return', 'Return button']
  ];
  return paths.map(([path, label]) => {
    const value = path.split('.').reduce((node, part) => node?.[part], content) ?? '';
    return { path, label, value: String(value) };
  });
}

function authorPanel(content) {
  return `
    <aside class="ci-id-author" aria-label="Author Mode for Chronicle identity">
      <div class="ci-id-author__header">
        <div>
          <p>Development only</p>
          <h2>Author Mode</h2>
          <span>Edit student-facing copy. Identity choices, layout, movement, and game rules remain protected.</span>
        </div>
        <button type="button" class="ci-id-icon-button" data-author-action="close" aria-label="Close author panel">×</button>
      </div>
      <div class="ci-id-author__notice"><strong>Autosave is on.</strong> Draft copy is stored in this browser after you pause typing.</div>
      <form class="ci-id-author__form" id="ciIdentityAuthorForm">
        ${contentFields(content).map(({ path, label, value }) => {
          const warning = wordCountHint(value, path.includes('Dialogue') ? 280 : path.includes('subtitle') ? 130 : 120);
          return `<label>
            <span>${escapeHtml(label)}</span>
            <textarea rows="${value.length > 72 ? 4 : 2}" data-identity-content="${path}">${escapeHtml(value)}</textarea>
            <small data-identity-warning="${path}" class="${warning ? 'is-visible' : ''}">${escapeHtml(warning)}</small>
          </label>`;
        }).join('')}
      </form>
      <div class="ci-id-author__actions">
        <button type="button" class="ci-id-author-button ci-id-author-button--gold" data-author-action="save">Save now</button>
        <button type="button" class="ci-id-author-button" data-author-action="export">Export JSON</button>
        <label class="ci-id-author-button">Import JSON<input id="ciIdentityImport" type="file" accept="application/json,.json" hidden></label>
        <button type="button" class="ci-id-author-button ci-id-author-button--danger" data-author-action="reset">Reset defaults</button>
      </div>
      <p class="ci-id-author__status" id="ciIdentityAuthorStatus">Draft edits remain in this browser until you export them.</p>
    </aside>`;
}

function chrome(content, authorOn) {
  return `
    <header class="ci-id-topbar">
      <div class="ci-id-brand"><span class="ci-id-brand__mark">✦</span><div><p>${escapeHtml(content.topbar.eyebrow)}</p><strong>${escapeHtml(content.topbar.title)}</strong></div></div>
      <div class="ci-id-topbar__controls"><span class="ci-id-status"><i></i>${escapeHtml(content.topbar.status)}</span><button class="ci-author-toggle ${authorOn ? 'is-active' : ''}" type="button" data-author-action="toggle">✦ ${authorOn ? 'Author Mode On' : 'Author Mode'}</button></div>
    </header>`;
}

function createIdentityScreen(content, profile, message) {
  const isA = profile.appearance !== 'b';
  return `
    <main class="ci-id-stage ci-id-stage--identity">
      <section class="ci-id-copy">
        <p class="ci-eyebrow">${escapeHtml(content.identity.eyebrow)}</p>
        <h1>${escapeHtml(content.identity.title)}</h1>
        <p class="ci-subtitle">${escapeHtml(content.identity.subtitle)}</p>
        <div class="ci-id-editor-card">
          <div class="ci-id-choice-heading"><span>01</span><div><h2>${escapeHtml(content.identity.appearanceLabel)}</h2><p>${escapeHtml(content.identity.appearanceHelp)}</p></div></div>
          <div class="ci-id-appearance-grid" role="radiogroup" aria-label="Choose your appearance">
            <button class="ci-id-appearance ${isA ? 'is-selected' : ''}" type="button" data-appearance="a" role="radio" aria-checked="${isA}"><img src="${spriteA}" alt="" /><span>Appearance one</span></button>
            <button class="ci-id-appearance ${!isA ? 'is-selected' : ''}" type="button" data-appearance="b" role="radio" aria-checked="${!isA}"><img src="${spriteB}" alt="" /><span>Appearance two</span></button>
          </div>
          <label class="ci-id-name-field"><span>02 · ${escapeHtml(content.identity.nameLabel)}</span><input id="ciPlayerName" maxlength="14" value="${escapeHtml(profile.name)}" placeholder="${escapeHtml(content.identity.namePlaceholder)}" autocomplete="nickname" /><small>${escapeHtml(content.identity.nameHelp)}</small></label>
          ${message ? `<p class="ci-id-message" role="alert">${escapeHtml(message)}</p>` : ''}
          <p class="ci-id-local-note">${escapeHtml(content.identity.selectionHint)}</p>
        </div>
        <div class="ci-actions"><button type="button" class="ci-button ci-button--secondary" data-identity-action="back">${escapeHtml(content.identity.back)}</button><button type="button" class="ci-button ci-button--primary" data-identity-action="confirm">${escapeHtml(content.identity.confirm)} <span aria-hidden="true">→</span></button></div>
      </section>
      <aside class="ci-id-registry" aria-label="Chronicle Archive preview">
        <div class="ci-id-registry__clip"></div>
        <p class="ci-id-registry__kicker">Chronicle Archive</p>
        <h2>Field identity draft</h2>
        <div class="ci-id-registry__portrait"><img src="${spriteFor(profile.appearance)}" alt="Selected Chronicler appearance" /></div>
        <div class="ci-id-registry__line"><span>Chronicler</span><strong>${escapeHtml(displayName(profile))}</strong></div>
        <div class="ci-id-registry__line"><span>Assignment</span><strong>${escapeHtml(content.registration.assignment)}</strong></div>
        <div class="ci-id-registry__seal">Archive record pending</div>
      </aside>
    </main>`;
}

function createRegistrationScreen(content, profile) {
  return `
    <main class="ci-id-stage ci-id-stage--registration">
      <section class="ci-id-copy"><p class="ci-eyebrow">${escapeHtml(content.registration.eyebrow)}</p><h1>${escapeHtml(content.registration.title)}</h1><p class="ci-subtitle">${escapeHtml(content.registration.subtitle)}</p>
      <div class="ci-id-codex-card"><img src="${codexSprite}" alt="Pixel-art Chronicle Codex" /><div><p>${escapeHtml(content.registration.codexLabel)}</p><h2>Issued to ${escapeHtml(displayName(profile))}</h2><span>${escapeHtml(content.registration.codexBody)}</span></div></div>
      <div class="ci-actions"><button type="button" class="ci-button ci-button--secondary" data-registration-action="back">${escapeHtml(content.registration.back)}</button><button type="button" class="ci-button ci-button--primary" data-registration-action="enter">${escapeHtml(content.registration.enter)} <span aria-hidden="true">→</span></button></div></section>
      <aside class="ci-id-registry ci-id-registry--registered"><div class="ci-id-registry__clip"></div><p class="ci-id-registry__kicker">Chronicle Archive</p><h2>Name registered</h2><div class="ci-id-registry__portrait"><img src="${spriteFor(profile.appearance)}" alt="Registered Chronicler appearance" /></div><div class="ci-id-registry__line"><span>${escapeHtml(content.registration.profileLabel)}</span><strong>${escapeHtml(displayName(profile))}</strong></div><div class="ci-id-registry__line"><span>${escapeHtml(content.registration.assignmentLabel)}</span><strong>${escapeHtml(content.registration.assignment)}</strong></div><div class="ci-id-registry__seal">Codex link verified</div></aside>
    </main>`;
}

function tileClass(tile) {
  return { w: 'water', s: 'sand', g: 'grass', p: 'path', r: 'ruin' }[tile] ?? 'grass';
}

function positionStyle({ x, y }) {
  return `left:${(((x + .5) / FIELD_COLUMNS) * 100).toFixed(4)}%;top:${(((y + .5) / FIELD_ROWS) * 100).toFixed(4)}%;`;
}

function fieldSpriteFor(appearance, facing, frame) {
  const direction = facing === 'left' || facing === 'right' ? 'side' : facing;
  return FIELD_ASSETS[appearance === 'b' ? 'b' : 'a'][direction][frame ? 'step' : 'idle'];
}

function fieldTileMarkup() {
  return FIELD_MAP.flatMap((row, y) => row.split('').map((tile, x) => {
    const neighbours = [FIELD_MAP[y - 1]?.[x], FIELD_MAP[y + 1]?.[x], FIELD_MAP[y]?.[x - 1], FIELD_MAP[y]?.[x + 1]];
    const shore = tile === 'w' && neighbours.some((item) => item && item !== 'w');
    const pathEdge = tile === 'p' && neighbours.some((item) => item === 'g');
    const variation = (x * 7 + y * 11) % 4;
    return `<span class="ci-field-tile ci-field-tile--${tileClass(tile)} ${shore ? 'is-shore' : ''} ${pathEdge ? 'is-path-edge' : ''}" data-variation="${variation}" style="grid-column:${x + 1};grid-row:${y + 1}" aria-hidden="true"></span>`;
  })).join('');
}

function fieldPropsMarkup() {
  return FIELD_PROPS.map((prop) => `<img class="ci-field-prop ci-field-prop--${prop.type}" style="${positionStyle(prop)}--prop-scale:${prop.scale ?? 1};" src="${FIELD_PROP_ASSETS[prop.type]}" alt="" aria-hidden="true" />`).join('');
}

function isBlocked(x, y) {
  if (x < 0 || y < 0 || x >= FIELD_COLUMNS || y >= FIELD_ROWS) return true;
  if (BLOCKED_TILES.has(FIELD_MAP[y][x])) return true;
  if (x === MENTOR_POSITION.x && y === MENTOR_POSITION.y) return true;
  return FIELD_PROPS.some((prop) => prop.block && prop.x === x && prop.y === y);
}

function nearMentor(position) {
  return Math.abs(position.x - MENTOR_POSITION.x) + Math.abs(position.y - MENTOR_POSITION.y) <= 1;
}

function createFieldScreen(content, profile, state) {
  const canTalk = nearMentor(state.position);
  const objective = state.completeNotice ? 'Field entry complete. Case briefing will be added in the next milestone.' : content.field.objective;
  const prompt = state.spoke
    ? content.field.mentorDialogue
    : canTalk
      ? 'You are close enough to open a secure field channel.'
      : 'Move closer to the field mentor to establish contact.';
  return `
    <main class="ci-field-shell ci-field-shell--polished">
      <section class="ci-field-header"><div><p class="ci-eyebrow">${escapeHtml(content.field.eyebrow)}</p><h1>${escapeHtml(content.field.title)}</h1><p class="ci-subtitle">${escapeHtml(content.field.subtitle)}</p><p class="ci-body">${escapeHtml(content.field.body)}</p></div><div class="ci-field-objective"><span>Current objective</span><strong id="ciFieldObjective">${escapeHtml(objective)}</strong></div></section>
      <section class="ci-field-layout"><div class="ci-field-map ci-field-map--polished" id="ciFieldMap" style="--field-columns:${FIELD_COLUMNS};--field-rows:${FIELD_ROWS};" aria-label="Top-down Caribbean arrival field. Use arrow keys or WASD to move.">${fieldTileMarkup()}<div class="ci-field-atmosphere ci-field-atmosphere--one" aria-hidden="true"></div><div class="ci-field-atmosphere ci-field-atmosphere--two" aria-hidden="true"></div>${fieldPropsMarkup()}<div class="ci-field-player" id="ciFieldPlayer" data-facing="${state.facing}" style="${positionStyle(state.position)}"><span class="ci-field-player__shadow" aria-hidden="true"></span><img id="ciFieldPlayerSprite" src="${fieldSpriteFor(profile.appearance, state.facing, state.step)}" alt="${escapeHtml(displayName(profile))}, the Chronicler" /></div><div class="ci-field-mentor" style="${positionStyle(MENTOR_POSITION)}"><span class="ci-field-mentor__shadow" aria-hidden="true"></span><img src="${FIELD_PROP_ASSETS.mentor}" alt="${escapeHtml(content.field.mentorName)}, field mentor" /></div><div class="ci-field-mentor__signal" aria-hidden="true" style="${positionStyle(MENTOR_POSITION)}">!</div></div>
      <aside class="ci-field-dialogue"><p class="ci-id-registry__kicker">Field channel</p><h2>${escapeHtml(content.field.mentorName)}</h2><span>${escapeHtml(content.field.mentorRole)}</span><p id="ciFieldContactText">${escapeHtml(prompt)}</p><button class="ci-button ci-button--primary ${canTalk ? '' : 'is-disabled'}" id="ciFieldTalkButton" type="button" data-field-action="talk" ${canTalk ? '' : 'disabled'}>${escapeHtml(content.field.interaction)} <span aria-hidden="true">→</span></button>${state.spoke ? `<button class="ci-button ci-button--secondary ci-field-complete ${state.completeNotice ? 'is-disabled' : ''}" type="button" data-field-action="complete" ${state.completeNotice ? 'disabled' : ''}>${escapeHtml(state.completeNotice ? 'Field entry complete' : content.field.continue)}</button>` : ''}<button class="ci-field-return" type="button" data-field-action="return">${escapeHtml(content.field.return)}</button><small>Movement: Arrow keys or WASD · Smooth field movement active</small></aside></section>
    </main>`;
}

function renderShell(content, authorOn, body) {
  return `<div class="ci-shell ci-id-shell ${authorOn ? 'ci-shell--authoring' : ''}"><div class="ci-noise" aria-hidden="true"></div><div class="ci-orbit ci-orbit--one" aria-hidden="true"></div><div class="ci-orbit ci-orbit--two" aria-hidden="true"></div>${chrome(content, authorOn)}${body}${authorOn ? authorPanel(content) : ''}</div>`;
}

export function mountChronicleIdentity(app, { onReturn } = {}) {
  activeKeyCleanup?.();
  let screen = 'identity';
  let profile = readPlayerProfile();
  let content = readLocalContent(CONTENT_KEY, CHRONICLE_IDENTITY_DEFAULTS);
  let authorOn = false;
  let message = '';
  let fieldState = { position: { x: 8, y: 9 }, spoke: false, completeNotice: false, facing: 'up', step: false, moving: false, queuedMove: null };
  let autosaveTimer;

  const setAuthorStatus = (text) => { const status = app.querySelector('#ciIdentityAuthorStatus'); if (status) status.textContent = text; };
  const saveContent = (text = 'Saved locally in this browser.') => { window.clearTimeout(autosaveTimer); writeLocalContent(CONTENT_KEY, content); setAuthorStatus(text); };
  const scheduleContentSave = () => { window.clearTimeout(autosaveTimer); setAuthorStatus('Saving draft locally…'); autosaveTimer = window.setTimeout(() => saveContent('Saved locally. Export JSON when you want a portable backup.'), AUTOSAVE_DELAY); };

  const fieldDirection = (dx, dy) => (dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down');

  const updateFieldPosition = () => {
    const player = app.querySelector('#ciFieldPlayer');
    const sprite = app.querySelector('#ciFieldPlayerSprite');
    if (!player || !sprite) return;
    player.style.cssText = positionStyle(fieldState.position);
    player.dataset.facing = fieldState.facing;
    player.classList.toggle('is-walking', fieldState.moving);
    sprite.src = fieldSpriteFor(profile.appearance, fieldState.facing, fieldState.moving ? fieldState.step : false);
    const isNear = nearMentor(fieldState.position);
    const contact = app.querySelector('#ciFieldContactText');
    const talk = app.querySelector('#ciFieldTalkButton');
    if (contact && !fieldState.spoke) contact.textContent = isNear ? 'You are close enough to open a secure field channel.' : 'Move closer to the field mentor to establish contact.';
    if (talk) {
      talk.disabled = !isNear;
      talk.classList.toggle('is-disabled', !isNear);
    }
  };

  const movePlayer = (dx, dy) => {
    if (screen !== 'field') return;
    if (fieldState.moving) {
      fieldState.queuedMove = [dx, dy];
      return;
    }
    const next = { x: fieldState.position.x + dx, y: fieldState.position.y + dy };
    if (isBlocked(next.x, next.y)) return;
    fieldState.facing = fieldDirection(dx, dy);
    fieldState.position = next;
    fieldState.step = !fieldState.step;
    fieldState.moving = true;
    updateFieldPosition();
    window.setTimeout(() => {
      fieldState.moving = false;
      updateFieldPosition();
      const queued = fieldState.queuedMove;
      fieldState.queuedMove = null;
      if (queued) movePlayer(...queued);
    }, FIELD_MOVE_DURATION);
  };

  const keydown = (event) => {
    const movement = { ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0] };
    const vector = movement[event.key];
    if (!vector || screen !== 'field') return;
    event.preventDefault();
    movePlayer(...vector);
  };
  window.addEventListener('keydown', keydown);
  activeKeyCleanup = () => window.removeEventListener('keydown', keydown);

  const render = () => {
    const stage = screen === 'identity' ? createIdentityScreen(content, profile, message) : screen === 'registration' ? createRegistrationScreen(content, profile) : createFieldScreen(content, profile, fieldState);
    app.innerHTML = renderShell(content, authorOn, stage);

    app.querySelectorAll('[data-appearance]').forEach((button) => button.addEventListener('click', () => { profile = writePlayerProfile({ ...profile, appearance: button.dataset.appearance }); message = ''; render(); }));
    app.querySelector('#ciPlayerName')?.addEventListener('input', (event) => { profile = writePlayerProfile({ ...profile, name: event.currentTarget.value }); });
    app.querySelector('[data-identity-action="back"]')?.addEventListener('click', () => { activeKeyCleanup?.(); onReturn?.(); });
    app.querySelector('[data-identity-action="confirm"]')?.addEventListener('click', () => { const name = readPlayerProfile().name; if (!name) { message = 'Enter the name the Archive should use before confirming your identity.'; render(); return; } profile = writePlayerProfile({ ...profile, name }); screen = 'registration'; message = ''; render(); });
    app.querySelector('[data-registration-action="back"]')?.addEventListener('click', () => { screen = 'identity'; render(); });
    app.querySelector('[data-registration-action="enter"]')?.addEventListener('click', () => { profile = writePlayerProfile({ ...profile, codexIssued: true, fieldArrivalSeen: true }); screen = 'field'; render(); });
    app.querySelector('[data-field-action="talk"]')?.addEventListener('click', () => { fieldState.spoke = true; render(); });
    app.querySelector('[data-field-action="complete"]')?.addEventListener('click', () => { fieldState.completeNotice = true; render(); });
    app.querySelector('[data-field-action="return"]')?.addEventListener('click', () => { screen = 'identity'; render(); });

    app.querySelector('[data-author-action="toggle"]')?.addEventListener('click', () => { authorOn = !authorOn; render(); });
    app.querySelector('[data-author-action="close"]')?.addEventListener('click', () => { authorOn = false; render(); });
    app.querySelectorAll('[data-identity-content]').forEach((input) => input.addEventListener('input', (event) => { const path = event.currentTarget.dataset.identityContent; setAtPath(content, path, event.currentTarget.value); const warning = wordCountHint(event.currentTarget.value, path.includes('Dialogue') ? 280 : path.includes('subtitle') ? 130 : 120); const warningNode = app.querySelector(`[data-identity-warning="${CSS.escape(path)}"]`); if (warningNode) { warningNode.textContent = warning; warningNode.classList.toggle('is-visible', Boolean(warning)); } scheduleContentSave(); }));
    app.querySelector('[data-author-action="save"]')?.addEventListener('click', () => saveContent('Saved locally.'));
    app.querySelector('[data-author-action="export"]')?.addEventListener('click', () => { saveContent('Draft saved locally and exported.'); downloadContent('chronicle-identity-draft.json', content); });
    app.querySelector('#ciIdentityImport')?.addEventListener('change', async (event) => { const [file] = event.target.files; if (!file) return; try { content = await readImportedContent(file, CHRONICLE_IDENTITY_DEFAULTS); saveContent('Imported draft saved locally.'); render(); } catch { setAuthorStatus('Import failed. Choose a Chronicle identity JSON export.'); } });
    app.querySelector('[data-author-action="reset"]')?.addEventListener('click', () => { if (!window.confirm('Discard this browser’s identity draft and restore repository defaults?')) return; clearLocalContent(CONTENT_KEY); content = clone(CHRONICLE_IDENTITY_DEFAULTS); render(); });
  };

  render();
}
