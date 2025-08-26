import { API_URL } from '../config.js';

export async function fetchGames(date) {
    const response = await fetch(API_URL);
    const data = await response.json();
    const filteredData = data.filter(spiel => spiel.gameDateTime && spiel.gameDateTime.startsWith(date));
    filteredData.sort((a, b) => new Date(a.gameDateTime) - new Date(b.gameDateTime));
    return filteredData;
}
