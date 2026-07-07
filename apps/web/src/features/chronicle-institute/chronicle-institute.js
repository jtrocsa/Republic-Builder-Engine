import { CHRONICLE_OPENING_DEFAULTS } from '../../content/chronicle-opening.defaults.js';
import { mountChronicleIdentity } from '../chronicle-identity/chronicle-identity.js';
import {
  clearLocalContent,
  clone,
  downloadContent,
  getAtPath,
  readImportedContent,
  readLocalContent,
  setAtPath,
  writeLocalContent
} from '../../engine/content/author-content-store.js';

const STORAGE_KEY = 'republic-builder.chronicle.opening.author-content.v1';
const AUTOSAVE_DELAY = 650;
const SCENES = ['welcome', 'briefing', 'oath', 'character'];

const sealMarkup = `
  <svg class="ci-seal" viewBox="0 0 120 120" aria-hidden="true">
    <defs>
      <linearGradient id="sealGold" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#f7dfa0" />
        <stop offset="52%" stop-color="#c89238" />
        <stop offset="100%" stop-color="#8f5c19" />
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="53" fill="#071d32" stroke="url(#sealGold)" stroke-width="4" />
    <circle cx="60" cy="60" r="42" fill="none" stroke="#d8ae59" stroke-opacity=".55" stroke-width="1.5" stroke-dasharray="2 4" />
    <path d="M35 71c9-4 16-4 25 0 9-4 16-4 25 0V46c-9-4-16-4-25 0-9-4-16-4-25 0z" fill="none" stroke="#f2d58f" stroke-width="3" stroke-linejoin="round" />
    <path d="M60 30v18M51 39h18" stroke="#f2d58f" stroke-width="3" stroke-linecap="round" />
    <path d="M30 86h60" stroke="#d8ae59" stroke-width="2" stroke-linecap="round" />
  </svg>
`;

const directorPortraitMarkup = `
  <svg class="ci-director-portrait-svg" viewBox="0 0 300 360" role="img" aria-label="Stylized portrait of the Chronicle Institute Director">
    <defs>
      <linearGradient id="directorBg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#1d526a" />
        <stop offset="1" stop-color="#071927" />
      </linearGradient>
      <linearGradient id="directorCoat" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#d0a95a" />
        <stop offset=".28" stop-color="#31536a" />
        <stop offset="1" stop-color="#0a1c2d" />
      </linearGradient>
      <radialGradient id="directorHalo" cx="50%" cy="38%" r="52%">
        <stop offset="0" stop-color="#ffdaa0" stop-opacity=".46" />
        <stop offset="1" stop-color="#ffdaa0" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="300" height="360" rx="26" fill="url(#directorBg)" />
    <circle cx="150" cy="133" r="103" fill="url(#directorHalo)" />
    <g opacity=".7" stroke="#e7bd69" stroke-width="1" fill="none">
      <path d="M24 74h252M24 286h252" />
      <path d="M54 38v284M246 38v284" stroke-dasharray="4 7" />
      <path d="M31 126c56-32 181-32 238 0M31 213c56 32 181 32 238 0" opacity=".52" />
    </g>
    <path d="M89 302c10-70 29-99 61-99s51 29 61 99" fill="url(#directorCoat)" stroke="#e5bd6a" stroke-opacity=".6" stroke-width="2" />
    <path d="M119 216l31 53 31-53" fill="#0d2031" stroke="#ddba69" stroke-width="2" />
    <path d="M128 221l22 42 22-42" fill="#f0d895" opacity=".78" />
    <ellipse cx="150" cy="153" rx="48" ry="61" fill="#b87d58" />
    <path d="M104 150c-3-55 21-82 51-82 34 0 54 28 47 83-15-17-31-25-51-25-19 0-33 8-47 24z" fill="#3c302e" />
    <path d="M113 111c12-32 32-49 59-40 18 6 29 23 29 49-21-13-53-17-88-9z" fill="#4f3b34" />
    <path d="M120 153c8-6 18-7 26-1M154 152c8-6 18-5 26 1" fill="none" stroke="#2f2726" stroke-width="3" stroke-linecap="round" />
    <circle cx="135" cy="156" r="2.7" fill="#e7ddb6" /><circle cx="167" cy="156" r="2.7" fill="#e7ddb6" />
    <path d="M150 158l-4 17 7 1" fill="none" stroke="#754a3b" stroke-width="2" stroke-linecap="round" />
    <path d="M133 190c10 8 24 8 35 0" fill="none" stroke="#6d4038" stroke-width="2.5" stroke-linecap="round" />
    <path d="M120 219c13 13 46 13 60 0" fill="none" stroke="#dbb565" stroke-width="3" />
    <path d="M56 320h188" stroke="#e8c26d" stroke-width="2" opacity=".75" />
    <text x="150" y="340" fill="#ead39a" font-size="12" text-anchor="middle" font-family="Georgia, serif" letter-spacing="3">CHRONICLE INSTITUTE</text>
  </svg>
`;

