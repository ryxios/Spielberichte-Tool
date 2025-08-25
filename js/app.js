const API_URL = "https://atvkv.ch/wp-json/handballplugin/v1/shv-api?teamid=alle&typ=Spiele";
let uploadedImageUrl = null;

function showMessage(msg) {
  const el = document.getElementById('message');
  if (el) {
    el.textContent = msg;
  }
}

function clearMessage() {
  const el = document.getElementById('message');
  if (el) {
    el.textContent = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const spieleLadenBtn = document.getElementById('spieleLaden');
  const hintergrundHochladen = document.getElementById('hintergrundHochladen');
  const bildGenerierenBtn = document.getElementById('bildGenerieren');

  spieleLadenBtn.addEventListener('click', async () => {
    clearMessage();
    const selectedDate = document.getElementById('datumAuswahl').value;
    if (!selectedDate) {
      showMessage('Bitte ein Datum auswählen.');
      return;
    }
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const tbody = document.querySelector('#spieleTabelle tbody');
      tbody.innerHTML = '';
      const filteredData = data.filter(spiel => spiel.gameDateTime && spiel.gameDateTime.startsWith(selectedDate));
      if (filteredData.length > 0) {
        filteredData.sort((a, b) => new Date(a.gameDateTime) - new Date(b.gameDateTime));
        filteredData.forEach((spiel, index) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${new Date(spiel.gameDateTime).toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})}</td>
            <td contenteditable="true">${spiel.venue}</td>
            <td contenteditable="true">${spiel.teamAName}</td>
            <td contenteditable="true">${spiel.teamBName}</td>
            <td contenteditable="true">${spiel.leagueShort}</td>
            <td><input type="checkbox" class="spielAuswahl" value="${index}"></td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        showMessage('Keine Spiele für das ausgewählte Datum gefunden.');
      }
    } catch (err) {
      console.error(err);
      showMessage('Fehler beim Abrufen der Spieldaten.');
    }
  });

  hintergrundHochladen.addEventListener('change', event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        uploadedImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  bildGenerierenBtn.addEventListener('click', () => {
    clearMessage();
    const modus = document.getElementById('modusAuswahl').value;
    const selectedGames = modus === 'turnier'
      ? Array.from(document.querySelectorAll('#spieleTabelle tbody tr'))
      : Array.from(document.querySelectorAll('.spielAuswahl:checked')).map(cb => cb.closest('tr'));
    if (selectedGames.length > 0) {
      generateImage(selectedGames, modus);
    } else {
      showMessage('Bitte mindestens ein Spiel auswählen.');
    }
  });
});

function generateImage(selectedGames, modus) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.src = uploadedImageUrl ? uploadedImageUrl : '/mnt/data/1.png';

  img.onload = function() {
    const targetAspectRatio = 4 / 5;
    let imgWidth = img.width;
    let imgHeight = img.height;
    let cropWidth, cropHeight, offsetX, offsetY;

    if (imgWidth / imgHeight > targetAspectRatio) {
      cropHeight = imgHeight;
      cropWidth = imgHeight * targetAspectRatio;
      offsetX = (imgWidth - cropWidth) / 2;
      offsetY = 0;
    } else {
      cropWidth = imgWidth;
      cropHeight = imgWidth / targetAspectRatio;
      offsetX = 0;
      offsetY = (imgHeight - cropHeight) / 2;
    }

    ctx.filter = 'grayscale(100%) blur(2px)';
    ctx.drawImage(img, offsetX, offsetY, cropWidth, cropHeight, 0, 150, canvas.width, 1050);
    ctx.filter = 'none';

    const bildTitel = modus === 'turnier'
      ? (document.getElementById('titelEingabe').value || 'Turnier')
      : (document.getElementById('titelEingabe').value || 'Heimspiele');
    const selectedDate = document.getElementById('datumAuswahl').value;
    const datumText = new Date(selectedDate).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillStyle = '#2C4A9A';
    ctx.fillRect(0, 0, canvas.width, 180);
    ctx.font = 'bold 60px Ruda';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bildTitel, canvas.width / 2, 70);
    ctx.font = '40px Ruda';
    ctx.fillText(datumText, canvas.width / 2, 130);

    const totalHeight = selectedGames.length * 140;
    let yPosition = 150 + (1050 - totalHeight) / 2;
    selectedGames.forEach(game => {
      const zeit = game.querySelector('td:nth-child(1)').textContent;
      const ort = game.querySelector('td:nth-child(2)').textContent;
      const teamA = game.querySelector('td:nth-child(3)').textContent;
      const teamB = game.querySelector('td:nth-child(4)').textContent;
      const liga = modus === 'normal' ? game.querySelector('td:nth-child(5)').textContent : '';

      ctx.fillStyle = 'rgba(44, 74, 154, 0.85)';
      ctx.fillRect(50, yPosition, 980, 60);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 30px Ruda';
      ctx.textAlign = 'left';
      ctx.fillText(`${zeit} @ ${ort}`, 60, yPosition + 40);
      yPosition += 60;
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = 'white';
      ctx.fillRect(50, yPosition, 980, 60);
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'black';
      ctx.font = '30px Ruda';
      ctx.fillText(`${liga ? liga + ' - ' : ''}${teamA} vs ${teamB}`, 60, yPosition + 40);
      yPosition += 80;
    });

    const imageUrl = canvas.toDataURL('image/jpeg');
    const imgEl = document.getElementById('spielBild');
    imgEl.src = imageUrl;
    imgEl.style.display = 'block';
  };
}
