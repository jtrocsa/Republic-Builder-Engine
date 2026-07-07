import './styles/global.css';
import { mountChronicleInstitute } from './features/chronicle-institute/chronicle-institute.js';

const app = document.querySelector('#app');
if (!app) {
  throw new Error('Republic Builder could not find the #app mount point.');
}

mountChronicleInstitute(app);