const sectionLabels = {
  current: 'This screen',
  shared: 'Shared chrome',
  archive: 'Archive signal',
  briefing: 'Director briefing',
  protocol: 'Field protocol',
  assignment: 'First assignment'
};

const readableLabels = {
  'brand.engineName': 'Engine label',
  'brand.productName': 'Product name',
  'status.text': 'Status text',
  'footer.left': 'Footer, left',
  'footer.right': 'Footer, right',
  'archiveSignal.kicker': 'Signal label',
  'archiveSignal.year': 'Year',
  'archiveSignal.title': 'Heading',
  'archiveSignal.body': 'Description',
  'archiveSignal.tag': 'Case tag',
  'director.kicker': 'Director label',
  'director.title': 'Director title',
  'director.quote': 'Director quote',
  'assignment.kicker': 'Assignment label',
  'assignment.unit': 'Unit line',
  'assignment.title': 'Assignment title',
  'assignment.description': 'Assignment description'
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function textNode(tagName, className, path, value, extra = '') {
  return `<${tagName} class="${className} ci-editable" data-content-path="${path}" ${extra}>${escapeHtml(value)}</${tagName}>`;
}

function humanize(path) {
  return path
    .split('.')
    .map((piece) => piece.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase()))
    .join(' · ');
}

function fieldDefinition(path, content) {
  return { path, label: readableLabels[path] ?? humanize(path), value: String(getAtPath(content, path) ?? '') };
}

function warningFor(path, value) {
  const limits = {
    title: 62,
    subtitle: 118,
    body: 310,
    quote: 180,
    description: 220,
    action: 34,
    secondary: 34
  };
  const key = path.split('.').at(-1);
  const limit = limits[key] ?? 115;
  return value.length > limit ? `This is longer than the design target (${limit} characters). Check the Chromebook preview.` : '';
}

function scenePaths(sceneKey) {
  const base = `scenes.${sceneKey}`;
  return [`${base}.eyebrow`, `${base}.title`, `${base}.subtitle`, `${base}.body`, `${base}.action`, `${base}.secondary`];
}

function briefingPaths(content) {
  return content.directorBriefing.entries.flatMap((_, index) => [
    `directorBriefing.entries.${index}.eyebrow`,
    `directorBriefing.entries.${index}.title`,
    `directorBriefing.entries.${index}.subtitle`,
    `directorBriefing.entries.${index}.body`,
    `directorBriefing.entries.${index}.action`,
    `directorBriefing.entries.${index}.secondary`
  ]);
}

