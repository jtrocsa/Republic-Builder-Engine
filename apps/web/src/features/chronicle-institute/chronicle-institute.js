import { CHRONICLE_OPENING_DEFAULTS } from '../../content/chronicle-opening.defaults.js';
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

function scenePaths(sceneKey) {
  const base = `scenes.${sceneKey}`;
  return [`${base}.eyebrow`, `${base}.title`, `${base}.subtitle`, `${base}.body`, `${base}.action`, `${base}.secondary`];
}

function fieldDefinition(path, content) {
  const value = getAtPath(content, path);
  return { path, label: readableLabels[path] ?? humanize(path), value: String(value ?? '') };
}

function humanize(path) {
  return path
    .split('.')
    .map((piece) => piece.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase()))
    .join(' · ');
}

function warningFor(path, value) {
  const limits = {
    title: 58,
    subtitle: 92,
    body: 260,
    quote: 160,
    description: 210,
    action: 31,
    secondary: 31
  };
  const key = path.split('.').at(-1);
  const limit = limits[key] ?? 115;
  return value.length > limit ? `This is longer than the design target (${limit} characters). Check the Chromebook preview.` : '';
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
    briefing: [...scenePaths('briefing'), 'director.kicker', 'director.title', 'director.quote'],
    protocol: [...scenePaths('oath'), ...protocolPaths],
    assignment: [...scenePaths('character'), ...assignmentPaths],
    current: currentScene === 'welcome'
      ? [...scenePaths('welcome'), 'archiveSignal.kicker', 'archiveSignal.year', 'archiveSignal.title', 'archiveSignal.body', 'archiveSignal.tag']
      : currentScene === 'briefing'
        ? [...scenePaths('briefing'), 'director.kicker', 'director.title', 'director.quote']
        : currentScene === 'oath'
          ? [...scenePaths('oath'), ...protocolPaths]
          : [...scenePaths('character'), ...assignmentPaths]
  };

  return groups[sectionKey].map((path) => fieldDefinition(path, content));
}

