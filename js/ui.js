export function initUI(fetchGames, generateImage) {
    let uploadedImageUrl = null;

    $('#spieleLaden').on('click', async function() {
        const selectedDate = $('#datumAuswahl').val();
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

    $('#hintergrundHochladen').on('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedImageUrl = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    $('#bildGenerieren').on('click', function() {
        const modus = $('#modusAuswahl').val();
        const selectedGames = modus === 'turnier' ? $('#spieleTabelle tbody tr') : $('.spielAuswahl:checked').closest('tr');
        if (selectedGames.length > 0) {
            generateImage(selectedGames, modus, uploadedImageUrl);
        } else {
            alert("Bitte mindestens ein Spiel auswählen.");
        }
    });
}

function renderGamesTable(games) {
    $('#spieleTabelle tbody').empty();
    games.forEach(function(spiel, index) {
        const spielRow = `<tr>
            <td>${new Date(spiel.gameDateTime).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})}</td>
            <td contenteditable="true">${spiel.venue}</td>
            <td contenteditable="true">${spiel.teamAName}</td>
            <td contenteditable="true">${spiel.teamBName}</td>
            <td contenteditable="true">${spiel.leagueShort}</td>
            <td><input type="checkbox" class="spielAuswahl" value="${index}"></td>
        </tr>`;
        $('#spieleTabelle tbody').append(spielRow);
    });
}