function fieldsForSection(sectionKey, currentScene, content) {
  const protocolPaths = content.protocol.flatMap((_, index) => [
    `protocol.${index}.number`,
    `protocol.${index}.title`,
    `protocol.${index}.body`
  ]);
  const assignmentPaths = [
    'assignment.kicker',
    'assignment.unit',
    'assignment.title',
    'assignment.description',
    ...content.assignment.details.map((_, index) => `assignment.details.${index}`)
  ];
  const groups = {
    shared: ['brand.engineName', 'brand.productName', 'status.text', 'footer.left', 'footer.right'],
    archive: ['archiveSignal.kicker', 'archiveSignal.year', 'archiveSignal.title', 'archiveSignal.body', 'archiveSignal.tag'],
    briefing: [...briefingPaths(content), 'director.kicker', 'director.title', 'director.quote'],
    protocol: [...scenePaths('oath'), ...protocolPaths],
    assignment: [...scenePaths('character'), ...assignmentPaths],
    current: currentScene === 'welcome'
      ? [...scenePaths('welcome'), 'archiveSignal.kicker', 'archiveSignal.year', 'archiveSignal.title', 'archiveSignal.body', 'archiveSignal.tag']
      : currentScene === 'briefing'
        ? [...briefingPaths(content), 'director.kicker', 'director.title', 'director.quote']
        : currentScene === 'oath'
          ? [...scenePaths('oath'), ...protocolPaths]
          : [...scenePaths('character'), ...assignmentPaths]
  };
  return groups[sectionKey].map((path) => fieldDefinition(path, content));
}

function getPresentation(sceneKey, content, briefingStep) {
  if (sceneKey !== 'briefing') {
    const scene = content.scenes[sceneKey];
    const base = `scenes.${sceneKey}`;
    return {
      ...scene,
      paths: {
        eyebrow: `${base}.eyebrow`, title: `${base}.title`, subtitle: `${base}.subtitle`, body: `${base}.body`, action: `${base}.action`, secondary: `${base}.secondary`
      }
    };
  }

  const entry = content.directorBriefing.entries[briefingStep];
  const base = `directorBriefing.entries.${briefingStep}`;
  return {
    ...entry,
    paths: {
      eyebrow: `${base}.eyebrow`, title: `${base}.title`, subtitle: `${base}.subtitle`, body: `${base}.body`, action: `${base}.action`, secondary: `${base}.secondary`
    }
  };
}

function createSidePanel(sceneKey, content, briefingStep) {
  if (sceneKey === 'welcome') {
    return `
      <div class="ci-archive-card ci-archive-card--open">
        ${textNode('div', 'ci-card-kicker', 'archiveSignal.kicker', content.archiveSignal.kicker)}
        <div class="ci-card-line"></div>
        ${textNode('p', 'ci-card-year', 'archiveSignal.year', content.archiveSignal.year)}
        ${textNode('h2', '', 'archiveSignal.title', content.archiveSignal.title)}
        ${textNode('p', '', 'archiveSignal.body', content.archiveSignal.body)}
        ${textNode('div', 'ci-card-tag', 'archiveSignal.tag', content.archiveSignal.tag)}
      </div>`;
  }

  if (sceneKey === 'briefing') {
    return `
      <div class="ci-director-card ci-director-card--illustrated">
        <div class="ci-director-portrait">${directorPortraitMarkup}</div>
        <div class="ci-director-card__copy">
          ${textNode('p', 'ci-card-kicker', 'director.kicker', content.director.kicker)}
          ${textNode('h2', '', 'director.title', content.director.title)}
          ${textNode('p', 'ci-director-card__quote', 'director.quote', content.director.quote)}
          <div class="ci-briefing-meter" aria-label="Director briefing progress">
            ${content.directorBriefing.entries.map((_, index) => `<span class="${index <= briefingStep ? 'is-active' : ''}" aria-hidden="true"></span>`).join('')}
          </div>
          <p class="ci-director-card__note">Secure transmission from the Archive’s field operations desk.</p>
        </div>
      </div>`;
  }

  if (sceneKey === 'oath') {
    return `
      <div class="ci-protocol-grid" aria-label="Chronicle Institute protocol">
        ${content.protocol.map((step, index) => `
          <article>
            ${textNode('span', '', `protocol.${index}.number`, step.number)}
            ${textNode('h2', '', `protocol.${index}.title`, step.title)}
            ${textNode('p', '', `protocol.${index}.body`, step.body)}
          </article>`).join('')}
      </div>`;
  }

  return `
    <div class="ci-assignment-card">
      ${textNode('p', 'ci-card-kicker', 'assignment.kicker', content.assignment.kicker)}
      ${textNode('p', 'ci-assignment-unit', 'assignment.unit', content.assignment.unit)}
      ${textNode('h2', '', 'assignment.title', content.assignment.title)}
      ${textNode('p', '', 'assignment.description', content.assignment.description)}
      <ul>${content.assignment.details.map((detail, index) => textNode('li', '', `assignment.details.${index}`, detail)).join('')}</ul>
    </div>`;
}