function createSidePanel(sceneKey, content) {
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
      <div class="ci-director-card">
        <div class="ci-director-portrait" aria-hidden="true">
          <span class="ci-portrait-glow"></span>
          <span class="ci-portrait-head"></span>
          <span class="ci-portrait-coat"></span>
        </div>
        <div>
          ${textNode('p', 'ci-card-kicker', 'director.kicker', content.director.kicker)}
          ${textNode('h2', '', 'director.title', content.director.title)}
          ${textNode('p', '', 'director.quote', content.director.quote)}
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
      <ul>
        ${content.assignment.details.map((detail, index) => textNode('li', '', `assignment.details.${index}`, detail)).join('')}
      </ul>
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
        ${Object.entries(sectionLabels).map(([key, label]) => `
          <button class="${key === section ? 'is-active' : ''}" type="button" data-author-section="${key}">${label}</button>`).join('')}
      </div>
      <div class="ci-author-panel__notice">
        <strong>Responsive by design.</strong> Text wraps and cards expand safely; use the warnings below instead of manually positioning elements.
      </div>
      <form class="ci-author-form" id="ciAuthorForm">
        ${fields.map(({ path, label, value }) => {
          const warning = warningFor(path, value);
          const rows = value.length > 62 ? 4 : 2;
          return `
            <label class="ci-author-field ${selectedPath === path ? 'is-selected' : ''}" data-author-field="${path}">
              <span>${escapeHtml(label)}</span>
              <textarea data-content-input="${path}" rows="${rows}">${escapeHtml(value)}</textarea>
              <small class="ci-author-field__warning ${warning ? 'is-visible' : ''}" data-content-warning="${path}">${escapeHtml(warning)}</small>
            </label>`;
        }).join('')}
      </form>
      <div class="ci-author-actions">
        <button type="button" class="ci-author-button ci-author-button--primary" data-author-action="save">Save locally</button>
        <button type="button" class="ci-author-button" data-author-action="export">Export JSON</button>
        <label class="ci-author-button ci-author-button--file">Import JSON<input type="file" id="ciAuthorImport" accept="application/json,.json" hidden></label>
        <button type="button" class="ci-author-button ci-author-button--danger" data-author-action="reset">Reset to defaults</button>
      </div>
      <p class="ci-author-panel__footnote" id="ciAuthorStatus">Your draft is stored only in this browser until you export it.</p>
    </aside>`;
}

function createMarkup(sceneKey, content, authorMode, authorPanelOpen, authorSection, selectedPath) {
  const scene = content.scenes[sceneKey];
  return `
    <div class="ci-shell ${authorMode ? 'ci-shell--authoring' : ''}" data-scene="${sceneKey}">
      <div class="ci-noise" aria-hidden="true"></div>
      <div class="ci-orbit ci-orbit--one" aria-hidden="true"></div>
      <div class="ci-orbit ci-orbit--two" aria-hidden="true"></div>
      <header class="ci-topbar">
        <div class="ci-brand" aria-label="Republic Builder Engine: Chronicle">
          ${sealMarkup}
          <div>
            ${textNode('span', '', 'brand.engineName', content.brand.engineName)}
            ${textNode('strong', '', 'brand.productName', content.brand.productName)}
          </div>
        </div>
        <div class="ci-topbar-controls">
          <div class="ci-topbar-status">
            <span class="ci-status-dot" aria-hidden="true"></span>
            ${textNode('span', '', 'status.text', content.status.text)}
          </div>
          <button class="ci-author-toggle ${authorMode ? 'is-active' : ''}" type="button" data-author-action="toggle" aria-pressed="${authorMode}">
            <span aria-hidden="true">✦</span> ${authorMode ? 'Author Mode On' : 'Author Mode'}
          </button>
        </div>
      </header>

      <main class="ci-stage">
        <section class="ci-copy" aria-live="polite">
          ${textNode('p', 'ci-eyebrow', `scenes.${sceneKey}.eyebrow`, scene.eyebrow)}
          ${textNode('h1', '', `scenes.${sceneKey}.title`, scene.title)}
          ${textNode('p', 'ci-subtitle', `scenes.${sceneKey}.subtitle`, scene.subtitle)}
          ${textNode('p', 'ci-body', `scenes.${sceneKey}.body`, scene.body)}
          <div class="ci-actions">
            <button class="ci-button ci-button--primary ci-editable" type="button" data-action="primary" data-content-path="scenes.${sceneKey}.action">${escapeHtml(scene.action)}<span aria-hidden="true">→</span></button>
            <button class="ci-button ci-button--secondary ci-editable" type="button" data-action="secondary" data-content-path="scenes.${sceneKey}.secondary">${escapeHtml(scene.secondary)}</button>
          </div>
          <p class="ci-progress">Orientation ${sceneKey === 'welcome' ? '0' : sceneKey === 'briefing' ? '1' : sceneKey === 'oath' ? '2' : '3'} / 3</p>
        </section>

        <aside class="ci-side-panel">
          <div class="ci-map-table" aria-hidden="true">
            <span class="ci-map-continental ci-map-continental--north"></span>
            <span class="ci-map-continental ci-map-continental--south"></span>
            <span class="ci-map-route ci-map-route--one"></span>
            <span class="ci-map-route ci-map-route--two"></span>
            <span class="ci-map-pin ci-map-pin--one"></span>
            <span class="ci-map-pin ci-map-pin--two"></span>
            <span class="ci-map-ring"></span>
          </div>
          ${createSidePanel(sceneKey, content)}
        </aside>
      </main>

      <footer class="ci-footer">
        ${textNode('span', '', 'footer.left', content.footer.left)}
        ${textNode('span', '', 'footer.right', content.footer.right)}
      </footer>
      ${authorMode && authorPanelOpen ? createAuthorPanel(authorSection, sceneKey, content, selectedPath) : ''}
    </div>`;
}

function nextScene(currentScene) {
  const order = ['welcome', 'briefing', 'oath', 'character'];
  const index = order.indexOf(currentScene);
  return order[Math.min(index + 1, order.length - 1)];
}

function previousScene(currentScene) {
  const order = ['welcome', 'briefing', 'oath', 'character'];
  const index = order.indexOf(currentScene);
  return order[Math.max(index - 1, 0)];
}

export function mountChronicleInstitute(app) {
  let currentScene = 'welcome';
  let content = readLocalContent(STORAGE_KEY, CHRONICLE_OPENING_DEFAULTS);
  let authorMode = false;
  let authorPanelOpen = true;
  let authorSection = 'current';
  let selectedPath = '';

  const updateVisibleText = (path, value) => {
    app.querySelectorAll(`[data-content-path="${CSS.escape(path)}"]`).forEach((element) => {
      if (element.matches('button')) {
        const arrow = element.querySelector('[aria-hidden="true"]');
        element.childNodes[0].nodeValue = value;
        if (!arrow) element.textContent = value;
      } else {
        element.textContent = value;
      }
    });
  };

  const updateWarning = (path, value) => {
    const warning = warningFor(path, value);
    app.querySelectorAll(`[data-content-warning="${CSS.escape(path)}"]`).forEach((element) => {
      element.textContent = warning;
      element.classList.toggle('is-visible', Boolean(warning));
    });
  };

  const focusAuthorField = (path) => {
    selectedPath = path;
    authorPanelOpen = true;
    const sectionForPath = path.startsWith('archiveSignal') ? 'archive'
      : path.startsWith('brand') || path.startsWith('status') || path.startsWith('footer') ? 'shared'
        : path.startsWith('director') || path.startsWith('scenes.briefing') ? 'briefing'
          : path.startsWith('protocol') || path.startsWith('scenes.oath') ? 'protocol'
            : path.startsWith('assignment') || path.startsWith('scenes.character') ? 'assignment'
              : 'current';
    authorSection = sectionForPath;
    render();
    const input = app.querySelector(`[data-content-input="${CSS.escape(path)}"]`);
    input?.focus();
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const render = () => {
    app.innerHTML = createMarkup(currentScene, content, authorMode, authorPanelOpen, authorSection, selectedPath);

    app.querySelector('[data-action="primary"]')?.addEventListener('click', (event) => {
      if (authorMode) {
        focusAuthorField(`scenes.${currentScene}.action`);
        return;
      }
      event.preventDefault();
      currentScene = nextScene(currentScene);
      authorSection = 'current';
      selectedPath = '';
      render();
    });

    app.querySelector('[data-action="secondary"]')?.addEventListener('click', (event) => {
      if (authorMode) {
        focusAuthorField(`scenes.${currentScene}.secondary`);
        return;
      }
      event.preventDefault();
      if (currentScene === 'welcome') currentScene = 'briefing';
      else if (currentScene === 'character') currentScene = 'oath';
      else currentScene = previousScene(currentScene);
      authorSection = 'current';
      selectedPath = '';
      render();
    });

    app.querySelector('[data-author-action="toggle"]')?.addEventListener('click', () => {
      authorMode = !authorMode;
      authorPanelOpen = authorMode;
      authorSection = 'current';
      selectedPath = '';
      render();
    });

    app.querySelectorAll('[data-author-action="close"]').forEach((button) => {
      button.addEventListener('click', () => {
        authorPanelOpen = false;
        selectedPath = '';
        render();
      });
    });

    app.querySelectorAll('[data-author-section]').forEach((button) => {
      button.addEventListener('click', () => {
        authorSection = button.dataset.authorSection;
        selectedPath = '';
        render();
      });
    });

    app.querySelectorAll('[data-content-input]').forEach((input) => {
      input.addEventListener('input', () => {
        const path = input.dataset.contentInput;
        const value = input.value;
        setAtPath(content, path, value);
        updateVisibleText(path, value);
        updateWarning(path, value);
      });
    });

    app.querySelector('[data-author-action="save"]')?.addEventListener('click', () => {
      writeLocalContent(STORAGE_KEY, content);
      const status = app.querySelector('#ciAuthorStatus');
      if (status) status.textContent = 'Saved locally in this browser. Export JSON when you are ready to commit a permanent default.';
    });

    app.querySelector('[data-author-action="export"]')?.addEventListener('click', () => {
      writeLocalContent(STORAGE_KEY, content);
      const date = new Date().toISOString().slice(0, 10);
      downloadContent(`chronicle-opening-content-${date}.json`, content);
      const status = app.querySelector('#ciAuthorStatus');
      if (status) status.textContent = 'JSON exported. Keep it as a draft or use it to update the repository default later.';
    });

    app.querySelector('[data-author-action="reset"]')?.addEventListener('click', () => {
      if (!window.confirm('Reset all locally edited opening copy to the repository defaults?')) return;
      clearLocalContent(STORAGE_KEY);
      content = clone(CHRONICLE_OPENING_DEFAULTS);
      selectedPath = '';
      render();
    });

    app.querySelector('#ciAuthorImport')?.addEventListener('change', async (event) => {
      const [file] = event.target.files;
      if (!file) return;
      try {
        content = await readImportedContent(file, CHRONICLE_OPENING_DEFAULTS);
        writeLocalContent(STORAGE_KEY, content);
        selectedPath = '';
        render();
      } catch {
        window.alert('That file could not be imported. Choose a Chronicle opening JSON export.');
      }
    });

    app.querySelectorAll('[data-content-path]').forEach((element) => {
      element.addEventListener('click', (event) => {
        if (!authorMode || element.matches('button')) return;
        event.preventDefault();
        event.stopPropagation();
        focusAuthorField(element.dataset.contentPath);
      });
    });
  };

  render();
}
