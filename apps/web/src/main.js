import './styles/global.css';

const app = document.querySelector('#app');

if (app) {
  app.innerHTML = `
    <main class="foundation-screen">
      <p class="eyebrow">Republic Builder Engine</p>
      <h1>Chronicle Foundation</h1>
      <p>Repository structure is ready. The first playable case is <strong>The Atlantic Crossroads</strong>.</p>
    </main>
  `;
}