function createAuthorPanel(section, currentScene, content, selectedPath) {
  const fields = fieldsForSection(section, currentScene, content);
  return `
    <aside class="ci-author-panel" id="ciAuthorPanel" aria-label="Chronicle Author Mode">
      <div class="ci-author-panel__header">
        <div>
          <p class="ci-author-panel__eyebrow">Development only</p>
          <h2>Author Mode</h2>
          <p>Edit student-facing copy only. Layout, navigation, and game mechanics stay protected.</p>
        </div>
        <button class="ci-author-close" type="button" data-author-action="close" aria-label="Close Author Mode panel">×</button>
      </div>
      <div class="ci-author-tabs" role="tablist" aria-label="Author Mode sections">
        ${Object.entries(sectionLabels).map(([key, label]) => `<button class="${key === section ? 'is-active' : ''}" type="button" data-author-section="${key}">${label}</button>`).join('')}
      </div>
      <div class="ci-author-panel__notice"><strong>Autosave is on.</strong> Your writing is saved in this browser after you pause typing. Export JSON when you want a portable backup.</div>
      <form class="ci-author-form" id="ciAuthorForm">
        ${fields.map(({ path, label, value }) => {
          const warning = warningFor(path, value);
          const rows = value.length > 62 ? 4 : 2;
          return `<label class="ci-author-field ${selectedPath === path ? 'is-selected' : ''}" data-author-field="${path}">
            <span>${escapeHtml(label)}</span>
            <textarea data-content-input="${path}" rows="${rows}">${escapeHtml(value)}</textarea>
            <small class="ci-author-field__warning ${warning ? 'is-visible' : ''}" data-content-warning="${path}">${escapeHtml(warning)}</small>
          </label>`;
        }).join('')}
      </form>
      <div class="ci-author-actions">
        <button type="button" class="ci-author-button ci-author-button--primary" data-author-action="save">Save now</button>
        <button type="button" class="ci-author-button" data-author-action="export">Export JSON</button>
        <label class="ci-author-button ci-author-button--file">Import JSON<input type="file" id="ciAuthorImport" accept="application/json,.json" hidden></label>
        <button type="button" class="ci-author-button ci-author-button--danger" data-author-action="reset">Reset to defaults</button>
      </div>
      <p class="ci-author-panel__footnote" id="ciAuthorStatus">Draft edits remain in this browser until you export them.</p>
    </aside>`;
}

