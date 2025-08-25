(function () {
  const API_URL = "https://atvkv.ch/wp-json/handballplugin/v1/shv-api?teamid=alle&typ=Spiele";
  let uploadedImageUrl = null;
  const fallbackImageUrl = "/mnt/data/1.png";

  function preloadLogos(logos, callback) {
    let loadedCount = 0;
    const images = [];
    if (!logos || logos.length === 0) {
      callback(images);
      return;
    }
    logos.forEach(function (logoSrc, index) {
      const img = new Image();
      img.onload = function () {
        images[index] = img;
        loadedCount++;
        if (loadedCount === logos.length) {
          callback(images);
        }
      };
      img.onerror = function () {
        loadedCount++;
        if (loadedCount === logos.length) {
          callback(images);
        }
      };
      img.src = logoSrc;
    });
  }

  function generatePreviewImage(selectedGames, modus) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = uploadedImageUrl || fallbackImageUrl;
    img.onload = function () {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      let y = 200;
      selectedGames.each(function () {
        const zeit = $(this).find('td:nth-child(1)').text();
        const ort = $(this).find('td:nth-child(2)').text();
        ctx.fillStyle = 'black';
        ctx.font = '30px Ruda';
        ctx.fillText(`${zeit} @ ${ort}`, 60, y);
        y += 80;
      });
      $('#spielBild').attr('src', canvas.toDataURL()).show();
    };
  }

  function generateReportImage(selectedGames) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = uploadedImageUrl || fallbackImageUrl;
    img.onload = function () {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const league = $(selectedGames[0]).find('td:nth-child(2)').text();
      const teamA = $(selectedGames[0]).find('td:nth-child(3)').text();
      const teamB = $(selectedGames[0]).find('td:nth-child(4)').text();
      ctx.fillStyle = 'black';
      ctx.font = '40px Ruda';
      ctx.fillText(league, 60, 100);
      ctx.fillText(`${teamA} vs ${teamB}`, 60, 180);
      $('#spielBild').attr('src', canvas.toDataURL()).show();
    };
  }

  $(document).ready(function () {
    $('#spieleLaden').on('click', function () {
      const selectedDate = $('#datumAuswahl').val();
      if (!selectedDate) {
        alert('Bitte ein Datum auswählen.');
        return;
      }
      $.getJSON(API_URL, function (data) {
        $('#spieleTabelle tbody').empty();
        const filteredData = data.filter(function (spiel) {
          return spiel.gameDateTime && spiel.gameDateTime.startsWith(selectedDate);
        });
        filteredData.sort(function (a, b) {
          return new Date(a.gameDateTime) - new Date(b.gameDateTime);
        });
        filteredData.forEach(function (spiel, index) {
          let row;
          if ($('#modusAuswahl').length) {
            row = `<tr>
              <td>${new Date(spiel.gameDateTime).toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})}</td>
              <td contenteditable="true">${spiel.venue}</td>
              <td contenteditable="true">${spiel.teamAName}</td>
              <td contenteditable="true">${spiel.teamBName}</td>
              <td contenteditable="true">${spiel.leagueShort}</td>
              <td><input type="checkbox" class="spielAuswahl" value="${index}"></td>
            </tr>`;
          } else {
            row = `<tr>
              <td contenteditable="true">${spiel.leagueShort}</td>
              <td contenteditable="true">${spiel.teamAName}</td>
              <td contenteditable="true">${spiel.teamBName}</td>
              <td contenteditable="true">0:0</td>
              <td class="hidden-column" contenteditable="true">${spiel.gameDateTime}</td>
              <td contenteditable="true">${spiel.venue}</td>
              <td><input type="checkbox" class="spielAuswahl" value="${index}"></td>
            </tr>`;
          }
          $('#spieleTabelle tbody').append(row);
        });
      }).fail(function () {
        alert('Fehler beim Abrufen der Spieldaten.');
      });
    });

    $('#hintergrundHochladen').on('change', function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          uploadedImageUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    $('#bildGenerieren').on('click', function () {
      const modus = $('#modusAuswahl').length ? $('#modusAuswahl').val() : null;
      const selectedGames = modus === 'turnier'
        ? $('#spieleTabelle tbody tr')
        : $('.spielAuswahl:checked').closest('tr');
      if (selectedGames.length === 0) {
        alert('Bitte mindestens ein Spiel auswählen.');
        return;
      }
      if ($('#modusAuswahl').length) {
        generatePreviewImage(selectedGames, modus);
      } else {
        generateReportImage(selectedGames);
      }
    });
  });

  window.App = {
    preloadLogos,
    generatePreviewImage,
    generateReportImage
  };
})();
