import { fetchGames } from './api.js';
import { initUI } from './ui.js';
import { generateImage } from './imageGenerator.js';

document.addEventListener('DOMContentLoaded', () => {
    initUI(fetchGames, generateImage);
});
