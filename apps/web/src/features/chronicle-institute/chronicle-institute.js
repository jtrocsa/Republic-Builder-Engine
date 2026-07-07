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

const scenes = {
  welcome: {
    eyebrow: 'Republic Builder Engine',
    title: 'Chronicle',
    subtitle: 'An AP U.S. History Adventure',
    body: 'The past is not a list of dates. It is a record waiting to be investigated.',
    action: 'Begin Orientation',
    secondary: 'What is Chronicle?'
  },
  briefing: {
    eyebrow: 'Chronicle Institute — Orientation Briefing',
    title: 'The archive needs a Chronicler.',
    subtitle: 'A historical investigation begins with a question.',
    body: 'The Chronicle Institute preserves humanity’s understanding of the past. The Archive has detected instability in the historical record. Your task is not to change history, but to investigate it, collect evidence, and report what can be proven.',
    action: 'Continue Briefing',
    secondary: 'Return to title'
  },
  oath: {
    eyebrow: 'Chronicle Institute — Field Protocol',
    title: 'Welcome, Chronicler.',
    subtitle: 'Listen. Investigate. Report.',
    body: 'Your first assignment will open in Unit 1: The Atlantic Crossroads. Before you travel, the Institute must prepare your field identity.',
    action: 'Create Chronicler',
    secondary: 'Review briefing'
  },
  character: {
    eyebrow: 'Milestone 2 Preview',
    title: 'Your Chronicle identity comes next.',
    subtitle: 'Character creation is the next build milestone.',
    body: 'In the completed version, this is where a student will choose a name, pronouns, and basic appearance before receiving their Chronicle Codex. For now, this confirms that the opening flow is wired correctly.',
    action: 'Return to Orientation',
    secondary: 'View first assignment'
  }
};

const assignment = {
  unit: 'Unit 1 · Period 1: 1491–1607',
  title: 'The Atlantic Crossroads',
  description: 'Investigate how contact between Europe, Africa, and the Americas began to reshape societies on both sides of the Atlantic.',
  details: ['Chronicle Institute briefing', 'Field arrival in the Caribbean', 'Evidence collection', 'Exchange Ledger activity', 'AP-style MCQ + SAQ report']
};

function createMarkup(sceneKey) {
  const scene = scenes[sceneKey];
  const sidePanel = sceneKey === 'welcome'
    ? `
      <div class="ci-archive-card ci-archive-card--open">
        <div class="ci-card-kicker">Archive Signal</div>
        <div class="ci-card-line"></div>
        <p class="ci-card-year">1491</p>
        <h2>New record detected</h2>
        <p>The Atlantic world is about to change. The Institute requires an observer.</p>
        <div class="ci-card-tag">Case 1.01 queued</div>
      </div>`
    : sceneKey === 'briefing'
      ? `
        <div class="ci-director-card">
          <div class="ci-director-portrait" aria-hidden="true">
            <span class="ci-portrait-glow"></span>
            <span class="ci-portrait-head"></span>
            <span class="ci-portrait-coat"></span>
          </div>
          <div>
            <p class="ci-card-kicker">Institute Director</p>
            <h2>The Director</h2>
            <p>“History does not need another hero. It needs a careful witness.”</p>
          </div>
        </div>`
      : sceneKey === 'oath'
        ? `
          <div class="ci-protocol-grid" aria-label="Chronicle Institute protocol">
            <article><span>01</span><h2>Observe</h2><p>Enter historical settings without altering them.</p></article>
            <article><span>02</span><h2>Source</h2><p>Ask who created each record, why, and for whom.</p></article>
            <article><span>03</span><h2>Report</h2><p>Use evidence to explain what can be proven.</p></article>
          </div>`
        : `
          <div class="ci-assignment-card">
            <p class="ci-card-kicker">First Assignment</p>
            <p class="ci-assignment-unit">${assignment.unit}</p>
            <h2>${assignment.title}</h2>
            <p>${assignment.description}</p>
            <ul>${assignment.details.map((detail) => `<li>${detail}</li>`).join('')}</ul>
          </div>`;

  return `
    <div class="ci-shell" data-scene="${sceneKey}">
      <div class="ci-noise" aria-hidden="true"></div>
      <div class="ci-orbit ci-orbit--one" aria-hidden="true"></div>
      <div class="ci-orbit ci-orbit--two" aria-hidden="true"></div>
      <header class="ci-topbar">
        <div class="ci-brand" aria-label="Republic Builder Engine: Chronicle">
          ${sealMarkup}
          <div>
            <span>Republic Builder Engine</span>
            <strong>Chronicle</strong>
          </div>
        </div>
        <div class="ci-topbar-status">
          <span class="ci-status-dot" aria-hidden="true"></span>
          <span>Institute link stable</span>
        </div>
      </header>

      <main class="ci-stage">
        <section class="ci-copy" aria-live="polite">
          <p class="ci-eyebrow">${scene.eyebrow}</p>
          <h1>${scene.title}</h1>
          <p class="ci-subtitle">${scene.subtitle}</p>
          <p class="ci-body">${scene.body}</p>
          <div class="ci-actions">
            <button class="ci-button ci-button--primary" type="button" data-action="primary">${scene.action}<span aria-hidden="true">→</span></button>
            <button class="ci-button ci-button--secondary" type="button" data-action="secondary">${scene.secondary}</button>
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
          ${sidePanel}
        </aside>
      </main>

      <footer class="ci-footer">
        <span>Chronicle Institute orientation build</span>
        <span>Milestone 1 · Opening sequence</span>
      </footer>
    </div>
  `;
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

  const render = () => {
    app.innerHTML = createMarkup(currentScene);

    app.querySelector('[data-action="primary"]')?.addEventListener('click', () => {
      currentScene = nextScene(currentScene);
      render();
    });

    app.querySelector('[data-action="secondary"]')?.addEventListener('click', () => {
      if (currentScene === 'welcome') {
        currentScene = 'briefing';
      } else if (currentScene === 'character') {
        currentScene = 'oath';
      } else {
        currentScene = previousScene(currentScene);
      }
      render();
    });
  };

  render();
}
