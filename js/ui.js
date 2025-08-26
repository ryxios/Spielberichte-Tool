export function initUI(fetchGames, generateImage) {
    let uploadedImageUrl = null;

    document.querySelector('#spieleLaden').addEventListener('click', async () => {
        const selectedDate = document.querySelector('#datumAuswahl').value;
        if (selectedDate) {
            try {
                const games = await fetchGames(selectedDate);
                renderGamesTable(games);
            } catch (error) {
                alert("Fehler beim Abrufen der Spieldaten.");
            }
        } else {
            alert("Bitte ein Datum auswählen.");
        }
    });

    document.querySelector('#hintergrundHochladen').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImageUrl = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    document.querySelector('#bildGenerieren').addEventListener('click', () => {
        const modus = document.querySelector('#modusAuswahl').value;
        const selectedGames = modus === 'turnier'
            ? Array.from(document.querySelectorAll('#spieleTabelle tbody tr'))
            : Array.from(document.querySelectorAll('.spielAuswahl:checked')).map(cb => cb.closest('tr'));
        if (selectedGames.length > 0) {
            generateImage(selectedGames, modus, uploadedImageUrl);
        } else {
            alert("Bitte mindestens ein Spiel auswählen.");
        }
    });
}

function renderGamesTable(games) {
    const tbody = document.querySelector('#spieleTabelle tbody');
    tbody.innerHTML = '';
    games.forEach((spiel, index) => {
        const spielRow = `<tr>
            <td>${new Date(spiel.gameDateTime).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})}</td>
            <td contenteditable="true">${spiel.venue}</td>
            <td contenteditable="true">${spiel.teamAName}</td>
            <td contenteditable="true">${spiel.teamBName}</td>
            <td contenteditable="true">${spiel.leagueShort}</td>
            <td><input type="checkbox" class="spielAuswahl" value="${index}"></td>
        </tr>`;
        tbody.insertAdjacentHTML('beforeend', spielRow);
    });
}
