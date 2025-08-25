import { API_URL } from '../config.js';
import { initApp } from './app.js';

$(document).ready(function () {
  initApp(API_URL);
});