function createMarkup(sceneKey, content, authorMode, authorPanelOpen, authorSection, selectedPath, briefingStep) {
  const presentation = getPresentation(sceneKey, content, briefingStep);
  const progress = sceneKey === 'welcome' ? '0 / 3' : sceneKey === 'briefing' ? `1 / 3 · Director message ${briefingStep + 1} / ${content.directorBriefing.entries.length}` : sceneKey === 'oath' ? '2 / 3' : '3 / 3';
  return `
    <div class="ci-shell ${authorMode ? 'ci-shell--authoring' : ''}" data-scene="${sceneKey}">
      <div class="ci-noise" aria-hidden="true"></div><div class="ci-orbit ci-orbit--one" aria-hidden="true"></div><div class="ci-orbit ci-orbit--two" aria-hidden="true"></div>
      <header class="ci-topbar">
        <div class="ci-brand" aria-label="Republic Builder Engine: Chronicle">${sealMarkup}<div>${textNode('span', '', 'brand.engineName', content.brand.engineName)}${textNode('strong', '', 'brand.productName', content.brand.productName)}</div></div>
        <div class="ci-topbar-controls">
          <div class="ci-topbar-status"><span class="ci-status-dot" aria-hidden="true"></span>${textNode('span', '', 'status.text', content.status.text)}</div>
          <button class="ci-author-toggle ${authorMode ? 'is-active' : ''}" type="button" data-author-action="toggle" aria-pressed="${authorMode}"><span aria-hidden="true">✦</span> ${authorMode ? 'Author Mode On' : 'Author Mode'}</button>
        </div>
      </header>
      <main class="ci-stage">
        <section class="ci-copy" aria-live="polite">
          ${textNode('p', 'ci-eyebrow', presentation.paths.eyebrow, presentation.eyebrow)}
          ${textNode('h1', '', presentation.paths.title, presentation.title)}
          ${textNode('p', 'ci-subtitle', presentation.paths.subtitle, presentation.subtitle)}
          ${textNode('p', 'ci-body', presentation.paths.body, presentation.body)}
          <div class="ci-actions">
            <button class="ci-button ci-button--primary ci-editable" type="button" data-action="primary" data-content-path="${presentation.paths.action}">${escapeHtml(presentation.action)}<span aria-hidden="true">→</span></button>
            <button class="ci-button ci-button--secondary ci-editable" type="button" data-action="secondary" data-content-path="${presentation.paths.secondary}">${escapeHtml(presentation.secondary)}</button>
          </div>
          <p class="ci-progress">Orientation ${progress}</p>
        </section>
        <aside class="ci-side-panel"> <div class="ci-map-table" aria-hidden="true"><span class="ci-map-continental ci-map-continental--north"></span><span class="ci-map-continental ci-map-continental--south"></span><span class="ci-map-route ci-map-route--one"></span><span class="ci-map-route ci-map-route--two"></span><span class="ci-map-pin ci-map-pin--one"></span><span class="ci-map-pin ci-map-pin--two"></span><span class="ci-map-ring"></span></div>${createSidePanel(sceneKey, content, briefingStep)}</aside>
      </main>
      <footer class="ci-footer">${textNode('span', '', 'footer.left', content.footer.left)}${textNode('span', '', 'footer.right', content.footer.right)}</footer>
      ${authorMode && authorPanelOpen ? createAuthorPanel(authorSection, sceneKey, content, selectedPath) : ''}
    </div>`;
}

function sectionForPath(path) {
  if (path.startsWith('archiveSignal')) return 'archive';
  if (path.startsWith('brand') || path.startsWith('status') || path.startsWith('footer')) return 'shared';
  if (path.startsWith('director') || path.startsWith('scenes.briefing')) return 'briefing';
  if (path.startsWith('protocol') || path.startsWith('scenes.oath')) return 'protocol';
  if (path.startsWith('assignment') || path.startsWith('scenes.character')) return 'assignment';
  return 'current';
}

