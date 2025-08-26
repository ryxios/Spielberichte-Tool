import { fetchGames } from './api.js';
import { initUI } from './ui.js';
import { generateImage } from './imageGenerator.js';

$(document).ready(function () {
  initUI(fetchGames, generateImage);
});
