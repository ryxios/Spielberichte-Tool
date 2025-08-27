import { fetchGames } from './api.js';
import { initUI } from './ui.js';
import { generateImage } from './imageGenerator.js';

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#vorschau')) {
        initUI(fetchGames, generateImage);
    }
});