export function mountChronicleInstitute(app, { initialScene = 'welcome' } = {}) {
  let currentScene = initialScene;
  let briefingStep = 0;
  let content = readLocalContent(STORAGE_KEY, CHRONICLE_OPENING_DEFAULTS);
  let authorMode = false;
  let authorPanelOpen = true;
  let authorSection = 'current';
  let selectedPath = '';
  let autosaveTimer;

  const setAuthorStatus = (message) => {
    const status = app.querySelector('#ciAuthorStatus');
    if (status) status.textContent = message;
  };

  const saveDraft = (message = 'Saved locally in this browser.') => {
    window.clearTimeout(autosaveTimer);
    writeLocalContent(STORAGE_KEY, content);
    setAuthorStatus(message);
  };

  const scheduleAutoSave = () => {
    window.clearTimeout(autosaveTimer);
    setAuthorStatus('Saving draft locally…');
    autosaveTimer = window.setTimeout(() => saveDraft('Saved locally. Export JSON when you want a portable backup.'), AUTOSAVE_DELAY);
  };

  const render = () => {
    app.innerHTML = createMarkup(currentScene, content, authorMode, authorPanelOpen, authorSection, selectedPath, briefingStep);

    app.querySelector('[data-action="primary"]')?.addEventListener('click', () => {
      const presentation = getPresentation(currentScene, content, briefingStep);
      if (authorMode) return focusAuthorField(presentation.paths.action);
      if (currentScene === 'briefing' && briefingStep < content.directorBriefing.entries.length - 1) {
        briefingStep += 1;
      } else if (currentScene === 'briefing') {
        currentScene = 'oath';
        authorSection = 'current';
      } else if (currentScene === 'oath') {
        mountChronicleIdentity(app, {
          onReturn: () => mountChronicleInstitute(app, { initialScene: 'oath' })
        });
        return;
      } else {
        currentScene = SCENES[Math.min(SCENES.indexOf(currentScene) + 1, SCENES.length - 1)];
        authorSection = 'current';
      }
      selectedPath = '';
      render();
    });

    app.querySelector('[data-action="secondary"]')?.addEventListener('click', () => {
      const presentation = getPresentation(currentScene, content, briefingStep);
      if (authorMode) return focusAuthorField(presentation.paths.secondary);
      if (currentScene === 'welcome') {
        currentScene = 'briefing';
        briefingStep = 0;
      } else if (currentScene === 'briefing' && briefingStep > 0) {
        briefingStep -= 1;
      } else if (currentScene === 'briefing') {
        currentScene = 'welcome';
      } else if (currentScene === 'oath') {
        currentScene = 'briefing';
        briefingStep = content.directorBriefing.entries.length - 1;
      } else {
        currentScene = 'oath';
      }
      selectedPath = '';
      render();
    });

    app.querySelector('[data-author-action="toggle"]')?.addEventListener('click', () => {
      authorMode = !authorMode;
      authorPanelOpen = authorMode;
      selectedPath = '';
      render();
    });
    app.querySelector('[data-author-action="close"]')?.addEventListener('click', () => { authorPanelOpen = false; render(); });

    app.querySelectorAll('[data-author-section]').forEach((button) => button.addEventListener('click', () => {
      authorSection = button.dataset.authorSection;
      selectedPath = '';
      render();
    }));

    app.querySelectorAll('[data-content-input]').forEach((input) => input.addEventListener('input', (event) => {
      const path = event.currentTarget.dataset.contentInput;
      setAtPath(content, path, event.currentTarget.value);
      const warning = warningFor(path, event.currentTarget.value);
      app.querySelectorAll(`[data-content-warning="${CSS.escape(path)}"]`).forEach((element) => {
        element.textContent = warning;
        element.classList.toggle('is-visible', Boolean(warning));
      });
      app.querySelectorAll(`[data-content-path="${CSS.escape(path)}"]`).forEach((element) => {
        if (element.matches('button')) {
          const arrow = element.querySelector('[aria-hidden="true"]');
          element.childNodes[0].nodeValue = event.currentTarget.value;
          if (!arrow) element.textContent = event.currentTarget.value;
        } else {
          element.textContent = event.currentTarget.value;
        }
      });
      scheduleAutoSave();
    }));

    app.querySelector('[data-author-action="save"]')?.addEventListener('click', () => saveDraft('Saved locally.'));
    app.querySelector('[data-author-action="export"]')?.addEventListener('click', () => {
      saveDraft('Draft saved locally and exported.');
      downloadContent('chronicle-opening-draft.json', content);
    });
    app.querySelector('#ciAuthorImport')?.addEventListener('change', async (event) => {
      const [file] = event.target.files;
      if (!file) return;
      try {
        content = await readImportedContent(file, CHRONICLE_OPENING_DEFAULTS);
        saveDraft('Imported draft saved locally.');
        render();
      } catch {
        setAuthorStatus('Import failed. Choose a Chronicle JSON export file.');
      }
    });
    app.querySelector('[data-author-action="reset"]')?.addEventListener('click', () => {
      if (!window.confirm('Discard this browser’s Chronicle draft and return to repository defaults?')) return;
      clearLocalContent(STORAGE_KEY);
      content = clone(CHRONICLE_OPENING_DEFAULTS);
      selectedPath = '';
      render();
    });

    if (authorMode) {
      app.querySelectorAll('.ci-editable').forEach((element) => element.addEventListener('click', (event) => {
        const path = event.currentTarget.dataset.contentPath;
        if (!path) return;
        event.preventDefault();
        event.stopPropagation();
        focusAuthorField(path);
      }));
    }
  };

  const focusAuthorField = (path) => {
    selectedPath = path;
    authorMode = true;
    authorPanelOpen = true;
    authorSection = sectionForPath(path);
    render();
    const field = app.querySelector(`[data-content-input="${CSS.escape(path)}"]`);
    field?.focus();
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  render();
}
